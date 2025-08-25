import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateProjectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  clientId: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'completed', 'suspended']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive().optional(),
  description: z.string().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateProjectSchema.parse(body)

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        clientId: data.clientId || null,
        location: data.location || null,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget,
        description: data.description || null,
      },
      include: { client: true, _count: { select: { units: true, phases: true, contracts: true } } }
    })

    await prisma.auditLog.create({ data: { action: 'UPDATE', entity: 'Project', entityId: project.id } })
    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: error.errors }, { status: 400 })
    }
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث المشروع' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.project.delete({ where: { id } })
    await prisma.auditLog.create({ data: { action: 'DELETE', entity: 'Project', entityId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف المشروع' }, { status: 500 })
  }
}

