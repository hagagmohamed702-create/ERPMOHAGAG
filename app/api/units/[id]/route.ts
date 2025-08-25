import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateUnitSchema = z.object({
  projectId: z.string().optional(),
  name: z.string().optional().or(z.literal('')),
  type: z.string().optional(),
  floor: z.number().int().optional(),
  building: z.string().optional().or(z.literal('')),
  area: z.number().positive().optional(),
  price: z.number().positive().optional(),
  status: z.enum(['available', 'sold', 'reserved', 'cancelled']).optional(),
  notes: z.string().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateUnitSchema.parse(body)

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        projectId: data.projectId,
        name: data.name || null,
        type: data.type,
        floor: data.floor,
        building: data.building || null,
        area: data.area,
        price: data.price,
        status: data.status,
        notes: data.notes || null,
      },
      include: { project: true, _count: { select: { contracts: true } } }
    })

    await prisma.auditLog.create({ data: { action: 'UPDATE', entity: 'Unit', entityId: unit.id } })
    return NextResponse.json(unit)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error updating unit:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث الوحدة' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.unit.delete({ where: { id } })
    await prisma.auditLog.create({ data: { action: 'DELETE', entity: 'Unit', entityId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف الوحدة' }, { status: 500 })
  }
}

