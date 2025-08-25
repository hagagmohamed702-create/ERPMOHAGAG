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
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface GenerateInstallmentsButtonProps {
  contractId: string
  contractNo: string
  onSuccess?: () => void
}

export function GenerateInstallmentsButton({ 
  contractId, 
  contractNo,
  onSuccess 
}: GenerateInstallmentsButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/contracts/${contractId}/generate-installments`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: 'success',
          message: data.message || 'تم توليد الأقساط بنجاح'
        })
        
        // Call onSuccess callback after a delay
        setTimeout(() => {
          setOpen(false)
          onSuccess?.()
        }, 2000)
      } else {
        setResult({
          type: 'error',
          message: data.error || 'حدث خطأ في توليد الأقساط'
        })
      }
    } catch (error) {
      console.error('Error generating installments:', error)
      setResult({
        type: 'error',
        message: 'حدث خطأ في الاتصال بالخادم'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        توليد الأقساط
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>توليد أقساط العقد</DialogTitle>
            <DialogDescription>
              سيتم توليد الأقساط للعقد رقم {contractNo} حسب خطة السداد المحددة
            </DialogDescription>
          </DialogHeader>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
                {result.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="text-sm font-medium mb-2">ملاحظات هامة:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• سيتم حساب تواريخ الاستحقاق تلقائياً حسب خطة السداد</li>
                <li>• سيتم توزيع المبلغ المتبقي على عدد الأقساط</li>
                <li>• القسط الأخير سيتضمن أي مبلغ متبقي من التقريب</li>
                <li>• لا يمكن توليد الأقساط مرة أخرى بعد التوليد الأول</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading || result?.type === 'success'}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  توليد الأقساط
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}