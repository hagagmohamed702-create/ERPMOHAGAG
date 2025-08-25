import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createPayrollSchema = z.object({
  employeeId: z.string().min(1, 'الموظف مطلوب'),
  projectId: z.string().optional(),
  phaseId: z.string().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  basicSalary: z.number().positive('الراتب الأساسي يجب أن يكون موجباً'),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  note: z.string().optional()
})

export async function GET() {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: true,
        project: true,
        phase: true
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(payrolls)
  } catch (error) {
    console.error('Error fetching payrolls:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المرتبات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received payroll data:', body)
    
    // التحقق من البيانات
    const validatedData = createPayrollSchema.parse(body)
    
    // التحقق من عدم وجود مرتب للموظف في نفس الشهر
    const existingPayroll = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: validatedData.employeeId,
          month: validatedData.month,
          year: validatedData.year
        }
      }
    })
    
    if (existingPayroll) {
      return NextResponse.json(
        { error: 'يوجد مرتب مسجل لهذا الموظف في نفس الشهر' },
        { status: 400 }
      )
    }
    
    // حساب صافي المرتب
    const netSalary = validatedData.basicSalary + validatedData.allowances - validatedData.deductions
    
    // إنشاء المرتب
    const payroll = await prisma.payroll.create({
      data: {
        ...validatedData,
        basicSalary: new Prisma.Decimal(validatedData.basicSalary),
        allowances: new Prisma.Decimal(validatedData.allowances),
        deductions: new Prisma.Decimal(validatedData.deductions),
        netSalary: new Prisma.Decimal(netSalary),
        status: 'draft'
      },
      include: {
        employee: true,
        project: true,
        phase: true
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Payroll',
        entityId: payroll.id,
        meta: { 
          employeeId: payroll.employeeId,
          month: payroll.month,
          year: payroll.year,
          netSalary: payroll.netSalary.toString()
        }
      }
    })
    
    return NextResponse.json(payroll, { status: 201 })
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
    
    console.error('Error creating payroll:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء المرتب',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}