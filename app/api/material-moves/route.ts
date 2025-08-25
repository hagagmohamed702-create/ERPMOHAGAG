import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createMaterialMoveSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  type: z.enum(['in', 'out', 'transfer']),
  materialId: z.string().min(1, 'المادة مطلوبة'),
  warehouseId: z.string().min(1, 'المخزن مطلوب'),
  projectId: z.string().optional().nullable().transform(val => val === '' ? null : val),
  quantity: z.number().positive('الكمية يجب أن تكون موجبة'),
  price: z.number().min(0, 'السعر يجب أن يكون صفر أو أكثر'),
  reference: z.string().optional().transform(val => val === '' ? undefined : val),
  note: z.string().optional().transform(val => val === '' ? undefined : val)
})

export async function GET() {
  try {
    const moves = await prisma.materialMove.findMany({
      include: {
        material: true,
        warehouse: true,
        project: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(moves)
  } catch (error) {
    console.error('Error fetching material moves:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب حركات المواد' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received material move data:', body)
    
    // التحقق من البيانات
    let validatedData
    try {
      validatedData = createMaterialMoveSchema.parse(body)
      console.log('Validated data:', validatedData)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      throw validationError
    }
    
    // بدء معاملة لضمان تحديث المخزون
    const result = await prisma.$transaction(async (prisma) => {
      // حساب المبلغ الإجمالي
      const totalAmount = validatedData.quantity * validatedData.price
      
      // إنشاء حركة المادة
      const move = await prisma.materialMove.create({
        data: {
          ...validatedData,
          quantity: new Prisma.Decimal(validatedData.quantity),
          price: new Prisma.Decimal(validatedData.price),
          totalAmount: new Prisma.Decimal(totalAmount)
        },
        include: {
          material: true,
          warehouse: true,
          project: true
        }
      })
      
      // تحديث كمية المادة الحالية
      const material = await prisma.material.findUnique({
        where: { id: validatedData.materialId }
      })
      
      if (!material) {
        throw new Error('المادة غير موجودة')
      }
      
      let newQuantity = material.currentQty
      
      if (validatedData.type === 'in') {
        newQuantity = newQuantity.add(new Prisma.Decimal(validatedData.quantity))
      } else if (validatedData.type === 'out') {
        newQuantity = newQuantity.sub(new Prisma.Decimal(validatedData.quantity))
        
        if (newQuantity.lessThan(0)) {
          throw new Error('الكمية المتاحة غير كافية')
        }
      }
      
      // تحديث المادة
      await prisma.material.update({
        where: { id: validatedData.materialId },
        data: {
          currentQty: newQuantity,
          lastPrice: validatedData.type === 'in' ? new Prisma.Decimal(validatedData.price) : material.lastPrice
        }
      })
      
      // إضافة سجل تدقيق
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'MaterialMove',
          entityId: move.id,
          meta: { 
            type: move.type,
            materialId: move.materialId,
            warehouseId: move.warehouseId,
            quantity: move.quantity.toString(),
            price: move.price.toString()
          }
        }
      })
      
      return move
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
    
    console.error('Error creating material move:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'حدث خطأ في إنشاء حركة المادة'
      },
      { status: 500 }
    )
  }
}