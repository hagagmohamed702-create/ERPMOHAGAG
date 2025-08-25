import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params

    // Get contract details
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        installments: true
      }
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'العقد غير موجود' },
        { status: 404 }
      )
    }

    // Check if installments already exist
    if (contract.installments.length > 0) {
      return NextResponse.json(
        { error: 'تم توليد الأقساط مسبقاً لهذا العقد' },
        { status: 400 }
      )
    }

    // Calculate installment details
    const remainingAmount = contract.totalAmount.toNumber() - 
                           contract.downPayment.toNumber() - 
                           (contract.discount?.toNumber() || 0)
    
    const months = contract.months
    const baseInstallmentAmount = Math.floor(remainingAmount / months * 100) / 100
    const lastInstallmentAmount = remainingAmount - (baseInstallmentAmount * (months - 1))

    // Generate installments
    const installments = []
    const startDate = new Date(contract.date)
    
    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate)
      
      // Calculate due date based on plan type
      switch (contract.planType) {
        case 'MONTHLY':
          dueDate.setMonth(dueDate.getMonth() + i + 1)
          break
        case 'QUARTERLY':
          dueDate.setMonth(dueDate.getMonth() + ((i + 1) * 3))
          break
        case 'YEARLY':
          dueDate.setFullYear(dueDate.getFullYear() + i + 1)
          break
      }

      const amount = i === months - 1 ? lastInstallmentAmount : baseInstallmentAmount

      installments.push({
        contractId,
        clientId: contract.clientId,
        unitId: contract.unitId,
        installmentNo: i + 1,
        dueDate,
        amount,
        paidAmount: 0,
        status: 'pending'
      })
    }

    // Create all installments
    await prisma.installment.createMany({
      data: installments
    })

    // Return the created installments
    const createdInstallments = await prisma.installment.findMany({
      where: { contractId },
      orderBy: { installmentNo: 'asc' }
    })

    return NextResponse.json({
      success: true,
      message: `تم توليد ${months} قسط بنجاح`,
      installments: createdInstallments
    })

  } catch (error) {
    console.error('Error generating installments:', error)
    return NextResponse.json(
      { error: 'خطأ في توليد الأقساط' },
      { status: 500 }
    )
  }
}