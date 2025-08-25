import { prisma } from './prisma'
import fs from 'fs/promises'
import path from 'path'

export async function runLocalBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = process.env.BACKUP_LOCAL_PATH || './backups'
  const fileName = `backup-${timestamp}.json`
  const filePath = path.join(backupDir, fileName)

  try {
    // التأكد من وجود مجلد النسخ الاحتياطية
    await fs.mkdir(backupDir, { recursive: true })

    // جمع جميع البيانات من قاعدة البيانات
    console.log('جاري جمع البيانات للنسخ الاحتياطي...')
    
    const data = {
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        database: 'real_estate_erp'
      },
      data: {
        // البيانات الأساسية
        clients: await prisma.client.findMany(),
        projects: await prisma.project.findMany(),
        units: await prisma.unit.findMany(),
        contracts: await prisma.contract.findMany(),
        installments: await prisma.installment.findMany(),
        
        // بيانات الشركاء والإرجاعات
        partners: await prisma.partner.findMany(),
        returns: await prisma.return.findMany(),
        
        // البيانات المحاسبية
        cashboxes: await prisma.cashbox.findMany(),
        vouchers: await prisma.voucher.findMany(),
        transfers: await prisma.transfer.findMany(),
        
        // بيانات البنك
        bankImports: await prisma.bankImport.findMany(),
        
        // سجلات التدقيق
        auditLogs: await prisma.auditLog.findMany()
      },
      statistics: {
        totalClients: 0,
        totalUnits: 0,
        totalContracts: 0,
        totalInstallments: 0,
        totalPartners: 0,
        totalReturns: 0,
        totalCashboxes: 0,
        totalVouchers: 0,
        totalTransfers: 0,
        totalBankImports: 0
      }
    }

    // حساب الإحصائيات
    data.statistics = {
      totalClients: data.data.clients.length,
      totalUnits: data.data.units.length,
      totalContracts: data.data.contracts.length,
      totalInstallments: data.data.installments.length,
      totalPartners: data.data.partners.length,
      totalReturns: data.data.returns.length,
      totalCashboxes: data.data.cashboxes.length,
      totalVouchers: data.data.vouchers.length,
      totalTransfers: data.data.transfers.length,
      totalBankImports: data.data.bankImports.length
    }

    // كتابة البيانات إلى ملف JSON
    console.log(`جاري كتابة النسخة الاحتياطية إلى: ${filePath}`)
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      'utf8'
    )

    // إضافة سجل تدقيق
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP',
        entity: 'Database',
        entityId: fileName, // استخدام اسم الملف كـ entityId
        meta: {
          fileName,
          filePath,
          statistics: data.statistics,
          sizeBytes: (await fs.stat(filePath)).size
        }
      }
    })

    console.log('تمت عملية النسخ الاحتياطي بنجاح!')
    
    return {
      ok: true,
      file: fileName,
      path: filePath,
      statistics: data.statistics,
      sizeBytes: (await fs.stat(filePath)).size
    }
  } catch (error) {
    console.error('خطأ في عملية النسخ الاحتياطي:', error)
    throw error
  }
}

// وظيفة لاستعادة النسخة الاحتياطية (للاستخدام المستقبلي)
export async function restoreLocalBackup(fileName: string) {
  const backupDir = process.env.BACKUP_LOCAL_PATH || './backups'
  const filePath = path.join(backupDir, fileName)

  try {
    // قراءة ملف النسخة الاحتياطية
    const fileContent = await fs.readFile(filePath, 'utf8')
    const backupData = JSON.parse(fileContent)

    // التحقق من صحة البيانات
    if (!backupData.metadata || !backupData.data) {
      throw new Error('ملف النسخة الاحتياطية غير صالح')
    }

    console.log(`استعادة النسخة الاحتياطية من: ${backupData.metadata.timestamp}`)
    
    // ملاحظة: عملية الاستعادة معقدة وتحتاج إلى:
    // 1. حذف البيانات الحالية
    // 2. إعادة إدخال البيانات بالترتيب الصحيح للحفاظ على العلاقات
    // 3. معالجة التعارضات في المفاتيح الفريدة
    
    return {
      ok: true,
      message: 'وظيفة الاستعادة غير مكتملة بعد',
      metadata: backupData.metadata
    }
  } catch (error) {
    console.error('خطأ في استعادة النسخة الاحتياطية:', error)
    throw error
  }
}

// وظيفة لعرض قائمة النسخ الاحتياطية المتاحة
export async function listBackups() {
  const backupDir = process.env.BACKUP_LOCAL_PATH || './backups'

  try {
    await fs.mkdir(backupDir, { recursive: true })
    
    const files = await fs.readdir(backupDir)
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    
    const backups = await Promise.all(
      backupFiles.map(async (fileName) => {
        const filePath = path.join(backupDir, fileName)
        const stats = await fs.stat(filePath)
        
        return {
          fileName,
          filePath,
          sizeBytes: stats.size,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        }
      })
    )
    
    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error('خطأ في قراءة قائمة النسخ الاحتياطية:', error)
    throw error
  }
}