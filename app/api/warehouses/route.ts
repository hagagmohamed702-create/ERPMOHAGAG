import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createWarehouseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم المخزن مطلوب'),
  location: z.string().optional()
})

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
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
    
    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المخازن' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received warehouse data:', body)
    
    // التحقق من البيانات
    const validatedData = createWarehouseSchema.parse(body)
    
    // توليد الكود تلقائياً إذا لم يُرسل
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.warehouse()
    
    // التحقق من عدم تكرار الكود
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { code }
    })
    
    if (existingWarehouse) {
      return NextResponse.json(
        { error: 'كود المخزن موجود بالفعل' },
        { status: 400 }
      )
    }
    
    // إنشاء المخزن
    const warehouse = await prisma.warehouse.create({
      data: { ...validatedData, code },
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
        entity: 'Warehouse',
        entityId: warehouse.id,
        meta: { 
          code: warehouse.code,
          name: warehouse.name
        }
      }
    })
    
    return NextResponse.json(warehouse, { status: 201 })
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
    
    console.error('Error creating warehouse:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء المخزن',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}