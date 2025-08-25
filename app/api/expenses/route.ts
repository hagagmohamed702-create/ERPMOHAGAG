import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'


export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createExpenseSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
  type: z.enum(['material', 'labor', 'equipment', 'admin', 'other']),
  supplierId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional()
})

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        supplier: true,
        project: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المصروفات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received expense data:', body)
    
    // التحقق من البيانات
    const validatedData = createExpenseSchema.parse(body)
    
    // إنشاء المصروف
    const expense = await prisma.expense.create({
      data: {
        ...validatedData,
        amount: new Prisma.Decimal(validatedData.amount)
      },
      include: {
        supplier: true,
        project: true
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'CREATE',
        entity: 'Expense',
        entityId: expense.id,
        meta: {
          amount: expense.amount.toString(),
          type: expense.type,
          description: `Expense created: ${expense.amount} for ${expense.type}`
        }
      }
    })
    
    return NextResponse.json(expense, { status: 201 })
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
    
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء المصروف',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}