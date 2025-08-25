import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createTransferSchema = z.object({
  date: z.string(),
  fromCashboxId: z.string(),
  toCashboxId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
})

// GET - Fetch all transfers
export async function GET() {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromCashbox: true,
        toCashbox: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
  }
}

// POST - Create a new transfer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTransferSchema.parse(body)

    // Check if from and to cashboxes are different
    if (validatedData.fromCashboxId === validatedData.toCashboxId) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same cashbox' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if from cashbox has sufficient balance
      const fromCashbox = await tx.cashbox.findUnique({
        where: { id: validatedData.fromCashboxId }
      })

      if (!fromCashbox) {
        throw new Error('From cashbox not found')
      }

      if (fromCashbox.balance.toNumber() < validatedData.amount) {
        throw new Error('رصيد الصندوق غير كافي')
      }

      // Check if to cashbox exists
      const toCashbox = await tx.cashbox.findUnique({
        where: { id: validatedData.toCashboxId }
      })

      if (!toCashbox) {
        throw new Error('To cashbox not found')
      }

      // Generate transfer number
      const lastTransfer = await tx.transfer.findFirst({
        orderBy: { transferNumber: 'desc' }
      })
      const nextNumber = lastTransfer 
        ? parseInt(lastTransfer.transferNumber.split('-')[1]) + 1
        : 1
      const transferNumber = `TRF-${nextNumber.toString().padStart(6, '0')}`

      // Create the transfer
      const transfer = await tx.transfer.create({
        data: {
          transferNumber,
          date: new Date(validatedData.date),
          fromCashboxId: validatedData.fromCashboxId,
          toCashboxId: validatedData.toCashboxId,
          amount: validatedData.amount,
          description: validatedData.description,
        },
        include: {
          fromCashbox: true,
          toCashbox: true,
        }
      })

      // Update cashbox balances
      await tx.cashbox.update({
        where: { id: validatedData.fromCashboxId },
        data: {
          balance: {
            decrement: validatedData.amount
          }
        }
      })

      await tx.cashbox.update({
        where: { id: validatedData.toCashboxId },
        data: {
          balance: {
            increment: validatedData.amount
          }
        }
      })

      // Log the transfer
      await tx.auditLog.create({
        data: {
          userId: 'system',
          action: 'CREATE',
          entity: 'Transfer',
          entityId: transfer.id,
          meta: {
            transferNumber,
            amount: validatedData.amount,
            from: fromCashbox.name,
            to: toCashbox.name,
            description: `Transfer ${transferNumber} created: ${validatedData.amount} from ${fromCashbox.name} to ${toCashbox.name}`
          }
        }
      })

      return transfer
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transfer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create transfer' },
      { status: error.message === 'رصيد الصندوق غير كافي' ? 400 : 500 }
    )
  }
}