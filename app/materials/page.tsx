'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, X, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Material {
  id: string
  code: string
  name: string
  unit: string
  minQuantity: number
  currentQty: number
  lastPrice: number
  category?: string
  description?: string
  createdAt: string
  updatedAt: string
  _count?: {
    materialMoves: number
  }
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: 'قطعة',
    minQuantity: '',
    category: '',
    description: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/materials/${editingId}` : '/api/materials'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchMaterials()
        setFormData({
          code: '',
          name: '',
          unit: 'قطعة',
          minQuantity: '',
          category: '',
          description: ''
        })
        setEditingId(null)
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating material:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleEdit = (m: Material) => {
    setEditingId(m.id)
    setShowForm(true)
    setFormData({
      code: m.code,
      name: m.name,
      unit: m.unit,
      minQuantity: String(m.minQuantity),
      category: m.category || '',
      description: m.description || ''
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return
    try {
      const response = await fetch(`/api/materials/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchMaterials()
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify_between">
        <div>
          <h1 className="text-3xl font-bold">المواد</h1>
          <p className="text-muted-foreground">إدارة المواد والمخزون</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowForm(true) }}>
          <Plus className="ml-2 h-4 w-4" />
          مادة جديدة
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالكود أو الاسم أو الفئة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingId ? 'تعديل بيانات المادة' : 'إضافة مادة جديدة'}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                    setEditingId(null)
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
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">كود المادة</Label>
                    <Input
                      id="code"
                      placeholder="MAT001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المادة</Label>
                    <Input
                      id="name"
                      placeholder="أسمنت أبيض"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="unit">وحدة القياس</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="قطعة">قطعة</SelectItem>
                        <SelectItem value="متر">متر</SelectItem>
                        <SelectItem value="متر مربع">متر مربع</SelectItem>
                        <SelectItem value="متر مكعب">متر مكعب</SelectItem>
                        <SelectItem value="كيلو">كيلو</SelectItem>
                        <SelectItem value="طن">طن</SelectItem>
                        <SelectItem value="لتر">لتر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">الحد الأدنى</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      placeholder="0"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة</Label>
                    <Input
                      id="category"
                      placeholder="مواد بناء"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="وصف تفصيلي للمادة..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="h-11 rounded-xl">حفظ المادة</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setError('')
                      setEditingId(null)
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

      {/* Materials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        كود: {material.code}
                        {material.category && ` • ${material.category}`}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" className="h-9 px-4 rounded-xl" onClick={() => handleEdit(material)}>
                      <Edit className="ml-2 h-4 w-4" /> تعديل
                    </Button>
                    <Button variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => handleDelete(material.id)}>
                      <Trash2 className="ml-2 h-4 w-4" /> حذف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">الوحدة:</span> {material.unit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">الحد الأدنى:</span> {material.minQuantity}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">الكمية الحالية:</span>
                      <span className={`font-medium ${
                        material.currentQty < material.minQuantity ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {material.currentQty} {material.unit}
                      </span>
                    </div>
                    
                    {material.lastPrice > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">آخر سعر:</span>
                        <span className="font-medium">{formatCurrency(material.lastPrice)}</span>
                      </div>
                    )}
                  </div>
                  
                  {material.currentQty < material.minQuantity && (
                    <div className="flex items-center gap-2 rounded-md bg-orange-50 p-2 text-xs text-orange-700">
                      <AlertTriangle className="h-3 w-3" />
                      الكمية أقل من الحد الأدنى
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-sm text-muted-foreground">
                      الحركات: {material._count?.materialMoves || 0}
                    </div>
                    <Button variant="outline" size="sm">
                      عرض الحركات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchTerm ? 'لا توجد مواد تطابق البحث' : 'لا توجد مواد مسجلة'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}