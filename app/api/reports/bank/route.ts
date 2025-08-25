import { NextResponse } from 'next/server'
import { buildBankExcel } from '@/lib/reporting'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // زيادة timeout إلى 30 ثانية

export async function GET() {
  try {
    // بناء ملف Excel
    const workbook = await buildBankExcel()
    
    // تحويل workbook إلى buffer
    const buffer: ArrayBuffer = await workbook.xlsx.writeBuffer()
    
    // إرجاع Excel كـ response
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="bank-report-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error generating bank Excel:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في توليد التقرير' },
      { status: 500 }
    )
  }
}