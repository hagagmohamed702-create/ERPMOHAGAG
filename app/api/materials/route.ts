import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createMaterialSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم المادة مطلوب'),
  unit: z.string().min(1, 'وحدة القياس مطلوبة'),
  minQuantity: z.number().min(0).default(0),
  category: z.string().optional(),
  description: z.string().optional()
})

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: {
        _count: {
          select: {
            materialMoves: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(materials)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المواد' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received material data:', body)
    
    // التحقق من البيانات
    const validatedData = createMaterialSchema.parse(body)
    
    // توليد الكود تلقائياً إذا لم يُرسل
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.material()
    
    // التحقق من عدم تكرار الكود
    const existingMaterial = await prisma.material.findUnique({
      where: { code }
    })
    
    if (existingMaterial) {
      return NextResponse.json(
        { error: 'كود المادة موجود بالفعل' },
        { status: 400 }
      )
    }
    
    // إنشاء المادة
    const material = await prisma.material.create({
      data: {
        ...validatedData,
        code,
        minQuantity: new Prisma.Decimal(validatedData.minQuantity),
        currentQty: new Prisma.Decimal(0),
        lastPrice: new Prisma.Decimal(0)
      },
      include: {
        _count: {
          select: {
            materialMoves: true
          }
        }
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Material',
        entityId: material.id,
        meta: { 
          code: material.code,
          name: material.name,
          unit: material.unit
        }
      }
    })
    
    return NextResponse.json(material, { status: 201 })
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
    
    console.error('Error creating material:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء المادة',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}