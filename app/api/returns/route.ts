import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReturnSchema = z.object({
  contractId: z.string().min(1, 'العقد مطلوب'),
  partnerId: z.string().optional(),
  date: z.string().transform(str => new Date(str)),
  amount: z.number().positive(),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  note: z.string().optional()
})

export async function GET() {
  try {
    const returns = await prisma.return.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contract: true,
        partner: true
      }
    })
    
    return NextResponse.json(returns)
  } catch (error) {
    console.error('Error fetching returns:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من البيانات
    const validatedData = createReturnSchema.parse(body)
    
    // التحقق من صحة العقد
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId }
    })
    
    if (!contract) {
      return NextResponse.json(
        { error: 'العقد غير موجود' },
        { status: 404 }
      )
    }
    
    if (contract.status !== 'active') {
      return NextResponse.json(
        { error: 'يمكن فقط إرجاع العقود النشطة' },
        { status: 400 }
      )
    }
    
    // إنشاء سجل الإرجاع
    const returnRecord = await prisma.return.create({
      data: validatedData,
      include: {
        contract: true,
        partner: true
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Return',
        entityId: returnRecord.id,
        meta: { 
          contractId: validatedData.contractId,
          amount: validatedData.amount,
          reason: validatedData.reason 
        }
      }
    })
    
    return NextResponse.json(returnRecord, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating return:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الإرجاع' },
      { status: 500 }
    )
  }
}