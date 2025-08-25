import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 بدء إعادة تعيين قاعد البيانات...')
  
  try {
    // حذف جميع البيانات بالترتيب الصحيح لتجنب مشاكل foreign key
    console.log('🗑️  حذف البيانات الموجودة...')
    
    // حذف البيانات التابعة أولاً
    await prisma.auditLog.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.backup.deleteMany()
    await prisma.bankImport.deleteMany()
    await prisma.settlementLine.deleteMany()
    await prisma.settlement.deleteMany()
    await prisma.materialMove.deleteMany()
    await prisma.payroll.deleteMany()
    await prisma.voucher.deleteMany()
    await prisma.transfer.deleteMany()
    await prisma.journalLine.deleteMany()
    await prisma.journalEntry.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.installment.deleteMany()
    await prisma.return.deleteMany()
    await prisma.contract.deleteMany()
    await prisma.unitPartner.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.projectPartner.deleteMany()
    await prisma.projectPhase.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.revenue.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.project.deleteMany()
    await prisma.partner.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.client.deleteMany()
    await prisma.material.deleteMany()
    await prisma.warehouse.deleteMany()
    await prisma.cashbox.deleteMany()
    await prisma.account.deleteMany()
    await prisma.systemSetting.deleteMany()
    
    console.log('✅ تم حذف جميع البيانات')
    
    // إنشاء البيانات الأساسية
    console.log('🌱 إنشاء البيانات الأساسية...')
    
    // إنشاء دليل الحسابات الأساسي
    const assets = await prisma.account.create({
      data: {
        code: '1',
        name: 'الأصول',
        type: 'asset',
        isActive: true
      }
    })
    
    const liabilities = await prisma.account.create({
      data: {
        code: '2',
        name: 'الخصوم',
        type: 'liability',
        isActive: true
      }
    })
    
    const equity = await prisma.account.create({
      data: {
        code: '3',
        name: 'حقوق الملكية',
        type: 'equity',
        isActive: true
      }
    })
    
    const revenue = await prisma.account.create({
      data: {
        code: '4',
        name: 'الإيرادات',
        type: 'revenue',
        isActive: true
      }
    })
    
    const expense = await prisma.account.create({
      data: {
        code: '5',
        name: 'المصروفات',
        type: 'expense',
        isActive: true
      }
    })
    
    // إنشاء حسابات فرعية
    await prisma.account.createMany({
      data: [
        // الأصول
        { code: '101', name: 'النقدية', type: 'asset', parentId: assets.id, isActive: true },
        { code: '102', name: 'البنوك', type: 'asset', parentId: assets.id, isActive: true },
        { code: '103', name: 'المدينون', type: 'asset', parentId: assets.id, isActive: true },
        { code: '104', name: 'المخزون', type: 'asset', parentId: assets.id, isActive: true },
        { code: '105', name: 'الأصول الثابتة', type: 'asset', parentId: assets.id, isActive: true },
        
        // الخصوم
        { code: '201', name: 'الدائنون', type: 'liability', parentId: liabilities.id, isActive: true },
        { code: '202', name: 'القروض', type: 'liability', parentId: liabilities.id, isActive: true },
        { code: '203', name: 'أوراق الدفع', type: 'liability', parentId: liabilities.id, isActive: true },
        
        // حقوق الملكية
        { code: '301', name: 'رأس المال', type: 'equity', parentId: equity.id, isActive: true },
        { code: '302', name: 'الأرباح المحتجزة', type: 'equity', parentId: equity.id, isActive: true },
        
        // الإيرادات
        { code: '401', name: 'إيرادات المبيعات', type: 'revenue', parentId: revenue.id, isActive: true },
        { code: '402', name: 'إيرادات الخدمات', type: 'revenue', parentId: revenue.id, isActive: true },
        { code: '403', name: 'إيرادات أخرى', type: 'revenue', parentId: revenue.id, isActive: true },
        
        // المصروفات
        { code: '501', name: 'المرتبات', type: 'expense', parentId: expense.id, isActive: true },
        { code: '502', name: 'الإيجارات', type: 'expense', parentId: expense.id, isActive: true },
        { code: '503', name: 'المصروفات الإدارية', type: 'expense', parentId: expense.id, isActive: true },
        { code: '504', name: 'مصروفات التشغيل', type: 'expense', parentId: expense.id, isActive: true }
      ]
    })
    
    // إنشاء صندوق رئيسي
    await prisma.cashbox.create({
      data: {
        code: 'CSH-0001',
        name: 'الصندوق الرئيسي',
        balance: 0,
        type: 'main',
        isActive: true
      }
    })
    
    // إنشاء مخزن رئيسي
    await prisma.warehouse.create({
      data: {
        code: 'WRH-0001',
        name: 'المخزن الرئيسي',
        location: 'المقر الرئيسي',
        isActive: true
      }
    })
    
    // إعدادات النظام
    await prisma.systemSetting.createMany({
      data: [
        { key: 'company_name', value: '"شركة العقارات المتحدة"', description: 'اسم الشركة' },
        { key: 'company_address', value: '"الرياض - المملكة العربية السعودية"', description: 'عنوان الشركة' },
        { key: 'company_phone', value: '"+966500000000"', description: 'هاتف الشركة' },
        { key: 'company_email', value: '"info@company.com"', description: 'البريد الإلكتروني' },
        { key: 'tax_rate', value: '15', description: 'نسبة الضريبة %' },
        { key: 'currency', value: '"SAR"', description: 'العملة الافتراضية' }
      ]
    })
    
    console.log('✅ تم إنشاء البيانات الأساسية')
    console.log('🎉 تمت إعادة تعيين قاعدة البيانات بنجاح!')
    
  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين قاعدة البيانات:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })