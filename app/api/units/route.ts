import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createUnitSchema = z.object({
  code: z.string().optional(),
  projectId: z.string().min(1, 'المشروع مطلوب'),
  type: z.string().min(1, 'نوع الوحدة مطلوب'),
  area: z.number().positive('المساحة يجب أن تكون موجبة'),
  price: z.number().positive('السعر يجب أن يكون موجب'),
  floor: z.number().int().optional(),
  status: z.enum(['available', 'sold', 'reserved', 'cancelled']).default('available'),
  notes: z.string().optional()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where = status ? { status } : {}
    
    const units = await prisma.unit.findMany({
      where,
      include: {
        project: true,
        _count: {
          select: { contracts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(units)
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received unit data:', body)
    
    // التحقق من البيانات
    const validatedData = createUnitSchema.parse(body)
    
    // توليد الكود تلقائياً إذا لم يُرسل
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.unit()
    
    // التحقق من عدم تكرار الكود
    const existingUnit = await prisma.unit.findUnique({
      where: { code }
    })
    
    if (existingUnit) {
      return NextResponse.json(
        { error: 'كود الوحدة موجود بالفعل' },
        { status: 400 }
      )
    }
    
    // إنشاء الوحدة
    const unit = await prisma.unit.create({
      data: { ...validatedData, code },
      include: {
        project: true
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Unit',
        entityId: unit.id,
        meta: { 
          code: unit.code,
          projectId: unit.projectId
        }
      }
    })
    
    return NextResponse.json(unit, { status: 201 })
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
    
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء الوحدة',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}