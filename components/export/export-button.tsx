'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { useToast } from "@/lib/hooks/useToast"

interface ExportButtonProps {
  data: any[]
  filename: string
  columns?: Array<{
    key: string
    label: string
  }>
  title?: string
}

export function ExportButton({ 
  data, 
  filename, 
  columns,
  title = "تصدير البيانات" 
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleExportExcel = async () => {
    setLoading(true)
    try {
      // Lazy load xlsx library
      const XLSX = await import('xlsx')
      
      // Prepare data for export with RTL support
      const exportData = data.map(item => {
        if (columns) {
          const row: any = {}
          // Reverse columns for RTL
          const reversedColumns = [...columns].reverse()
          reversedColumns.forEach(col => {
            row[col.label] = item[col.key] || ''
          })
          return row
        }
        return item
      })

      // Create workbook with RTL support
      const wb = XLSX.utils.book_new()
      wb.Props = {
        Title: title,
        Subject: "تقرير",
        Author: "نظام ERP",
        CreatedDate: new Date()
      }
      
      const ws = XLSX.utils.json_to_sheet(exportData, {
        header: columns ? columns.map(c => c.label).reverse() : undefined
      })
      
      // Apply RTL and styling
      ws['!dir'] = 'rtl'
      
      // Auto-size columns with better calculation
      const maxWidths: any = {}
      const headers = columns ? columns.map(c => c.label).reverse() : Object.keys(exportData[0] || {})
      
      // Calculate column widths
      headers.forEach(header => {
        maxWidths[header] = header.length * 1.5 + 5
      })
      
      exportData.forEach(row => {
        Object.keys(row).forEach(key => {
          const value = String(row[key] || '')
          const width = value.length * 1.2 + 5
          maxWidths[key] = Math.max(maxWidths[key] || 10, width, 15)
        })
      })
      
      ws['!cols'] = headers.map(key => ({ 
        wch: Math.min(maxWidths[key], 50) // Max width 50
      }))
      
      // Apply styles to headers
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      
      // Style headers
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C })
        if (!ws[address]) continue
        
        ws[address].s = {
          fill: { fgColor: { rgb: "4472C4" } },
          font: { 
            bold: true, 
            color: { rgb: "FFFFFF" },
            sz: 12
          },
          alignment: { 
            horizontal: "center",
            vertical: "center",
            wrapText: true
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        }
      }
      
      // Apply alternating row colors and borders
      for (let R = 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C })
          if (!ws[address]) continue
          
          ws[address].s = {
            fill: { 
              fgColor: { rgb: R % 2 === 0 ? "F2F2F2" : "FFFFFF" } 
            },
            alignment: { 
              horizontal: "right",
              vertical: "center"
            },
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } }
            }
          }
        }
      }
      
      // Add autofilter
      if (ws['!ref']) {
        ws['!autofilter'] = { ref: ws['!ref'] }
      }
      
      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomRight', state: 'frozen' }
      
      XLSX.utils.book_append_sheet(wb, ws, 'البيانات')
      
      // Write file with RTL name
      const date = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')
      XLSX.writeFile(wb, `${filename}_${date}.xlsx`, { 
        bookType: 'xlsx',
        type: 'binary',
        cellStyles: true
      })
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير البيانات إلى ملف Excel"
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setLoading(true)
    try {
      // Lazy load pdfmake library
      const pdfMake = (await import('pdfmake/build/pdfmake')).default
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default
      pdfMake.vfs = pdfFonts.pdfMake.vfs

      // Add Arabic font
      pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      }

      // Prepare table data
      const tableHeaders = columns 
        ? columns.map(col => ({ text: col.label, style: 'tableHeader' }))
        : Object.keys(data[0] || {}).map(key => ({ text: key, style: 'tableHeader' }))

      const tableBody = data.map(item => {
        if (columns) {
          return columns.map(col => String(item[col.key] || ''))
        }
        return Object.values(item).map(val => String(val || ''))
      })

      // Create PDF document
      const docDefinition: any = {
        content: [
          { text: title, style: 'header' },
          { text: new Date().toLocaleDateString('ar-EG'), style: 'date' },
          { text: ' ', margin: [0, 10] },
          {
            table: {
              headerRows: 1,
              widths: Array(tableHeaders.length).fill('*'),
              body: [
                tableHeaders,
                ...tableBody
              ]
            },
            layout: 'lightHorizontalLines'
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          date: {
            fontSize: 10,
            alignment: 'center',
            color: '#666'
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black',
            fillColor: '#f3f4f6'
          }
        },
        defaultStyle: {
          alignment: 'right',
          direction: 'rtl'
        }
      }

      pdfMake.createPdf(docDefinition).download(`${filename}.pdf`)
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير البيانات إلى ملف PDF"
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              جاري التصدير...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              تصدير
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="ml-2 h-4 w-4" />
          تصدير Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="ml-2 h-4 w-4" />
          تصدير PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}