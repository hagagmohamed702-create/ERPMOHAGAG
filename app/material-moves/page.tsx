'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, X } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"
import { getTodayDateString } from "@/lib/utils/date"
import { useErrorToast } from "@/lib/hooks/useErrorToast"

interface MaterialMove {
  id: string
  date: string
  type: 'in' | 'out' | 'transfer'
  materialId: string
  warehouseId: string
  projectId?: string
  quantity: number
  price: number
  totalAmount: number
  reference?: string
  note?: string
  createdAt: string
  material: {
    id: string
    code: string
    name: string
    unit: string
  }
  warehouse: {
    id: string
    code: string
    name: string
  }
  project?: {
    id: string
    code: string
    name: string
  }
}

interface Material {
  id: string
  code: string
  name: string
  unit: string
}

interface Warehouse {
  id: string
  code: string
  name: string
}

interface Project {
  id: string
  code: string
  name: string
}

export default function MaterialMovesPage() {
  const { showError, showSuccess } = useErrorToast()
  const [moves, setMoves] = useState<MaterialMove[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: '',
    type: 'in',
    materialId: '',
    warehouseId: '',
    projectId: '',
    quantity: '',
    price: '',
    reference: '',
    note: ''
  })

  useEffect(() => {
    fetchData()
    // Set date after mount to prevent hydration mismatch
    setFormData(prev => ({ ...prev, date: getTodayDateString() }))
  }, [])

  const fetchData = async () => {
    try {
      const [movesRes, materialsRes, warehousesRes, projectsRes] = await Promise.all([
        fetch('/api/material-moves'),
        fetch('/api/materials'),
        fetch('/api/warehouses'),
        fetch('/api/projects')
      ])

      if (movesRes.ok && materialsRes.ok && warehousesRes.ok && projectsRes.ok) {
        setMoves(await movesRes.json())
        setMaterials(await materialsRes.json())
        setWarehouses(await warehousesRes.json())
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
    
    // Client-side validation
    if (!formData.materialId) {
      const msg = 'يرجى اختيار المادة'
      setError(msg)
      showError(msg)
      return
    }
    
    if (!formData.warehouseId) {
      const msg = 'يرجى اختيار المخزن'
      setError(msg)
      showError(msg)
      return
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      const msg = 'يرجى إدخال كمية صحيحة'
      setError(msg)
      showError(msg)
      return
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      const msg = 'يرجى إدخال سعر صحيح'
      setError(msg)
      showError(msg)
      return
    }
    
    try {
      console.log('Form data before submit:', formData)
      const preparedData = prepareFormData(formData)
      console.log('Prepared data:', preparedData)
      
      const response = await fetch('/api/material-moves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      })
      
      const result = await parseApiResponse(response)
      console.log('API response:', response.status, result)
      
      if (response.ok) {
        await fetchData()
        setFormData({
          date: getTodayDateString(),
          type: 'in',
          materialId: '',
          warehouseId: '',
          projectId: '',
          quantity: '',
          price: '',
          reference: '',
          note: ''
        })
        setShowForm(false)
        showSuccess('تم إضافة حركة المواد بنجاح')
      } else {
        const errorMsg = getErrorMessage(result)
        setError(errorMsg)
        showError(errorMsg)
      }
    } catch (error) {
      console.error('Error creating move:', error)
      const errorMsg = 'حدث خطأ في الاتصال بالخادم'
      setError(errorMsg)
      showError(error, errorMsg)
    }
  }

  const filteredMoves = moves.filter(move =>
    move.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    move.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    move.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />
      case 'out':
        return <ArrowUpCircle className="h-5 w-5 text-red-600" />
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-blue-600" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'in':
        return 'إدخال'
      case 'out':
        return 'إخراج'
      case 'transfer':
        return 'تحويل'
    }
  }

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
          <h1 className="text-3xl font-bold">حركات المواد</h1>
          <p className="text-muted-foreground">سجل حركات المواد بين المخازن</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="ml-2 h-4 w-4" />
          حركة جديدة
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالمادة أو المخزن أو المرجع..."
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
                <CardTitle>إضافة حركة مواد</CardTitle>
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
                    <Label htmlFor="type">نوع الحركة</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">إدخال</SelectItem>
                        <SelectItem value="out">إخراج</SelectItem>
                        <SelectItem value="transfer">تحويل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">المرجع</Label>
                    <Input
                      id="reference"
                      placeholder="رقم الفاتورة أو أمر الشراء"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="material">المادة</Label>
                    <Select value={formData.materialId} onValueChange={(value) => setFormData({ ...formData, materialId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} ({material.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="warehouse">المخزن</Label>
                    <Select value={formData.warehouseId} onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المخزن" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">المشروع (اختياري)</Label>
                    <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
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

                <div className="space-y-2">
                  <Label htmlFor="note">ملاحظات</Label>
                  <textarea
                    id="note"
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="ملاحظات إضافية..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">حفظ الحركة</Button>
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

      {/* Moves Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحركات</CardTitle>
          <CardDescription>
            عرض {filteredMoves.length} حركة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-medium text-muted-foreground">التاريخ</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">النوع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المادة</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المخزن</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المشروع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الكمية</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">السعر</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الإجمالي</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المرجع</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoves.map((move) => (
                  <tr key={move.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{formatDateShort(move.date)}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(move.type)}
                        <span>{getTypeText(move.type)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{move.material.name}</p>
                        <p className="text-sm text-muted-foreground">{move.material.code}</p>
                      </div>
                    </td>
                    <td className="p-2">{move.warehouse.name}</td>
                    <td className="p-2">{move.project?.name || '-'}</td>
                    <td className="p-2">
                      <span className={move.type === 'out' ? 'text-red-600' : 'text-green-600'}>
                        {move.type === 'out' ? '-' : '+'}{move.quantity} {move.material.unit}
                      </span>
                    </td>
                    <td className="p-2">{formatCurrency(move.price)}</td>
                    <td className="p-2 font-medium">{formatCurrency(move.totalAmount)}</td>
                    <td className="p-2">{move.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMoves.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'لا توجد حركات تطابق البحث' : 'لا توجد حركات مسجلة'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}