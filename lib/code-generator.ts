import { prisma } from '@/lib/prisma'

/**
 * توليد كود تلقائي بناءً على آخر كود في الجدول
 * @param prefix البادئة للكود (مثل: CLI للعملاء، SUP للموردين)
 * @param tableName اسم الجدول
 * @param codeField اسم حقل الكود (افتراضي: code)
 * @param padding عدد الأصفار (افتراضي: 4)
 */
export async function generateCode(
  prefix: string,
  tableName: string,
  codeField: string = 'code',
  padding: number = 4
): Promise<string> {
  try {
    // جلب آخر سجل بناءً على الكود
    const lastRecord = await (prisma as any)[tableName].findMany({
      where: {
        [codeField]: {
          startsWith: prefix
        }
      },
      orderBy: {
        [codeField]: 'desc'
      },
      take: 1,
      select: {
        [codeField]: true
      }
    })

    let nextNumber = 1

    if (lastRecord && lastRecord.length > 0) {
      const lastCode = lastRecord[0][codeField]
      // استخراج الرقم من الكود
      const numberPart = lastCode.substring(prefix.length)
      const lastNumber = parseInt(numberPart, 10)
      
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1
      }
    }

    // تكوين الكود الجديد
    const paddedNumber = nextNumber.toString().padStart(padding, '0')
    return `${prefix}${paddedNumber}`
  } catch (error) {
    console.error('Error generating code:', error)
    // في حالة الخطأ، نرجع كود بناءً على الوقت
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }
}

// دوال مساعدة لكل نوع
export const codeGenerators = {
  // العملاء
  client: async () => generateCode('CLI-', 'client'),
  
  // الموردين
  supplier: async () => generateCode('SUP-', 'supplier'),
  
  // الشركاء
  partner: async () => generateCode('PAR-', 'partner'),
  
  // الموظفين
  employee: async () => generateCode('EMP-', 'employee'),
  
  // المشاريع
  project: async () => generateCode('PRJ-', 'project'),
  
  // الوحدات
  unit: async () => generateCode('UNT-', 'unit'),
  
  // العقود
  contract: async () => generateCode('CON-', 'contract', 'contractNo'),
  
  // الفواتير
  invoice: async () => generateCode('INV-', 'invoice', 'invoiceNo'),
  
  // المواد
  material: async () => generateCode('MAT-', 'material'),
  
  // المخازن
  warehouse: async () => generateCode('WRH-', 'warehouse'),
  
  // الصناديق
  cashbox: async () => generateCode('CSH-', 'cashbox'),
  
  // سندات القبض
  receiptVoucher: async () => generateCode('REC-', 'voucher', 'voucherNo'),
  
  // سندات الصرف
  paymentVoucher: async () => generateCode('PAY-', 'voucher', 'voucherNo'),
  
  // التحويلات
  transfer: async () => generateCode('TRF-', 'transfer', 'transferNumber'),
  
  // القيود المحاسبية
  journalEntry: async () => generateCode('JRN-', 'journalEntry', 'entryNo'),
  
  // التسويات
  settlement: async () => generateCode('SET-', 'settlement', 'settlementNo'),
  
  // دليل الحسابات - بصيغة مختلفة
  account: async (parentCode?: string) => {
    if (!parentCode) {
      // حساب رئيسي
      const lastAccount = await prisma.account.findMany({
        where: {
          parentId: null,
          AND: [
            { code: { gte: '1' } },
            { code: { lte: '9' } }
          ]
        },
        orderBy: {
          code: 'desc'
        },
        take: 1
      })
      
      if (lastAccount.length > 0) {
        const lastNumber = parseInt(lastAccount[0].code)
        if (!isNaN(lastNumber) && lastNumber < 9) {
          return (lastNumber + 1).toString()
        }
      }
      return '1'
    } else {
      // حساب فرعي
      const lastAccount = await prisma.account.findMany({
        where: {
          code: {
            startsWith: parentCode
          },
          NOT: {
            code: parentCode
          }
        },
        orderBy: {
          code: 'desc'
        },
        take: 1
      })
      
      if (lastAccount.length > 0) {
        const lastCode = lastAccount[0].code
        const suffix = lastCode.substring(parentCode.length)
        const lastNumber = parseInt(suffix)
        
        if (!isNaN(lastNumber)) {
          return `${parentCode}${(lastNumber + 1).toString().padStart(2, '0')}`
        }
      }
      return `${parentCode}01`
    }
  }
}