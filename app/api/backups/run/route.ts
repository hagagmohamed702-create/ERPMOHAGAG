import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { runLocalBackup } from '@/lib/backup'

export async function POST() {
  try {
    // تشغيل النسخ الاحتياطي
    const result = await runLocalBackup()
    
    return NextResponse.json({
      success: true,
      ...result,
      message: `تم إنشاء النسخة الاحتياطية بنجاح: ${result.file}`
    })
  } catch (error) {
    console.error('Error running backup:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في عملية النسخ الاحتياطي',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}