import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createVoucherSchema = z.object({
  date: z.string(),
  type: z.enum(['RECEIPT', 'PAYMENT']),
  amount: z.number().positive(),
  cashboxId: z.string(),
  clientId: z.string().optional(),
  supplierId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
})

// GET - Fetch all vouchers
export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        cashbox: true,
        client: true,
        supplier: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(vouchers)
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 })
  }
}

// POST - Create a new voucher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVoucherSchema.parse(body)

    // Validate that either client or supplier is provided based on type
    if (validatedData.type === 'RECEIPT' && validatedData.supplierId) {
      return NextResponse.json(
        { error: 'Receipt vouchers should be linked to clients, not suppliers' },
        { status: 400 }
      )
    }

    if (validatedData.type === 'PAYMENT' && validatedData.clientId) {
      return NextResponse.json(
        { error: 'Payment vouchers should be linked to suppliers, not clients' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if cashbox exists
      const cashbox = await tx.cashbox.findUnique({
        where: { id: validatedData.cashboxId }
      })

      if (!cashbox) {
        throw new Error('Cashbox not found')
      }

      // For payment vouchers, check if cashbox has sufficient balance
      if (validatedData.type === 'PAYMENT' && cashbox.balance.toNumber() < validatedData.amount) {
        throw new Error('رصيد الصندوق غير كافي')
      }

      // Generate voucher number
      const lastVoucher = await tx.voucher.findFirst({
        where: { type: validatedData.type },
        orderBy: { voucherNo: 'desc' }
      })
      
      const prefix = validatedData.type === 'RECEIPT' ? 'RCV' : 'PMT'
      const nextNumber = lastVoucher 
        ? parseInt(lastVoucher.voucherNo.split('-')[1]) + 1
        : 1
      const voucherNo = `${prefix}-${nextNumber.toString().padStart(6, '0')}`

      // Create the voucher
      const voucher = await tx.voucher.create({
        data: {
          voucherNo,
          date: new Date(validatedData.date),
          type: validatedData.type,
          amount: validatedData.amount,
          cashboxId: validatedData.cashboxId,
          clientId: validatedData.clientId,
          supplierId: validatedData.supplierId,
          description: validatedData.description,
          reference: validatedData.reference,
        },
        include: {
          cashbox: true,
          client: true,
          supplier: true,
        }
      })

      // Update cashbox balance
      if (validatedData.type === 'RECEIPT') {
        await tx.cashbox.update({
          where: { id: validatedData.cashboxId },
          data: {
            balance: {
              increment: validatedData.amount
            }
          }
        })
      } else {
        await tx.cashbox.update({
          where: { id: validatedData.cashboxId },
          data: {
            balance: {
              decrement: validatedData.amount
            }
          }
        })
      }

      // Log the voucher
      const entityName = validatedData.clientId ? voucher.client?.name : voucher.supplier?.name
      await tx.auditLog.create({
        data: {
          userId: 'system',
          action: 'CREATE',
          entity: 'Voucher',
          entityId: voucher.id,
          meta: {
            voucherNo,
            type: validatedData.type,
            amount: validatedData.amount,
            entity: entityName || 'cash',
            description: `${validatedData.type} voucher ${voucherNo} created: ${validatedData.amount} for ${entityName || 'cash'}`
          }
        }
      })

      return voucher
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating voucher:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create voucher' },
      { status: error.message === 'رصيد الصندوق غير كافي' ? 400 : 500 }
    )
  }
}