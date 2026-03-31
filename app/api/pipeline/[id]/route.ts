import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth()
  if (error) return error

  const pipeline = await prisma.pipeline.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!pipeline) return apiError('Pipeline not found', 404)
  return apiSuccess(pipeline)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  const body = await req.json()

  const pipeline = await prisma.pipeline.update({
    where: { id: params.id },
    data: {
      name: body.name,
      staleAfterDays: body.staleAfterDays,
      isDefault: body.isDefault,
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  })

  return apiSuccess(pipeline)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  await prisma.pipeline.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
