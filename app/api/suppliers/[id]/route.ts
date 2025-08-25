import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSupplierSchema = z.object({
  name: z.string().min(1, 'اسم المورد مطلوب'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateSupplierSchema.parse(body)

    // Enforce email uniqueness if provided
    if (data.email) {
      const exists = await prisma.supplier.findFirst({
        where: { email: data.email, NOT: { id } },
        select: { id: true }
      })
      if (exists) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        note: data.note || null,
      },
      include: {
        _count: { select: { expenses: true, invoices: true } }
      }
    })

    await prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Supplier', entityId: supplier.id, meta: { name: supplier.name } }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error updating supplier:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث المورد' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.supplier.delete({ where: { id } })
    await prisma.auditLog.create({ data: { action: 'DELETE', entity: 'Supplier', entityId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف المورد' }, { status: 500 })
  }
}

