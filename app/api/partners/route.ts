import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { codeGenerators } from '@/lib/code-generator'

// Schema للتحقق من البيانات
const createPartnerSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم الشريك مطلوب'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  type: z.enum(['buyer', 'seller', 'investor']),
  percentage: z.number().min(0).max(100).optional(),
  note: z.string().optional()
})

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { 
            contracts: true,
            returns: true 
          }
        }
      }
    })
    
    return NextResponse.json(partners)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received partner data:', body)
    
    // التحقق من البيانات
    const validatedData = createPartnerSchema.parse(body)
    
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.partner()
    
    const partner = await prisma.partner.create({
      data: { ...validatedData, code },
      include: {
        _count: {
          select: { 
            contracts: true,
            returns: true 
          }
        }
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Partner',
        entityId: partner.id,
        meta: { name: partner.name }
      }
    })
    
    return NextResponse.json(partner, { status: 201 })
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
    
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء الشريك',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}