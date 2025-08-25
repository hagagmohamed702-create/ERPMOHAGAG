'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Plus, Search, Edit, Trash2, X, MoreHorizontal, Mail, Phone, MapPin, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"
import { useErrorToast } from "@/lib/hooks/useErrorToast"
import { ExportButton } from "@/components/export/export-button"
import { ImportButton } from "@/components/import/import-button"
import type { ColumnDef } from "@tanstack/react-table"

interface Client {
  id: string
  code: string
  name: string
  phone?: string
  email?: string
  address?: string
  note?: string
  createdAt: string
  _count?: {
    contracts: number
    projects: number
    installments: number
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  })
  const { showError, showSuccess } = useErrorToast()

  useEffect(() => {
    fetchClients()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        const result = await parseApiResponse(response)
        showError(getErrorMessage(result))
      }
    } catch (error) {
      showError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const method = editingClient ? 'PUT' : 'POST'
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })

      const result = await parseApiResponse(response)
      
      if (response.ok) {
        showSuccess(editingClient ? 'تم تحديث العميل بنجاح' : 'تم إضافة العميل بنجاح')
        setShowForm(false)
        setEditingClient(null)
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          note: ''
        })
        fetchClients()
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      setError(getErrorMessage(error))
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      note: client.note || ''
    })
    setShowForm(true)
  }

  const handleImport = async (data: any[]) => {
    try {
      // Process each row
      for (const row of data) {
        if (!row.name) continue // Skip empty rows
        
        await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        })
      }
      
      // Refresh data
      await fetchClients()
    } catch (error) {
      console.error('Error importing clients:', error)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        const response = await fetch(`/api/clients/${id}`, {
          method: 'DELETE',
        })

        const result = await parseApiResponse(response)
        
        if (response.ok) {
          showSuccess('تم حذف العميل بنجاح')
          fetchClients()
        } else {
          showError(getErrorMessage(result))
        }
      } catch (error) {
        showError(getErrorMessage(error))
      }
    }
  }

  const columns: ColumnDef<Client>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "الكود",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("code")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: "الاسم",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "الهاتف",
        cell: ({ row }) => {
          const phone = row.getValue("phone") as string
          return phone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span dir="ltr">{phone}</span>
            </div>
          ) : null
        },
      },
      {
        accessorKey: "email",
        header: "البريد الإلكتروني",
        cell: ({ row }) => {
          const email = row.getValue("email") as string
          return email ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{email}</span>
            </div>
          ) : null
        },
      },
      {
        id: "stats",
        header: "الإحصائيات",
        cell: ({ row }) => {
          const client = row.original
          return (
            <div className="flex gap-2">
              {client._count?.contracts && client._count.contracts > 0 && (
                <Badge variant="secondary" className="badge-info">
                  {client._count.contracts} عقد
                </Badge>
              )}
              {client._count?.projects && client._count.projects > 0 && (
                <Badge variant="secondary" className="badge-success">
                  {client._count.projects} مشروع
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => {
          const client = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">فتح القائمة</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(client)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(client.id)}
                  className="text-destructive"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

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
            <BreadcrumbPage>العملاء</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">العملاء</h1>
          <p className="text-muted-foreground">إدارة بيانات العملاء</p>
        </div>
        <div className="flex gap-2">
          <ImportButton
            onImport={handleImport}
            columns={[
              { key: 'name', label: 'اسم العميل', required: true },
              { key: 'phone', label: 'رقم الهاتف' },
              { key: 'email', label: 'البريد الإلكتروني' },
              { key: 'address', label: 'العنوان' },
              { key: 'note', label: 'ملاحظات' }
            ]}
            templateName="clients"
          />
          <ExportButton
            data={clients}
            filename="clients"
            title="قائمة العملاء"
            columns={[
              { key: 'code', label: 'كود العميل' },
              { key: 'name', label: 'اسم العميل' },
              { key: 'phone', label: 'رقم الهاتف' },
              { key: 'email', label: 'البريد الإلكتروني' },
              { key: 'address', label: 'العنوان' }
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={clients}
            loading={loading}
            onAdd={() => {
              setEditingClient(null)
              setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                note: ''
              })
              setShowForm(true)
            }}
            emptyStateTitle="لا يوجد عملاء"
            emptyStateDescription="ابدأ بإضافة أول عميل"
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? 'قم بتحديث بيانات العميل' : 'أدخل بيانات العميل الجديد'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم العميل *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="btn-primary">
                {editingClient ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MotionSection>
  )
}