import { prisma } from './prisma'
import ExcelJS from 'exceljs'

// Type definitions for pdfmake
interface TDocumentDefinitions {
  content: any[]
  defaultStyle?: any
  styles?: any
  pageOrientation?: 'portrait' | 'landscape'
}

// بناء تقرير PDF للأقساط
export async function buildInstallmentsPdf() {
  // جلب أول 100 قسط
  const installments = await prisma.installment.findMany({
    take: 100,
    orderBy: { dueDate: 'asc' },
    include: {
      contract: {
        include: {
          client: true,
          unit: true
        }
      }
    }
  })

  // تعريف محتوى PDF
  const docDefinition: TDocumentDefinitions = {
    pageOrientation: 'landscape',
    content: [
      {
        text: 'تقرير الأقساط المستحقة',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: `التاريخ: ${new Date().toLocaleDateString('ar-EG')}`,
        alignment: 'right',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            // Header row
            [
              { text: '#', style: 'tableHeader' },
              { text: 'العميل', style: 'tableHeader' },
              { text: 'الوحدة', style: 'tableHeader' },
              { text: 'المبلغ', style: 'tableHeader' },
              { text: 'تاريخ الاستحقاق', style: 'tableHeader' },
              { text: 'الحالة', style: 'tableHeader' },
              { text: 'تاريخ السداد', style: 'tableHeader' }
            ],
            // Data rows
            ...installments.map((inst, index) => [
              { text: (index + 1).toString(), alignment: 'center' },
              { text: inst.contract.client.name || '', alignment: 'right' },
              { text: inst.contract.unit.code || '', alignment: 'center' },
              { text: formatCurrency(inst.amount), alignment: 'right' },
              { text: formatDate(inst.dueDate), alignment: 'center' },
              { text: getStatusText(inst.status), alignment: 'center' },
              { text: inst.paidAt ? formatDate(inst.paidAt) : '-', alignment: 'center' }
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    defaultStyle: {
      fontSize: 10
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        fillColor: '#eeeeee',
        alignment: 'center'
      }
    }
  }

  return docDefinition
}

// بناء تقرير Excel لكشف البنك
export async function buildBankExcel() {
  // جلب جميع حركات البنك
  const bankImports = await prisma.bankImport.findMany({
    orderBy: { date: 'desc' },
    include: {
      matchedInstallment: {
        include: {
          contract: {
            include: {
              client: true,
              unit: true
            }
          }
        }
      }
    }
  })

  // إنشاء workbook جديد
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Real Estate ERP'
  workbook.created = new Date()

  // إضافة ورقة العمل
  const worksheet = workbook.addWorksheet('كشف البنك', {
    views: [{ rightToLeft: true }]
  })

  // تعريف الأعمدة
  worksheet.columns = [
    { header: 'التاريخ', key: 'date', width: 15 },
    { header: 'نوع الحركة', key: 'type', width: 12 },
    { header: 'المبلغ', key: 'amount', width: 15 },
    { header: 'المرجع', key: 'reference', width: 20 },
    { header: 'البنك', key: 'bankName', width: 15 },
    { header: 'الوصف', key: 'description', width: 30 },
    { header: 'حالة المطابقة', key: 'matchStatus', width: 15 },
    { header: 'العميل المطابق', key: 'matchedClient', width: 20 },
    { header: 'الوحدة المطابقة', key: 'matchedUnit', width: 15 }
  ]

  // إضافة البيانات
  bankImports.forEach(imp => {
    worksheet.addRow({
      date: formatDate(imp.date),
      type: imp.type === 'credit' ? 'إيداع' : 'سحب',
      amount: Number(imp.amount),
      reference: imp.reference || '-',
      bankName: imp.bankName || '-',
      description: imp.description || '-',
      matchStatus: imp.posted ? 'مطابق' : 'غير مطابق',
      matchedClient: imp.matchedInstallment?.contract.client.name || '-',
      matchedUnit: imp.matchedInstallment?.contract.unit.code || '-'
    })
  })

  // تنسيق الجدول
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }

  // تنسيق عمود المبلغ
  worksheet.getColumn('amount').numFmt = '#,##0.00'

  // إضافة حدود للجدول
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
  })

  return workbook
}

// Helper functions
function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('ar-EG')
}

function formatCurrency(amount: any) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount)
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: 'مستحق',
    PAID: 'مدفوع',
    OVERDUE: 'متأخر'
  }
  return statusMap[status] || status
}