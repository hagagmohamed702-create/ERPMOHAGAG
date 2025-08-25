import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        installment: {
          include: {
            contract: {
              select: {
                contractNo: true
              }
            }
          }
        },
        invoice: {
          select: {
            invoiceNo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب المدفوعات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.date || !data.amount || !data.method) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        date: new Date(data.date),
        amount: data.amount,
        method: data.method,
        clientId: data.clientId || undefined,
        installmentId: data.installmentId || undefined,
        invoiceId: data.invoiceId || undefined,
        reference: data.reference,
        note: data.note
      },
      include: {
        client: true,
        installment: {
          include: {
            contract: true
          }
        },
        invoice: true
      }
    })

    // Update installment if payment is linked to one
    if (data.installmentId) {
      const installment = await prisma.installment.findUnique({
        where: { id: data.installmentId }
      })

      if (installment) {
        const newPaidAmount = installment.paidAmount.toNumber() + data.amount
        const status = newPaidAmount >= installment.amount.toNumber() ? 'paid' : 'partial'

        await prisma.installment.update({
          where: { id: data.installmentId },
          data: {
            paidAmount: newPaidAmount,
            status: status,
            paidAt: status === 'paid' ? new Date() : undefined
          }
        })
      }
    }

    // Update invoice if payment is linked to one
    if (data.invoiceId) {
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          status: 'paid'
        }
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'خطأ في إنشاء الدفعة' },
      { status: 500 }
    )
  }
}