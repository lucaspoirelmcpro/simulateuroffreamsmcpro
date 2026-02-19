import { google } from 'googleapis'
import { decrypt } from './auth'
import { prisma } from './prisma'
import { recomputeMetrics } from './metrics'

function getAuth(accessToken: string, refreshToken?: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return auth
}

/**
 * Sync Gmail threads for all contacts of a user
 */
export async function syncGmailForUser(userId: string): Promise<{
  threadsProcessed: number
  interactionsCreated: number
}> {
  const settings = await prisma.integrationSettings.findUnique({
    where: { userId },
  })
  if (!settings?.gmailEnabled || !settings.googleAccessToken) {
    throw new Error('Gmail not enabled or no access token')
  }

  const accessToken = decrypt(settings.googleAccessToken)
  const refreshToken = settings.googleRefreshToken
    ? decrypt(settings.googleRefreshToken)
    : undefined

  const auth = getAuth(accessToken, refreshToken)
  const gmail = google.gmail({ version: 'v1', auth })

  // Get all contact emails for this user's contacts
  const contacts = await prisma.contact.findMany({
    where: {
      email: { not: null },
      ownerId: userId,
    },
    select: { id: true, email: true },
  })

  let threadsProcessed = 0
  let interactionsCreated = 0

  for (const contact of contacts) {
    if (!contact.email) continue

    try {
      const result = await syncThreadsForContact(
        gmail,
        contact.id,
        contact.email
      )
      threadsProcessed += result.threadsProcessed
      interactionsCreated += result.interactionsCreated
    } catch (e) {
      console.error(`Gmail sync failed for contact ${contact.id}:`, e)
    }
  }

  await prisma.integrationSettings.update({
    where: { userId },
    data: { lastGmailSyncAt: new Date() },
  })

  return { threadsProcessed, interactionsCreated }
}

async function syncThreadsForContact(
  gmail: ReturnType<typeof google.gmail>,
  contactId: string,
  email: string
): Promise<{ threadsProcessed: number; interactionsCreated: number }> {
  // Search threads involving this email
  const threadsRes = await gmail.users.threads.list({
    userId: 'me',
    q: `from:${email} OR to:${email}`,
    maxResults: 50,
  })

  const threads = threadsRes.data.threads ?? []
  let threadsProcessed = 0
  let interactionsCreated = 0

  for (const thread of threads) {
    if (!thread.id) continue

    try {
      const threadData = await gmail.users.threads.get({
        userId: 'me',
        id: thread.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'To', 'Date'],
      })

      const messages = threadData.data.messages ?? []
      if (messages.length === 0) continue

      const lastMessage = messages[messages.length - 1]
      const firstMessage = messages[0]

      // Determine subject
      const subject =
        firstMessage.payload?.headers?.find((h) => h.name === 'Subject')
          ?.value ?? null

      // Detect sent vs received
      let lastSentAt: Date | null = null
      let lastReceivedAt: Date | null = null
      let hasReply = false
      let replyAt: Date | null = null

      const newInteractions: {
        type: 'EMAIL_OUT' | 'EMAIL_IN'
        occurredAt: Date
        externalId: string
      }[] = []

      for (const msg of messages) {
        if (!msg.id || !msg.internalDate) continue

        const msgDate = new Date(parseInt(msg.internalDate))
        const labels = msg.labelIds ?? []

        const isSent = labels.includes('SENT')
        const isInbox = labels.includes('INBOX') || labels.includes('UNREAD')

        if (isSent) {
          lastSentAt = msgDate
        } else if (isInbox) {
          lastReceivedAt = msgDate
        }

        // Check if this interaction already exists
        const existingInteraction = await prisma.interaction.findFirst({
          where: { externalId: msg.id },
        })
        if (existingInteraction) continue

        newInteractions.push({
          type: isSent ? 'EMAIL_OUT' : 'EMAIL_IN',
          occurredAt: msgDate,
          externalId: msg.id,
        })
      }

      // Detect reply: inbox message after sent message
      if (lastSentAt && lastReceivedAt && lastReceivedAt > lastSentAt) {
        hasReply = true
        replyAt = lastReceivedAt
      }

      const lastMessageDate = lastMessage.internalDate
        ? new Date(parseInt(lastMessage.internalDate))
        : null

      // Upsert EmailThread
      const existingThread = await prisma.emailThread.findFirst({
        where: { contactId, threadId: thread.id },
      })

      if (existingThread) {
        await prisma.emailThread.update({
          where: { id: existingThread.id },
          data: {
            subject,
            snippet: threadData.data.snippet?.substring(0, 200),
            lastMessageAt: lastMessageDate,
            lastSentAt,
            hasReply,
            replyAt,
            labels: lastMessage.labelIds ?? [],
            messagesCount: messages.length,
          },
        })
      } else {
        await prisma.emailThread.create({
          data: {
            contactId,
            threadId: thread.id,
            subject,
            snippet: threadData.data.snippet?.substring(0, 200),
            lastMessageAt: lastMessageDate,
            lastSentAt,
            hasReply,
            replyAt,
            labels: lastMessage.labelIds ?? [],
            messagesCount: messages.length,
          },
        })
      }

      // Create new interactions
      for (const interaction of newInteractions) {
        await prisma.interaction.create({
          data: {
            contactId,
            type: interaction.type,
            occurredAt: interaction.occurredAt,
            source: 'GMAIL',
            externalId: interaction.externalId,
            summary:
              interaction.type === 'EMAIL_OUT'
                ? `Email envoyé: ${subject ?? '(sans sujet)'}`
                : `Email reçu: ${subject ?? '(sans sujet)'}`,
            payloadJson: { threadId: thread.id, subject },
          },
        })
        interactionsCreated++
      }

      threadsProcessed++
    } catch (e) {
      console.error(`Error processing thread ${thread.id}:`, e)
    }
  }

  // Recompute metrics for contact
  if (threadsProcessed > 0) {
    await recomputeMetrics(contactId)
  }

  return { threadsProcessed, interactionsCreated }
}
