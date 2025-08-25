import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { matchBankCredits } from '@/lib/bank'

// Schema لاستيراد سطر بنكي
const bankImportSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  amount: z.number().positive('المبلغ يجب أن يكون موجب'),
  type: z.enum(['debit', 'credit']),
  reference: z.string().optional(),
  bankName: z.string().optional(),
  description: z.string().optional()
})

// Schema لطلب المطابقة
const matchRequestSchema = z.object({
  mode: z.literal('match'),
  toleranceAmt: z.number().optional(),
  toleranceDays: z.number().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // التحقق من نوع العملية
    if (body.mode === 'match') {
      // عملية مطابقة
      const validatedData = matchRequestSchema.parse(body)
      
      const result = await matchBankCredits({
        toleranceAmt: validatedData.toleranceAmt,
        toleranceDays: validatedData.toleranceDays
      })
      
      return NextResponse.json({
        success: true,
        ...result,
        message: `تمت مطابقة ${result.matched} من أصل ${result.total} سطر`
      })
    } else {
      // استيراد سطر جديد
      const validatedData = bankImportSchema.parse(body)
      
      const bankImport = await prisma.bankImport.create({
        data: {
          date: validatedData.date,
          amount: validatedData.amount,
          type: validatedData.type,
          reference: validatedData.reference,
          bankName: validatedData.bankName,
          description: validatedData.description
        }
      })
      
      // إضافة سجل تدقيق
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'BankImport',
          entityId: bankImport.id,
          meta: {
            type: validatedData.type,
            amount: validatedData.amount,
            reference: validatedData.reference
          }
        }
      })
      
      return NextResponse.json(bankImport, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error in bank import:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const posted = searchParams.get('posted')
    const type = searchParams.get('type')
    
    const where: any = {}
    if (posted !== null) {
      where.posted = posted === 'true'
    }
    if (type) {
      where.type = type
    }
    
    const bankImports = await prisma.bankImport.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        matchedInstallment: {
          include: {
            contract: {
              include: {
                client: true,
                unit: true
              }
            }
          }
        }
      }
    })
    
    return NextResponse.json(bankImports)
  } catch (error) {
    console.error('Error fetching bank imports:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}