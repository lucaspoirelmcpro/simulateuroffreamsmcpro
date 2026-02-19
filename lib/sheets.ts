import { google } from 'googleapis'
import { decrypt } from './auth'
import { prisma } from './prisma'
import { ColumnMapping } from '@/types'
import { hashRow } from './utils'

function getAuth(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return auth
}

export interface SheetRow {
  rowIndex: number
  values: Record<string, string>
}

/**
 * List available spreadsheets in the user's Drive
 */
export async function listSpreadsheets(accessToken: string) {
  const auth = getAuth(accessToken)
  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id,name,modifiedTime)',
    pageSize: 50,
  })

  return res.data.files ?? []
}

/**
 * List tabs (sheets) in a spreadsheet
 */
export async function listTabs(accessToken: string, sheetId: string) {
  const auth = getAuth(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: 'sheets.properties',
  })

  return (
    res.data.sheets?.map((s) => ({
      id: s.properties?.sheetId,
      title: s.properties?.title,
    })) ?? []
  )
}

/**
 * Read a tab and return rows as objects with header keys
 */
export async function readTab(
  accessToken: string,
  sheetId: string,
  tabName: string
): Promise<{ headers: string[]; rows: SheetRow[] }> {
  const auth = getAuth(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName,
  })

  const values = res.data.values ?? []
  if (values.length === 0) return { headers: [], rows: [] }

  const headers = values[0].map(String)
  const rows: SheetRow[] = values.slice(1).map((row, idx) => {
    const rowValues: Record<string, string> = {}
    headers.forEach((h, i) => {
      rowValues[h] = row[i] ? String(row[i]) : ''
    })
    return { rowIndex: idx + 2, values: rowValues } // +2: 1 for header, 1 for 1-based
  })

  return { headers, rows }
}

/**
 * Map a sheet row to a Contact object using column mapping
 */
export function mapRowToContact(
  row: Record<string, string>,
  mapping: ColumnMapping
): Partial<{
  firstname: string
  lastname: string
  email: string
  phone: string
  title: string
  department: string
  country: string
  orgName: string
  owner: string
  source: string
  tags: string[]
  rowId: string
}> {
  const get = (col: string | undefined) => (col ? row[col] ?? '' : '')

  const tagsRaw = get(mapping.tags)
  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return {
    firstname: get(mapping.firstname),
    lastname: get(mapping.lastname),
    email: get(mapping.email) || undefined,
    phone: get(mapping.phone) || undefined,
    title: get(mapping.title) || undefined,
    department: get(mapping.department) || undefined,
    country: get(mapping.country) || undefined,
    orgName: get(mapping.org) || undefined,
    owner: get(mapping.owner) || undefined,
    source: 'SHEETS',
    tags,
    rowId: mapping.rowId ? get(mapping.rowId) : undefined,
  }
}

/**
 * Import/sync contacts from Google Sheets
 */
export async function syncFromSheets(userId: string): Promise<{
  created: number
  updated: number
  skipped: number
}> {
  const settings = await prisma.integrationSettings.findUnique({
    where: { userId },
  })

  if (!settings?.sheetsEnabled || !settings.sheetId || !settings.tabName) {
    throw new Error('Google Sheets not configured')
  }

  const accessToken = settings.googleAccessToken
    ? decrypt(settings.googleAccessToken)
    : null
  if (!accessToken) throw new Error('No Google access token')

  const mapping: ColumnMapping = (settings.columnMapping as ColumnMapping) ?? {}
  const { rows } = await readTab(accessToken, settings.sheetId, settings.tabName)

  let created = 0
  let updated = 0
  let skipped = 0

  const prevHashes: Record<string, string> =
    (settings.lastSheetsRowHash as Record<string, string>) ?? {}
  const newHashes: Record<string, string> = {}

  for (const row of rows) {
    const rowKey = String(row.rowIndex)
    const rowHash = hashRow(row.values)
    newHashes[rowKey] = rowHash

    // Skip unchanged rows
    if (prevHashes[rowKey] === rowHash) {
      skipped++
      continue
    }

    const mapped = mapRowToContact(row.values, mapping)
    if (!mapped.lastname && !mapped.firstname) {
      skipped++
      continue
    }

    // Find or create Org
    let orgId: string | undefined
    if (mapped.orgName) {
      const org = await prisma.org.upsert({
        where: { name: mapped.orgName } as any,
        create: { name: mapped.orgName },
        update: {},
      })
      orgId = org.id
    }

    const email = mapped.email || undefined

    // Try to find existing contact by email or sheetRowId
    const existingByEmail = email
      ? await prisma.contact.findFirst({ where: { email } })
      : null
    const existingByRow = mapped.rowId
      ? await prisma.contact.findFirst({ where: { sheetRowId: mapped.rowId } })
      : null
    const existing = existingByEmail ?? existingByRow

    if (existing) {
      await prisma.contact.update({
        where: { id: existing.id },
        data: {
          firstname: mapped.firstname || existing.firstname,
          lastname: mapped.lastname || existing.lastname,
          email: email ?? existing.email,
          phone: mapped.phone ?? existing.phone,
          title: mapped.title ?? existing.title,
          department: mapped.department ?? existing.department,
          country: mapped.country ?? existing.country,
          orgId: orgId ?? existing.orgId,
          tags: mapped.tags?.length ? mapped.tags : existing.tags,
          sheetRowId: mapped.rowId ?? existing.sheetRowId,
        },
      })
      updated++
    } else {
      await prisma.contact.create({
        data: {
          firstname: mapped.firstname || 'Inconnu',
          lastname: mapped.lastname || '',
          email,
          phone: mapped.phone,
          title: mapped.title,
          department: mapped.department,
          country: mapped.country,
          orgId,
          tags: mapped.tags ?? [],
          source: 'SHEETS',
          sheetRowId: mapped.rowId,
        },
      })
      created++
    }
  }

  // Update sync state
  await prisma.integrationSettings.update({
    where: { userId },
    data: {
      lastSheetsSyncAt: new Date(),
      lastSheetsRowHash: newHashes,
    },
  })

  return { created, updated, skipped }
}

/**
 * Push stage/owner info back to Google Sheet
 */
export async function pushToSheet(
  userId: string,
  contactId: string,
  updates: { stage?: string; owner?: string; nextStep?: string }
): Promise<void> {
  const settings = await prisma.integrationSettings.findUnique({
    where: { userId },
  })
  if (!settings?.pushEnabled || !settings.sheetId || !settings.tabName) return

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { sheetRowId: true },
  })
  if (!contact?.sheetRowId) return

  const mapping: ColumnMapping = (settings.columnMapping as ColumnMapping) ?? {}
  const accessToken = settings.googleAccessToken
    ? decrypt(settings.googleAccessToken)
    : null
  if (!accessToken) return

  const auth = getAuth(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const promises: Promise<any>[] = []

  // Push stage
  if (updates.stage && mapping.stage) {
    // Find the column letter for the stage column
    // This requires knowing the header row; simplified version:
    const range = `${settings.tabName}!${mapping.stage}${contact.sheetRowId}`
    promises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: settings.sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[updates.stage]] },
      })
    )
  }

  await Promise.allSettled(promises)
}
