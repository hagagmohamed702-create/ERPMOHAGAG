'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react"
import { useToast } from "@/lib/hooks/useToast"

interface ImportButtonProps {
  onImport: (data: any[]) => Promise<void>
  columns: Array<{
    key: string
    label: string
    required?: boolean
  }>
  templateName: string
}

export function ImportButton({ 
  onImport, 
  columns,
  templateName 
}: ImportButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setErrors(['يجب أن يكون الملف بصيغة Excel (.xlsx أو .xls)'])
      return
    }

    setFile(selectedFile)
    setErrors([])
    
    // Preview file content
    try {
      const XLSX = await import('xlsx')
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const data = event.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as Record<string, any>[]
          
          // Preview first 5 rows
          setPreview(jsonData.slice(0, 5))
          
          // Validate columns
          if (jsonData.length > 0) {
            const fileColumns = Object.keys(jsonData[0])
            const missingColumns = columns
              .filter(col => col.required)
              .filter(col => !fileColumns.includes(col.label))
            
            if (missingColumns.length > 0) {
              setErrors([
                `الأعمدة المطلوبة غير موجودة: ${missingColumns.map(c => c.label).join(', ')}`
              ])
            }
          }
        } catch (error) {
          setErrors(['خطأ في قراءة الملف'])
        }
      }
      
      reader.readAsBinaryString(selectedFile)
    } catch (error) {
      setErrors(['خطأ في معالجة الملف'])
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx')
      
      // Create template with column headers
      const templateData: Record<string, any>[] = [{}]
      columns.forEach(col => {
        templateData[0][col.label] = ''
      })
      
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(templateData)
      
      // Set RTL
      ws['!dir'] = 'rtl'
      
      // Auto-size columns
      const maxWidths = columns.reduce((acc, col) => {
        acc[col.label] = col.label.length * 1.5 + 5
        return acc
      }, {} as any)
      
      ws['!cols'] = columns.map(col => ({ 
        wch: Math.max(maxWidths[col.label], 15)
      }))
      
      // Style headers
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C })
        if (!ws[address]) continue
        
        ws[address].s = {
          fill: { fgColor: { rgb: "4472C4" } },
          font: { bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center" }
        }
      }
      
      XLSX.utils.book_append_sheet(wb, ws, 'نموذج')
      XLSX.writeFile(wb, `${templateName}_template.xlsx`)
      
      toast({
        title: "تم تحميل النموذج",
        description: "يمكنك الآن ملء البيانات في النموذج"
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل النموذج",
        variant: "destructive"
      })
    }
  }

  const handleImport = async () => {
    if (!file) return
    
    setLoading(true)
    setErrors([])
    
    try {
      const XLSX = await import('xlsx')
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const data = event.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
          
          // Map data to expected format
          const mappedData = jsonData.map((row: any) => {
            const mappedRow: any = {}
            columns.forEach(col => {
              mappedRow[col.key] = row[col.label] || ''
            })
            return mappedRow
          })
          
          // Call import function
          await onImport(mappedData)
          
          toast({
            title: "تم الاستيراد بنجاح",
            description: `تم استيراد ${mappedData.length} سجل`
          })
          
          setOpen(false)
          setFile(null)
          setPreview([])
        } catch (error) {
          setErrors(['خطأ في استيراد البيانات'])
          toast({
            title: "خطأ في الاستيراد",
            description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
      
      reader.readAsBinaryString(file)
    } catch (error) {
      setErrors(['خطأ في معالجة الملف'])
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Upload className="h-4 w-4" />
        استيراد
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>استيراد البيانات من Excel</DialogTitle>
            <DialogDescription>
              قم برفع ملف Excel يحتوي على البيانات المطلوب استيرادها
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Download Template */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">تحميل نموذج Excel</p>
                  <p className="text-sm text-muted-foreground">
                    قم بتحميل النموذج وملء البيانات المطلوبة
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDownloadTemplate} size="sm">
                <Download className="h-4 w-4 ml-2" />
                تحميل النموذج
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">رفع الملف</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">معاينة البيانات</h4>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-right">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="px-3 py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  عرض أول 5 سجلات من الملف
                </p>
              </div>
            )}

            {/* Success Message */}
            {file && errors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  الملف جاهز للاستيراد
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || errors.length > 0 || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  استيراد البيانات
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}