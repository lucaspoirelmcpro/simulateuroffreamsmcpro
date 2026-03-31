import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

const createOrgSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  segment: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '50')

  const where: Record<string, any> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { domain: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [orgs, total] = await Promise.all([
    prisma.org.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { contacts: true } },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.org.count({ where }),
  ])

  return apiSuccess({ data: orgs, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = createOrgSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const org = await prisma.org.create({
    data: {
      ...parsed.data,
      tags: parsed.data.tags ?? [],
    },
  })

  return apiSuccess(org, 201)
}
