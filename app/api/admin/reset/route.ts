import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Danger: Deletes all data. Intended for controlled admin use.
export async function POST() {
  const prisma = new PrismaClient()
  try {
    // Delete data in dependency-safe order
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany()
      await tx.notification.deleteMany()
      await tx.backup.deleteMany()
      await tx.bankImport.deleteMany()
      await tx.settlementLine.deleteMany()
      await tx.settlement.deleteMany()
      await tx.materialMove.deleteMany()
      await tx.payroll.deleteMany()
      await tx.voucher.deleteMany()
      await tx.transfer.deleteMany()
      await tx.journalLine.deleteMany()
      await tx.journalEntry.deleteMany()
      await tx.payment.deleteMany()
      await tx.installment.deleteMany()
      await tx.return.deleteMany()
      await tx.contract.deleteMany()
      await tx.unitPartner.deleteMany()
      await tx.unit.deleteMany()
      await tx.projectPartner.deleteMany()
      await tx.projectPhase.deleteMany()
      await tx.expense.deleteMany()
      await tx.revenue.deleteMany()
      await tx.invoice.deleteMany()
      await tx.project.deleteMany()
      await tx.partner.deleteMany()
      await tx.employee.deleteMany()
      await tx.supplier.deleteMany()
      await tx.client.deleteMany()
      await tx.material.deleteMany()
      await tx.warehouse.deleteMany()
      await tx.cashbox.deleteMany()
      await tx.account.deleteMany()
      await tx.systemSetting.deleteMany()
    })

    return NextResponse.json({ success: true, message: 'تم حذف جميع البيانات' })
  } catch (error) {
    console.error('Error resetting database:', error)
    return NextResponse.json({ success: false, error: 'فشل في إعادة ضبط النظام' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

