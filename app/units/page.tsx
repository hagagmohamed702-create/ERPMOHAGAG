'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Home, MapPin, Layers, DollarSign, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Unit {
  id: string
  code: string
  projectId: string
  name?: string
  type: string
  floor?: number
  building?: string
  area: number
  price: number
  status: string
  notes?: string
  createdAt: string
  project: {
    id: string
    code: string
    name: string
  }
  _count?: {
    contracts: number
  }
}

interface Project {
  id: string
  code: string
  name: string
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    projectId: '',
    name: '',
    type: 'شقة',
    floor: '',
    building: '',
    area: '',
    price: '',
    status: 'available',
    notes: ''
  })

  useEffect(() => {
    fetchUnits()
    fetchProjects()
  }, [])

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units')
      if (response.ok) {
        const data = await response.json()
        setUnits(data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/units/${editingId}` : '/api/units'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchUnits()
        setFormData({
          code: '',
          projectId: '',
          name: '',
          type: 'شقة',
          floor: '',
          building: '',
          area: '',
          price: '',
          status: 'available',
          notes: ''
        })
        setEditingId(null)
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating unit:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleEdit = (unit: Unit) => {
    setEditingId(unit.id)
    setShowForm(true)
    setFormData({
      code: unit.code,
      projectId: unit.projectId,
      name: unit.name || '',
      type: unit.type,
      floor: unit.floor ? String(unit.floor) : '',
      building: unit.building || '',
      area: String(unit.area),
      price: String(unit.price),
      status: unit.status,
      notes: unit.notes || ''
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return
    try {
      const response = await fetch(`/api/units/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchUnits()
    } catch (error) {
      console.error('Error deleting unit:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'sold': return 'bg-red-100 text-red-800'
      case 'reserved': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاحة'
      case 'sold': return 'مباعة'
      case 'reserved': return 'محجوزة'
      case 'cancelled': return 'ملغاة'
      default: return status
    }
  }

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.project.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-3xl font-bold">الوحدات العقارية</h1>
          <p className="text-muted-foreground">إدارة الوحدات والشقق</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowForm(true) }}>
          <Plus className="ml-2 h-4 w-4" />
          وحدة جديدة
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الوحدات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متاحة</SelectItem>
                <SelectItem value="sold">مباعة</SelectItem>
                <SelectItem value="reserved">محجوزة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>إضافة وحدة جديدة</CardTitle>
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
                      <Label htmlFor="code">كود الوحدة *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projectId">المشروع *</Label>
                      <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })} required>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المشروع" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name} ({project.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">اسم الوحدة</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: شقة 101"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">النوع *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="شقة">شقة</SelectItem>
                          <SelectItem value="فيلا">فيلا</SelectItem>
                          <SelectItem value="محل">محل</SelectItem>
                          <SelectItem value="مكتب">مكتب</SelectItem>
                          <SelectItem value="أرض">أرض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor">الدور</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="building">المبنى</Label>
                      <Input
                        id="building"
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">الحالة *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">متاحة</SelectItem>
                          <SelectItem value="sold">مباعة</SelectItem>
                          <SelectItem value="reserved">محجوزة</SelectItem>
                          <SelectItem value="cancelled">ملغاة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">المساحة (م²) *</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">السعر *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <textarea
                      id="notes"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
          </motion.div>
        </div>
      )}

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا توجد وحدات مسجلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {unit.name || unit.code}
                      </CardTitle>
                      <CardDescription>{unit.project.name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                        {getStatusText(unit.status)}
                      </span>
                      <Button variant="outline" className="h-9 px-4 rounded-xl" onClick={() => handleEdit(unit)}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل
                      </Button>
                      <Button variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => handleDelete(unit.id)}>
                        <Trash2 className="ml-2 h-4 w-4" /> حذف
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{unit.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span>المساحة: {unit.area} م²</span>
                    </div>
                  </div>
                  
                  {(unit.floor || unit.building) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {unit.building && `مبنى ${unit.building}`}
                        {unit.floor && unit.building && ' - '}
                        {unit.floor && `الدور ${unit.floor}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg">{formatCurrency(unit.price)}</span>
                  </div>
                  
                  <div className="pt-2 text-xs text-muted-foreground border-t">
                    عقود: {unit._count?.contracts || 0}
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