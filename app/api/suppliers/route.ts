import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createSupplierSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم المورد مطلوب'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional()
})

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            expenses: true,
            invoices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الموردين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received supplier data:', body)
    
    // التحقق من البيانات
    const validatedData = createSupplierSchema.parse(body)
    
    // توليد الكود تلقائياً إذا لم يتم إرساله
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.supplier()
    
    // التحقق من عدم تكرار الكود
    const existingSupplier = await prisma.supplier.findUnique({
      where: { code }
    })
    
    if (existingSupplier) {
      return NextResponse.json(
        { error: 'كود المورد موجود بالفعل' },
        { status: 400 }
      )
    }
    
    // إنشاء المورد
    const supplier = await prisma.supplier.create({
      data: { ...validatedData, code },
      include: {
        _count: {
          select: {
            expenses: true,
            invoices: true
          }
        }
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Supplier',
        entityId: supplier.id,
        meta: { 
          code: supplier.code,
          name: supplier.name
        }
      }
    })
    
    return NextResponse.json(supplier, { status: 201 })
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
    
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء المورد',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}