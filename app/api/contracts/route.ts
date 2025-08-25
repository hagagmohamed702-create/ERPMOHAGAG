import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { codeGenerators } from '@/lib/code-generator'
import { addMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createContractSchema = z.object({
  contractNo: z.string().optional(),
  date: z.string(),
  clientId: z.string().min(1, 'العميل مطلوب'),
  unitId: z.string().min(1, 'الوحدة مطلوبة'),
  totalAmount: z.number().positive('المبلغ الإجمالي يجب أن يكون موجب'),
  downPayment: z.number().min(0, 'الدفعة المقدمة لا يمكن أن تكون سالبة'),
  months: z.number().int().positive('عدد الأشهر يجب أن يكون موجب'),
  planType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  discount: z.number().min(0).optional(),
  commission: z.number().min(0).optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const unitId = searchParams.get('unitId')
    const status = searchParams.get('status')
    
    const where: any = {}
    if (clientId) where.clientId = clientId
    if (unitId) where.unitId = unitId
    if (status) where.status = status
    
    const contracts = await prisma.contract.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        unit: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            project: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            installments: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب العقود' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received contract data:', body)
    
    // التحقق من البيانات
    const validatedData = createContractSchema.parse(body)
    
    // توليد رقم العقد تلقائياً إذا لم يُرسل
    const contractNo = validatedData.contractNo && validatedData.contractNo.trim() !== ''
      ? validatedData.contractNo
      : await codeGenerators.contract()
    
    // التحقق من عدم التكرار (للأمان)
    const existingContract = await prisma.contract.findUnique({ where: { contractNo } })
    if (existingContract) {
      return NextResponse.json({ error: 'رقم العقد موجود بالفعل' }, { status: 400 })
    }
    
    // التحقق من أن الوحدة متاحة
    const unit = await prisma.unit.findUnique({
      where: { id: validatedData.unitId }
    })
    
    if (!unit || unit.status !== 'available') {
      return NextResponse.json(
        { error: 'الوحدة غير متاحة للبيع' },
        { status: 400 }
      )
    }
    
    // بدء transaction
    const result = await prisma.$transaction(async (tx) => {
      // إنشاء العقد
      const contract = await tx.contract.create({
        data: {
          contractNo,
          date: new Date(validatedData.date),
          clientId: validatedData.clientId,
          unitId: validatedData.unitId,
          projectId: unit.projectId,
          totalAmount: validatedData.totalAmount,
          downPayment: validatedData.downPayment,
          months: validatedData.months,
          planType: validatedData.planType,
          discount: validatedData.discount,
          commission: validatedData.commission,
          notes: validatedData.notes,
          status: 'active'
        }
      })
      
      // تحديث حالة الوحدة
      await tx.unit.update({
        where: { id: validatedData.unitId },
        data: { status: 'sold' }
      })
      
      // حساب الأقساط
      const remainingAmount = validatedData.totalAmount - validatedData.downPayment - (validatedData.discount || 0)
      const installmentAmount = remainingAmount / validatedData.months
      
      // تحديد الفترة الزمنية بين الأقساط
      let monthsToAdd = 1
      if (validatedData.planType === 'QUARTERLY') monthsToAdd = 3
      if (validatedData.planType === 'YEARLY') monthsToAdd = 12
      
      // توليد الأقساط
      const installments = []
      const startDate = new Date(validatedData.date)
      
      for (let i = 0; i < validatedData.months; i++) {
        const dueDate = addMonths(startDate, (i + 1) * monthsToAdd)
        
        installments.push({
          contractId: contract.id,
          clientId: validatedData.clientId,
          unitId: validatedData.unitId,
          installmentNo: i + 1,
          dueDate,
          amount: installmentAmount,
          paidAmount: 0,
          status: 'pending'
        })
      }
      
      // إنشاء الأقساط
      await tx.installment.createMany({
        data: installments
      })
      
      // إضافة سجل تدقيق
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Contract',
          entityId: contract.id,
          meta: { 
            contractNo: contract.contractNo,
            clientId: contract.clientId,
            unitId: contract.unitId,
            installmentsGenerated: installments.length
          }
        }
      })
      
      return contract
    })
    
    // جلب العقد مع البيانات المرتبطة
    const contractWithRelations = await prisma.contract.findUnique({
      where: { id: result.id },
      include: {
        client: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        unit: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            project: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            installments: true
          }
        }
      }
    })
    
    return NextResponse.json(contractWithRelations, { status: 201 })
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
    
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء العقد',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}