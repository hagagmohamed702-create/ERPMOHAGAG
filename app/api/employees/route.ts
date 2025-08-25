import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createEmployeeSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم الموظف مطلوب'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().positive('المرتب يجب أن يكون موجب'),
  hireDate: z.string(),
  isActive: z.boolean().default(true),
  note: z.string().optional()
})

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        _count: {
          select: {
            payrolls: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الموظفين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received employee data:', body)
    
    // التحقق من البيانات
    const validatedData = createEmployeeSchema.parse(body)
    
    // توليد الكود تلقائياً إذا لم يُرسل
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.employee()
    
    // إنشاء الموظف
    const employee = await prisma.employee.create({
      data: {
        ...validatedData,
        code,
        hireDate: new Date(validatedData.hireDate)
      },
      include: {
        _count: {
          select: {
            payrolls: true
          }
        }
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Employee',
        entityId: employee.id,
        meta: { 
          code: employee.code,
          name: employee.name,
          department: employee.department,
          position: employee.position
        }
      }
    })
    
    return NextResponse.json(employee, { status: 201 })
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
    
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء الموظف',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}