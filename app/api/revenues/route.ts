import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'


export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createRevenueSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
  type: z.enum(['contract', 'service', 'other']),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional()
})

export async function GET() {
  try {
    const revenues = await prisma.revenue.findMany({
      include: {
        client: true,
        project: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(revenues)
  } catch (error) {
    console.error('Error fetching revenues:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإيرادات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received revenue data:', body)
    
    // التحقق من البيانات
    const validatedData = createRevenueSchema.parse(body)
    
    // إنشاء الإيراد
    const revenue = await prisma.revenue.create({
      data: {
        ...validatedData,
        amount: new Prisma.Decimal(validatedData.amount)
      },
      include: {
        client: true,
        project: true
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Revenue',
        entityId: revenue.id,
        meta: { 
          type: revenue.type,
          amount: revenue.amount.toString(),
          clientId: revenue.clientId,
          projectId: revenue.projectId
        }
      }
    })
    
    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { 
          error: 'بيانات غير صحيحة', 
          details: error.errors,
          message: error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }
    
    console.error('Error creating revenue:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء الإيراد',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}