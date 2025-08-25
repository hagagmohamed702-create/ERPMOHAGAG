import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

interface MatchBankCreditsParams {
  toleranceAmt?: number
  toleranceDays?: number
}

export async function matchBankCredits({
  toleranceAmt = 5,
  toleranceDays = 7
}: MatchBankCreditsParams = {}) {
  // جلب جميع الإيداعات البنكية غير المطابقة
  const unmatchedCredits = await prisma.bankImport.findMany({
    where: {
      type: 'credit',
      posted: false,
      matchedInstallmentId: null
    },
    orderBy: { date: 'asc' }
  })
  
  if (unmatchedCredits.length === 0) {
    return { matched: 0, total: 0 }
  }
  
  // جلب جميع الأقساط المستحقة غير المدفوعة
  const pendingInstallments = await prisma.installment.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      contract: {
        include: {
          client: true
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  })
  
  let matchedCount = 0
  
  // محاولة مطابقة كل إيداع
  for (const credit of unmatchedCredits) {
    const creditAmount = new Prisma.Decimal(credit.amount)
    const creditDate = new Date(credit.date)
    
    // البحث عن قسط مطابق
    const matchingInstallment = pendingInstallments.find(installment => {
      const installmentAmount = new Prisma.Decimal(installment.amount)
      const installmentDate = new Date(installment.dueDate)
      
      // التحقق من المبلغ (مع هامش التسامح)
      const amountDiff = creditAmount.minus(installmentAmount).abs()
      if (amountDiff.gt(toleranceAmt)) {
        return false
      }
      
      // التحقق من التاريخ (مع هامش التسامح)
      const daysDiff = Math.abs(
        (creditDate.getTime() - installmentDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff > toleranceDays) {
        return false
      }
      
      return true
    })
    
    if (matchingInstallment) {
      // تحديث القسط كمدفوع
      await prisma.installment.update({
        where: { id: matchingInstallment.id },
        data: {
          status: 'PAID',
          paidAt: credit.date
        }
      })
      
      // تحديث سطر البنك كمطابق
      await prisma.bankImport.update({
        where: { id: credit.id },
        data: {
          posted: true,
          matchedInstallmentId: matchingInstallment.id
        }
      })
      
      // إضافة سجل تدقيق
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'BankMatch',
          entityId: credit.id, // استخدام معرف البنك كـ entityId
          meta: {
            bankImportId: credit.id,
            installmentId: matchingInstallment.id,
            amount: credit.amount,
            clientName: matchingInstallment.contract.client.name
          }
        }
      })
      
      matchedCount++
      
      // إزالة القسط من القائمة لتجنب المطابقة المزدوجة
      const index = pendingInstallments.findIndex(i => i.id === matchingInstallment.id)
      if (index > -1) {
        pendingInstallments.splice(index, 1)
      }
    }
  }
  
  return {
    matched: matchedCount,
    total: unmatchedCredits.length
  }
}