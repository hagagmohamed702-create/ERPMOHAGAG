'use client'

import { useState, useEffect } from 'react'
import { getTodayDateString } from '@/lib/utils/date'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, TrendingUp, X } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Client {
  id: string
  code: string
  name: string
}

interface Project {
  id: string
  code: string
  name: string
}

interface Revenue {
  id: string
  date: string
  amount: number
  type: string
  clientId?: string
  projectId?: string
  description?: string
  reference?: string
  createdAt: string
  client?: Client
  project?: Project
}

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    type: 'contract',
    clientId: '',
    projectId: '',
    description: '',
    reference: ''
  })

  useEffect(() => {
    fetchData()
    // Set date after mount to prevent hydration mismatch
    setFormData(prev => ({ ...prev, date: getTodayDateString() }))
  }, [])

  const fetchData = async () => {
    try {
      const [revenuesRes, clientsRes, projectsRes] = await Promise.all([
        fetch('/api/revenues'),
        fetch('/api/clients'),
        fetch('/api/projects')
      ])

      if (revenuesRes.ok && clientsRes.ok && projectsRes.ok) {
        setRevenues(await revenuesRes.json())
        setClients(await clientsRes.json())
        setProjects(await projectsRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/revenues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchData()
        setFormData({
          date: getTodayDateString(),
          amount: '',
          type: 'contract',
          clientId: '',
          projectId: '',
          description: '',
          reference: ''
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating revenue:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const filteredRevenues = revenues.filter(revenue =>
    revenue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revenue.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revenue.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revenue.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeText = (type: string) => {
    switch (type) {
      case 'contract': return 'عقد'
      case 'service': return 'خدمة'
      case 'other': return 'أخرى'
      default: return type
    }
  }

  const totalRevenue = filteredRevenues.reduce((sum, revenue) => sum + revenue.amount, 0)

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإيرادات</h1>
          <p className="text-muted-foreground">إدارة إيرادات الشركة</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إيراد جديد
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالوصف أو المرجع أو العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة إيراد جديد</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">التاريخ</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">النوع</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">عقد</SelectItem>
                        <SelectItem value="service">خدمة</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client">العميل (اختياري)</Label>
                    <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value === 'none' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون عميل</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project">المشروع (اختياري)</Label>
                    <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value === 'none' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المشروع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون مشروع</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({project.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">المرجع</Label>
                  <Input
                    id="reference"
                    placeholder="رقم الفاتورة أو المستند"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="وصف الإيراد..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">حفظ الإيراد</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setError('')
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Revenues Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الإيرادات</CardTitle>
          <CardDescription>
            عرض {filteredRevenues.length} إيراد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-medium text-muted-foreground">التاريخ</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">النوع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">العميل</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المشروع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المبلغ</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المرجع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الوصف</th>
                </tr>
              </thead>
              <tbody>
                {filteredRevenues.map((revenue) => (
                  <tr key={revenue.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{formatDateShort(revenue.date)}</td>
                    <td className="p-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-green-100 text-green-700">
                        {getTypeText(revenue.type)}
                      </span>
                    </td>
                    <td className="p-2">{revenue.client?.name || '-'}</td>
                    <td className="p-2">{revenue.project?.name || '-'}</td>
                    <td className="p-2 font-medium text-green-600">{formatCurrency(revenue.amount)}</td>
                    <td className="p-2">{revenue.reference || '-'}</td>
                    <td className="p-2 max-w-xs truncate" title={revenue.description}>
                      {revenue.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td colSpan={4} className="p-2 text-right">المجموع</td>
                  <td className="p-2 text-green-600">{formatCurrency(totalRevenue)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredRevenues.length === 0 && (
            <div className="py-12 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchTerm ? 'لا توجد إيرادات تطابق البحث' : 'لا توجد إيرادات مسجلة'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}