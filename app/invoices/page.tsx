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
import { Plus, FileText, Calendar, DollarSign, User, Building } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDate } from "@/lib/utils"
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"
import { ExportButton } from "@/components/export/export-button"
import type { ColumnDef } from "@tanstack/react-table"

interface Invoice {
  id: string
  invoiceNo: string
  date: string
  type: 'sales' | 'purchase'
  clientId?: string
  supplierId?: string
  totalAmount: number
  taxAmount: number
  discount: number
  status: string
  dueDate?: string
  notes?: string
  createdAt: string
  client?: {
    id: string
    name: string
    code: string
  }
  supplier?: {
    id: string
    name: string
    code: string
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    type: 'sales' as 'sales' | 'purchase',
    clientId: '',
    supplierId: '',
    totalAmount: '',
    taxAmount: '0',
    discount: '0',
    status: 'draft',
    dueDate: '',
    notes: ''
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          taxAmount: parseFloat(formData.taxAmount),
          discount: parseFloat(formData.discount)
        }),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchInvoices()
        setFormData({
          invoiceNo: '',
          date: new Date().toISOString().split('T')[0],
          type: 'sales',
          clientId: '',
          supplierId: '',
          totalAmount: '',
          taxAmount: '0',
          discount: '0',
          status: 'draft',
          dueDate: '',
          notes: ''
        })
        setShowForm(false)
      } else {
        console.error(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', variant: 'outline' as const },
      sent: { label: 'مرسلة', variant: 'secondary' as const },
      paid: { label: 'مدفوعة', variant: 'default' as const },
      cancelled: { label: 'ملغاة', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNo",
      header: "رقم الفاتورة",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceNo")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "type",
      header: "النوع",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge variant={type === 'sales' ? 'default' : 'secondary'}>
            {type === 'sales' ? 'مبيعات' : 'مشتريات'}
          </Badge>
        )
      },
    },
    {
      id: "party",
      header: "العميل/المورد",
      cell: ({ row }) => {
        const invoice = row.original
        if (invoice.type === 'sales' && invoice.client) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.client.name}</span>
            </div>
          )
        } else if (invoice.type === 'purchase' && invoice.supplier) {
          return (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.supplier.name}</span>
            </div>
          )
        }
        return null
      },
    },
    {
      accessorKey: "totalAmount",
      header: "المبلغ الإجمالي",
      cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "dueDate",
      header: "تاريخ الاستحقاق",
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as string
        return dueDate ? formatDate(dueDate) : '-'
      },
    }
  ]

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
            <BreadcrumbPage>الفواتير</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الفواتير</h1>
          <p className="text-muted-foreground">إدارة فواتير المبيعات والمشتريات</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={invoices}
            filename="invoices"
            title="قائمة الفواتير"
            columns={[
              { key: 'invoiceNo', label: 'رقم الفاتورة' },
              { key: 'date', label: 'التاريخ' },
              { key: 'type', label: 'النوع' },
              { key: 'totalAmount', label: 'المبلغ الإجمالي' },
              { key: 'status', label: 'الحالة' }
            ]}
          />
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة فاتورة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">فاتورة نشطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فواتير المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter(inv => inv.type === 'sales')
                  .reduce((sum, inv) => sum + inv.totalAmount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.type === 'sales').length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فواتير المشتريات</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter(inv => inv.type === 'purchase')
                  .reduce((sum, inv) => sum + inv.totalAmount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.type === 'purchase').length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في انتظار الدفع</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(inv => inv.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">فاتورة مرسلة</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={invoices}
            loading={loading}
            onAdd={() => setShowForm(true)}
            emptyStateTitle="لا توجد فواتير"
            emptyStateDescription="ابدأ بإضافة أول فاتورة"
          />
        </CardContent>
      </Card>

      {/* Add Invoice Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات الفاتورة الجديدة
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">رقم الفاتورة</Label>
                <Input
                  id="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  placeholder="سيتم توليده تلقائياً"
                  readOnly
                />
              </div>

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
                <Label htmlFor="type">نوع الفاتورة *</Label>
                <Select value={formData.type} onValueChange={(value: 'sales' | 'purchase') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">مبيعات</SelectItem>
                    <SelectItem value="purchase">مشتريات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">المبلغ الإجمالي *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxAmount">ضريبة القيمة المضافة</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  value={formData.taxAmount}
                  onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">الخصم</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="sent">مرسلة</SelectItem>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                    <SelectItem value="cancelled">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button type="submit">حفظ الفاتورة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MotionSection>
  )
}