import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { codeGenerators } from '@/lib/code-generator'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createClientSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم العميل مطلوب'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional()
})

// جلب جميع العملاء
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}
    
    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: {
            contracts: true,
            projects: true,
            installments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// إنشاء عميل جديد
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received client data:', body)
    
    // التحقق من البيانات
    const validatedData = createClientSchema.parse(body)
    
    // توليد كود تلقائي إذا لم يُرسل
    const code = body.code && body.code.trim() !== '' ? body.code : await codeGenerators.client()
    
    // التحقق من البريد الإلكتروني إذا كان موجوداً
    if (validatedData.email) {
      const existingEmail = await prisma.client.findFirst({
        where: { email: validatedData.email }
      })
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }
    
    // إنشاء العميل
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        code,
        email: validatedData.email || null
      },
      include: {
        _count: {
          select: {
            contracts: true,
            projects: true,
            installments: true,
          }
        }
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Client',
        entityId: client.id,
        meta: { 
          code: client.code,
          name: client.name
        }
      }
    })
    
    return NextResponse.json(client, { status: 201 })
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
    
    console.error('Error creating client:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء العميل',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}