import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const updateMaterialSchema = z.object({
  name: z.string().min(1, 'اسم المادة مطلوب'),
  unit: z.string().min(1, 'وحدة القياس مطلوبة').optional(),
  minQuantity: z.number().min(0).optional(),
  category: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateMaterialSchema.parse(body)

    const material = await prisma.material.update({
      where: { id },
      data: {
        name: data.name,
        unit: data.unit,
        minQuantity: data.minQuantity !== undefined ? new Prisma.Decimal(data.minQuantity) : undefined,
        category: data.category || null,
        description: data.description || null,
      },
      include: { _count: { select: { materialMoves: true } } }
    })

    await prisma.auditLog.create({ data: { action: 'UPDATE', entity: 'Material', entityId: material.id } })
    return NextResponse.json(material)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error updating material:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث المادة' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.material.delete({ where: { id } })
    await prisma.auditLog.create({ data: { action: 'DELETE', entity: 'Material', entityId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting material:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف المادة' }, { status: 500 })
  }
}

