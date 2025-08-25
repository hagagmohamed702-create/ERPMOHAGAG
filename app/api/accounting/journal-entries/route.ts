import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const journalLineSchema = z.object({
  accountId: z.string().min(1, 'الحساب مطلوب'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional()
})

const createJournalEntrySchema = z.object({
  date: z.string().transform(str => new Date(str)),
  type: z.enum(['general', 'payment', 'receipt', 'adjustment']),
  projectId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  lines: z.array(journalLineSchema).min(2, 'القيد يجب أن يحتوي على سطرين على الأقل')
})

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        project: true,
        lines: {
          include: {
            account: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب القيود' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received journal entry data:', body)
    
    // التحقق من البيانات
    const validatedData = createJournalEntrySchema.parse(body)
    
    // التحقق من توازن القيد
    const totalDebit = validatedData.lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredit = validatedData.lines.reduce((sum, line) => sum + line.credit, 0)
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { error: 'القيد غير متوازن - مجموع المدين يجب أن يساوي مجموع الدائن' },
        { status: 400 }
      )
    }
    
    // بدء معاملة لإنشاء القيد وسطوره
    const result = await prisma.$transaction(async (prisma) => {
      // الحصول على رقم القيد التالي
      const lastEntry = await prisma.journalEntry.findFirst({
        orderBy: { entryNo: 'desc' }
      })
      
      const nextEntryNo = lastEntry 
        ? `JE${(parseInt(lastEntry.entryNo.substring(2)) + 1).toString().padStart(6, '0')}`
        : 'JE000001'
      
      // إنشاء القيد
      const entry = await prisma.journalEntry.create({
        data: {
          entryNo: nextEntryNo,
          date: validatedData.date,
          type: validatedData.type,
          projectId: validatedData.projectId,
          description: validatedData.description,
          reference: validatedData.reference,
          isPosted: false,
          lines: {
            create: validatedData.lines.map(line => ({
              accountId: line.accountId,
              debit: new Prisma.Decimal(line.debit),
              credit: new Prisma.Decimal(line.credit),
              description: line.description
            }))
          }
        },
        include: {
          project: true,
          lines: {
            include: {
              account: true
            }
          }
        }
      })
      
      // إضافة سجل تدقيق
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'JournalEntry',
          entityId: entry.id,
          meta: { 
            entryNo: entry.entryNo,
            type: entry.type,
            totalAmount: totalDebit
          }
        }
      })
      
      return entry
    })
    
    return NextResponse.json(result, { status: 201 })
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
    
    console.error('Error creating journal entry:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء القيد',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}