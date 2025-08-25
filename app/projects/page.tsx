'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Building2, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"
import { formatCurrency } from "@/lib/utils"

interface Project {
  id: string
  code: string
  name: string
  clientId?: string
  location?: string
  status: string
  startDate: string
  endDate?: string
  budget?: number
  description?: string
  createdAt: string
  client?: {
    id: string
    name: string
  }
  _count?: {
    units: number
    phases: number
    contracts: number
  }
}

interface Client {
  id: string
  code: string
  name: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    clientId: '',
    location: '',
    status: 'active',
    startDate: '',
    endDate: '',
    budget: '',
    description: ''
  })

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/projects/${editingId}` : '/api/projects'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchProjects()
        setFormData({
          code: '',
          name: '',
          clientId: '',
          location: '',
          status: 'active',
          startDate: '',
          endDate: '',
          budget: '',
          description: ''
        })
        setEditingId(null)
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setShowForm(true)
    setFormData({
      code: project.code,
      name: project.name,
      clientId: project.clientId || '',
      location: project.location || '',
      status: project.status,
      startDate: project.startDate ? project.startDate.substring(0, 10) : '',
      endDate: project.endDate ? project.endDate.substring(0, 10) : '',
      budget: project.budget ? String(project.budget) : '',
      description: project.description || ''
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'suspended': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      case 'suspended': return 'معلق'
      default: return status
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold">المشاريع</h1>
          <p className="text-muted-foreground">إدارة المشاريع العقارية</p>
        </div>
        <Button type="button" onClick={(e) => { e.preventDefault(); setEditingId(null); setShowForm(true) }}>
          <Plus className="ml-2 h-4 w-4" />
          مشروع جديد
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن مشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>إضافة مشروع جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">كود المشروع</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="سيتم توليده تلقائياً"
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">اسم المشروع *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">العميل</Label>
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
                      <Label htmlFor="status">الحالة *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="suspended">معلق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">الموقع</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">تاريخ البداية *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">تاريخ النهاية</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">الميزانية</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      حفظ
                    </Button>
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
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا يوجد مشاريع مسجلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>كود: {project.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <Button variant="outline" className="h-9 px-4 rounded-xl" onClick={() => handleEdit(project)}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل
                      </Button>
                      <Button variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="ml-2 h-4 w-4" /> حذف
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.client && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">العميل:</span> {project.client.name}
                    </div>
                  )}
                  {project.location && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">الموقع:</span> {project.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateShort(project.startDate)}</span>
                    {project.endDate && (
                      <>
                        <span>-</span>
                        <span>{formatDateShort(project.endDate)}</span>
                      </>
                    )}
                  </div>
                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatCurrency(project.budget)}</span>
                    </div>
                  )}
                  <div className="flex gap-4 pt-2 text-xs text-muted-foreground border-t">
                    <span>وحدات: {project._count?.units || 0}</span>
                    <span>مراحل: {project._count?.phases || 0}</span>
                    <span>عقود: {project._count?.contracts || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}