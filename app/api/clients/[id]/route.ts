import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateClientSchema = z.object({
  name: z.string().min(1, 'اسم العميل مطلوب'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateClientSchema.parse(body)

    // Ensure unique email if provided
    if (data.email) {
      const exists = await prisma.client.findFirst({
        where: { email: data.email, NOT: { id } },
        select: { id: true }
      })
      if (exists) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        note: data.note || null,
      },
      include: {
        _count: {
          select: { contracts: true, projects: true, installments: true }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Client',
        entityId: client.id,
        meta: { name: client.name, email: client.email }
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث العميل' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Optionally: check for dependent records and handle cascades
    await prisma.client.delete({ where: { id } })

    await prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'Client', entityId: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف العميل' }, { status: 500 })
  }
}

