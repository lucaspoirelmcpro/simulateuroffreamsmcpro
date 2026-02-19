import { prisma } from './prisma'
import { decrypt } from './auth'
import { recomputeMetrics } from './metrics'

const SELLSY_API_BASE = 'https://api.sellsy.com/v2'

interface SellsyTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
}

async function getTokens(userId: string): Promise<SellsyTokens | null> {
  const settings = await prisma.integrationSettings.findUnique({
    where: { userId },
  })
  if (!settings?.sellsyEnabled || !settings.sellsyAccessToken) return null

  return {
    accessToken: decrypt(settings.sellsyAccessToken),
    refreshToken: settings.sellsyRefreshToken
      ? decrypt(settings.sellsyRefreshToken)
      : undefined,
    expiresAt: settings.sellsyTokenExpiry ?? undefined,
  }
}

async function sellsyFetch<T>(
  endpoint: string,
  tokens: SellsyTokens,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${SELLSY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sellsy API error ${res.status}: ${err}`)
  }

  return res.json()
}

/**
 * Search for a contact/person in Sellsy by email
 */
export async function findSellsyPerson(
  tokens: SellsyTokens,
  email: string
): Promise<{ id: string; name: string } | null> {
  try {
    const res = await sellsyFetch<{ data: any[] }>(
      `/contacts?filters[email]=${encodeURIComponent(email)}&limit=1`,
      tokens
    )
    if (res.data?.length > 0) {
      const p = res.data[0]
      return { id: String(p.id), name: `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim() }
    }
  } catch (e) {
    console.error('findSellsyPerson error:', e)
  }
  return null
}

/**
 * Get opportunities linked to a Sellsy person/company
 */
export async function getSellsyOpportunities(
  tokens: SellsyTokens,
  personId?: string,
  companyId?: string
): Promise<
  {
    id: string
    name: string
    stage: string
    amount: number
    closeDate?: string
    status: string
  }[]
> {
  try {
    const filters = personId
      ? `filters[linked_contact_id]=${personId}`
      : `filters[linked_company_id]=${companyId}`

    const res = await sellsyFetch<{ data: any[] }>(
      `/opportunities?${filters}&limit=10`,
      tokens
    )

    return (res.data ?? []).map((opp: any) => ({
      id: String(opp.id),
      name: opp.name ?? '',
      stage: opp.pipeline_step?.label ?? opp.status ?? '',
      amount: parseFloat(opp.amount ?? '0'),
      closeDate: opp.close_date ?? undefined,
      status: opp.status ?? 'in_progress',
    }))
  } catch (e) {
    console.error('getSellsyOpportunities error:', e)
    return []
  }
}

/**
 * Sync Sellsy data for all contacts of a user
 */
export async function syncSellsyForUser(userId: string): Promise<{
  synced: number
  errors: number
}> {
  const tokens = await getTokens(userId)
  if (!tokens) throw new Error('Sellsy not configured')

  const contacts = await prisma.contact.findMany({
    where: {
      email: { not: null },
      ownerId: userId,
    },
    select: { id: true, email: true, org: { select: { domain: true } } },
  })

  let synced = 0
  let errors = 0

  for (const contact of contacts) {
    if (!contact.email) continue

    try {
      // Find person in Sellsy
      const person = await findSellsyPerson(tokens, contact.email)
      if (!person) continue

      // Get opportunities
      const opps = await getSellsyOpportunities(tokens, person.id)
      const mainOpp = opps[0] // Take first/main opportunity

      // Upsert SellsyLink
      await prisma.sellsyLink.upsert({
        where: { contactId: contact.id },
        create: {
          contactId: contact.id,
          sellsyPersonId: person.id,
          sellsyOpportunityId: mainOpp?.id,
          sellsyStage: mainOpp?.stage,
          amount: mainOpp?.amount,
          closeDate: mainOpp?.closeDate ? new Date(mainOpp.closeDate) : null,
          lastSyncAt: new Date(),
        },
        update: {
          sellsyPersonId: person.id,
          sellsyOpportunityId: mainOpp?.id,
          sellsyStage: mainOpp?.stage,
          amount: mainOpp?.amount,
          closeDate: mainOpp?.closeDate ? new Date(mainOpp.closeDate) : null,
          lastSyncAt: new Date(),
        },
      })

      // Create Sellsy interaction if opportunity exists
      if (mainOpp) {
        const existingInteraction = await prisma.interaction.findFirst({
          where: {
            contactId: contact.id,
            type: 'SELLSY_EVENT',
            externalId: `sellsy_opp_${mainOpp.id}`,
          },
        })

        if (!existingInteraction) {
          await prisma.interaction.create({
            data: {
              contactId: contact.id,
              type: 'SELLSY_EVENT',
              occurredAt: new Date(),
              source: 'SELLSY',
              externalId: `sellsy_opp_${mainOpp.id}`,
              summary: `Opportunité Sellsy: ${mainOpp.name} (${mainOpp.stage})`,
              payloadJson: mainOpp as any,
            },
          })
        }
      }

      // Recompute metrics
      await recomputeMetrics(contact.id)
      synced++
    } catch (e) {
      console.error(`Sellsy sync error for contact ${contact.id}:`, e)
      errors++
    }
  }

  await prisma.integrationSettings.update({
    where: { userId },
    data: { lastSellsySyncAt: new Date() },
  })

  return { synced, errors }
}
