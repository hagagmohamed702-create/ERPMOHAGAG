import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateWarehouseSchema = z.object({
  name: z.string().min(1, 'اسم المخزن مطلوب'),
  location: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateWarehouseSchema.parse(body)

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location || null,
        isActive: data.isActive ?? undefined,
      },
      include: { _count: { select: { materialMoves: true } } }
    })

    await prisma.auditLog.create({ data: { action: 'UPDATE', entity: 'Warehouse', entityId: warehouse.id } })
    return NextResponse.json(warehouse)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error updating warehouse:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث المخزن' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.warehouse.delete({ where: { id } })
    await prisma.auditLog.create({ data: { action: 'DELETE', entity: 'Warehouse', entityId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف المخزن' }, { status: 500 })
  }
}

