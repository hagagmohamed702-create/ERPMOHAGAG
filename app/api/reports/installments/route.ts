import { NextResponse } from 'next/server'
import { buildInstallmentsPdf } from '@/lib/reporting'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // زيادة timeout إلى 30 ثانية

// Dynamic import for pdfmake to avoid SSR issues
async function generatePdf(docDefinition: any) {
  try {
    const pdfMake = (await import('pdfmake/build/pdfmake')).default
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default
    
    pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs
    
    return new Promise<Buffer>((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition)
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(buffer)
      }, (error: any) => {
        reject(error)
      })
    })
  } catch (error) {
    console.error('Error in PDF generation:', error)
    throw error
  }
}

export async function GET() {
  try {
    // بناء تعريف PDF
    const docDefinition = await buildInstallmentsPdf()
    
    // توليد PDF
    const pdfBuffer = await generatePdf(docDefinition)
    
    // إرجاع PDF كـ response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="installments-report-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating installments PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}