import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { codeGenerators } from '@/lib/code-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema للتحقق من البيانات
const createProjectSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  clientId: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'completed', 'suspended']).default('active'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  budget: z.number().positive().optional(),
  description: z.string().optional()
})

// جلب جميع المشاريع
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where = status ? { status } : {}
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        _count: {
          select: {
            units: true,
            phases: true,
            contracts: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// إنشاء مشروع جديد
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received project data:', body)
    
    // التحقق من البيانات
    const validatedData = createProjectSchema.parse(body)
    
    // توليد الكود تلقائياً إذا لم يُرسل
    const code = validatedData.code && validatedData.code.trim() !== ''
      ? validatedData.code
      : await codeGenerators.project()
    
    // التحقق من عدم تكرار الكود
    const existingProject = await prisma.project.findUnique({
      where: { code }
    })
    
    if (existingProject) {
      return NextResponse.json(
        { error: 'كود المشروع موجود بالفعل' },
        { status: 400 }
      )
    }
    
    // إنشاء المشروع
    const project = await prisma.project.create({
      data: { ...validatedData, code },
      include: {
        client: true
      }
    })
    
    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Project',
        entityId: project.id,
        meta: { 
          code: project.code,
          name: project.name
        }
      }
    })
    
    return NextResponse.json(project, { status: 201 })
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
    
    console.error('Error creating project:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء المشروع',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}