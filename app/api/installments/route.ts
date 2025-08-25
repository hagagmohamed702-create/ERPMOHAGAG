import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// جلب جميع الأقساط
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const contractId = searchParams.get('contractId')
    const clientId = searchParams.get('clientId')
    const overdue = searchParams.get('overdue')
    
    const where: any = {}
    if (status) where.status = status
    if (contractId) where.contractId = contractId
    if (clientId) where.clientId = clientId
    
    // فلترة الأقساط المتأخرة
    if (overdue === 'true') {
      where.status = 'pending'
      where.dueDate = { lt: new Date() }
    }
    
    const installments = await prisma.installment.findMany({
      where,
      include: {
        contract: true,
        client: true,
        unit: {
          include: {
            project: true
          }
        },
        payments: true
      },
      orderBy: [
        { dueDate: 'asc' },
        { installmentNo: 'asc' }
      ]
    })
    
    return NextResponse.json(installments)
  } catch (error) {
    console.error('Error fetching installments:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}