import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createCashboxSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم الصندوق مطلوب'),
  type: z.enum(['main', 'sub']),
  description: z.string().optional()
})

export async function GET() {
  try {
    const cashboxes = await prisma.cashbox.findMany({
      include: {
        _count: {
          select: {
            transfersFrom: true,
            transfersTo: true,
            vouchers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(cashboxes)
  } catch (error) {
    console.error('Error fetching cashboxes:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الصناديق' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received cashbox data:', body)
    
    // التحقق من البيانات
    const validatedData = createCashboxSchema.parse(body)
    
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.cashbox()
    
    // إنشاء الصندوق بدون رصيد افتتاحي
    const cashbox = await prisma.cashbox.create({
      data: {
        ...validatedData,
        code,
        balance: 0
      },
      include: {
        _count: {
          select: {
            transfersFrom: true,
            transfersTo: true,
            vouchers: true
          }
        }
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Cashbox',
        entityId: cashbox.id,
        meta: { 
          code: cashbox.code,
          name: cashbox.name,
          type: cashbox.type
        }
      }
    })
    
    return NextResponse.json(cashbox, { status: 201 })
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
    
    console.error('Error creating cashbox:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء الصندوق',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}