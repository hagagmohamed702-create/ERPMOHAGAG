import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { listBackups } from '@/lib/backup'

export async function GET() {
  try {
    const backups = await listBackups()
    
    return NextResponse.json({
      success: true,
      backups,
      count: backups.length
    })
  } catch (error) {
    console.error('Error listing backups:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في قراءة قائمة النسخ الاحتياطية',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}