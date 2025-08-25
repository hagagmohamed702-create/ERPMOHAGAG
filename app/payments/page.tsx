'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { MotionSection } from "@/components/ui/motion-section"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Plus, DollarSign, Calendar, CreditCard, Banknote, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDate } from "@/lib/utils"
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"
import { ExportButton } from "@/components/export/export-button"
import type { ColumnDef } from "@tanstack/react-table"

interface Payment {
  id: string
  date: string
  amount: number
  method: string
  clientId?: string
  installmentId?: string
  invoiceId?: string
  reference?: string
  note?: string
  createdAt: string
  client?: {
    id: string
    name: string
    code: string
  }
  installment?: {
    id: string
    installmentNo: number
    contract: {
      contractNo: string
    }
  }
  invoice?: {
    invoiceNo: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'cash',
    clientId: '',
    installmentId: '',
    invoiceId: '',
    reference: '',
    note: ''
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchPayments()
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          method: 'cash',
          clientId: '',
          installmentId: '',
          invoiceId: '',
          reference: '',
          note: ''
        })
        setShowForm(false)
      } else {
        console.error(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating payment:', error)
    }
  }

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      cash: { label: 'نقدي', icon: Banknote, variant: 'default' as const },
      bank: { label: 'تحويل بنكي', icon: DollarSign, variant: 'secondary' as const },
      check: { label: 'شيك', icon: CreditCard, variant: 'outline' as const }
    }
    
    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.cash
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(row.getValue("date"))}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "المبلغ",
      cell: ({ row }) => (
        <div className="font-medium text-green-600">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "method",
      header: "طريقة الدفع",
      cell: ({ row }) => getMethodBadge(row.getValue("method")),
    },
    {
      id: "client",
      header: "العميل",
      cell: ({ row }) => {
        const payment = row.original
        return payment.client ? (
          <div>
            <div className="font-medium">{payment.client.name}</div>
            <div className="text-sm text-muted-foreground">{payment.client.code}</div>
          </div>
        ) : '-'
      },
    },
    {
      id: "related",
      header: "مرتبط بـ",
      cell: ({ row }) => {
        const payment = row.original
        if (payment.installment) {
          return (
            <Badge variant="outline">
              قسط #{payment.installment.installmentNo} - عقد {payment.installment.contract.contractNo}
            </Badge>
          )
        } else if (payment.invoice) {
          return (
            <Badge variant="outline">
              فاتورة {payment.invoice.invoiceNo}
            </Badge>
          )
        }
        return '-'
      },
    },
    {
      accessorKey: "reference",
      header: "المرجع",
      cell: ({ row }) => row.getValue("reference") || '-',
    },
    {
      accessorKey: "note",
      header: "ملاحظات",
      cell: ({ row }) => row.getValue("note") || '-',
    }
  ]

  // Calculate statistics
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const cashPayments = payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0)
  const bankPayments = payments.filter(p => p.method === 'bank').reduce((sum, p) => sum + p.amount, 0)
  const checkPayments = payments.filter(p => p.method === 'check').reduce((sum, p) => sum + p.amount, 0)

  return (
    <MotionSection className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/real-estate">العقارات</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>المدفوعات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المدفوعات</h1>
          <p className="text-muted-foreground">إدارة المدفوعات والمقبوضات</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={payments}
            filename="payments"
            title="قائمة المدفوعات"
            columns={[
              { key: 'date', label: 'التاريخ' },
              { key: 'amount', label: 'المبلغ' },
              { key: 'method', label: 'طريقة الدفع' },
              { key: 'reference', label: 'المرجع' },
              { key: 'note', label: 'ملاحظات' }
            ]}
          />
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة دفعة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
            <p className="text-xs text-muted-foreground">{payments.length} دفعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدفوعات نقدية</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashPayments)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.method === 'cash').length} دفعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحويلات بنكية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(bankPayments)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.method === 'bank').length} تحويل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">شيكات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(checkPayments)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.method === 'check').length} شيك
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={payments}
            loading={loading}
            onAdd={() => setShowForm(true)}
            emptyStateTitle="لا توجد مدفوعات"
            emptyStateDescription="ابدأ بإضافة أول دفعة"
          />
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة دفعة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات الدفعة الجديدة
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">طريقة الدفع *</Label>
                <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank">تحويل بنكي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">المرجع</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="رقم الحوالة أو الشيك"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="note">ملاحظات</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button type="submit">حفظ الدفعة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MotionSection>
  )
}