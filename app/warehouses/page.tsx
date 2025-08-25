'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Warehouse, X, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Warehouse {
  id: string
  code: string
  name: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    materialMoves: number
  }
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data)
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/warehouses/${editingId}` : '/api/warehouses'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchWarehouses()
        setFormData({ code: '', name: '', location: '' })
        setEditingId(null)
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating warehouse:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleEdit = (warehouse: Warehouse) => {
    setEditingId(warehouse.id)
    setShowForm(true)
    setFormData({ code: warehouse.code, name: warehouse.name, location: warehouse.location || '' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المخزن؟')) return
    try {
      const response = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchWarehouses()
    } catch (error) {
      console.error('Error deleting warehouse:', error)
    }
  }

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">المخازن</h1>
          <p className="text-muted-foreground">إدارة المخازن ومواقع التخزين</p>
        </div>
        <Button onClick={() => { setEditingId(null); setShowForm(true) }}>
          <Plus className="ml-2 h-4 w-4" />
          مخزن جديد
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالكود أو الاسم أو الموقع..."
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
                <CardTitle>{editingId ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد'}</CardTitle>
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
                    <Label htmlFor="code">كود المخزن</Label>
                    <Input
                      id="code"
                      placeholder="WH001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      disabled={!!editingId}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المخزن</Label>
                    <Input
                      id="name"
                      placeholder="المخزن الرئيسي"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    placeholder="المنطقة الصناعية - شارع 10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="h-11 rounded-xl">حفظ المخزن</Button>
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

      {/* Warehouses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWarehouses.map((warehouse) => (
          <motion.div
            key={warehouse.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">كود: {warehouse.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full px-2 py-1 text-xs ${
                      warehouse.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {warehouse.isActive ? 'نشط' : 'غير نشط'}
                    </div>
                    <Button variant="outline" className="h-9 px-4 rounded-xl" onClick={() => handleEdit(warehouse)}>
                      <Edit className="ml-2 h-4 w-4" /> تعديل
                    </Button>
                    <Button variant="destructive" className="h-9 px-4 rounded-xl" onClick={() => handleDelete(warehouse.id)}>
                      <Trash2 className="ml-2 h-4 w-4" /> حذف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {warehouse.location && (
                    <div className="فع items-center text-sm">
                      <span className="font-medium ml-2">الموقع:</span>
                      <span className="text-muted-foreground">{warehouse.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <span className="font-medium ml-2">الحركات:</span>
                    <span className="text-muted-foreground">
                      {warehouse._count?.materialMoves || 0} حركة
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="font-medium ml-2">تاريخ الإنشاء:</span>
                    <span className="text-muted-foreground">
                      {new Date(warehouse.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Warehouse className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchTerm ? 'لا توجد مخازن تطابق البحث' : 'لا توجد مخازن مسجلة'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}