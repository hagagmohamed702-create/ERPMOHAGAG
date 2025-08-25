'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, TrendingDown, X } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Supplier {
  id: string
  code: string
  name: string
}

interface Project {
  id: string
  code: string
  name: string
}

interface Expense {
  id: string
  date: string
  amount: number
  type: string
  supplierId?: string
  projectId?: string
  description?: string
  reference?: string
  createdAt: string
  supplier?: Supplier
  project?: Project
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'material',
    supplierId: '',
    projectId: '',
    description: '',
    reference: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expensesRes, suppliersRes, projectsRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/suppliers'),
        fetch('/api/projects')
      ])

      if (expensesRes.ok && suppliersRes.ok && projectsRes.ok) {
        setExpenses(await expensesRes.json())
        setSuppliers(await suppliersRes.json())
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
      const response = await fetch('/api/expenses', {
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
          date: new Date().toISOString().split('T')[0],
          amount: '',
          type: 'material',
          supplierId: '',
          projectId: '',
          description: '',
          reference: ''
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeText = (type: string) => {
    switch (type) {
      case 'material': return 'مواد'
      case 'labor': return 'عمالة'
      case 'equipment': return 'معدات'
      case 'admin': return 'إدارية'
      case 'other': return 'أخرى'
      default: return type
    }
  }

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

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
          <h1 className="text-3xl font-bold">المصروفات</h1>
          <p className="text-muted-foreground">إدارة مصروفات الشركة</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="ml-2 h-4 w-4" />
          مصروف جديد
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالوصف أو المرجع أو المورد..."
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
                <CardTitle>إضافة مصروف جديد</CardTitle>
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
                        <SelectItem value="material">مواد</SelectItem>
                        <SelectItem value="labor">عمالة</SelectItem>
                        <SelectItem value="equipment">معدات</SelectItem>
                        <SelectItem value="admin">إدارية</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">المورد (اختياري)</Label>
                    <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value === 'none' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون مورد</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.code})
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
                    placeholder="وصف المصروف..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">حفظ المصروف</Button>
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

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المصروفات</CardTitle>
          <CardDescription>
            عرض {filteredExpenses.length} مصروف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-medium text-muted-foreground">التاريخ</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">النوع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المورد</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المشروع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المبلغ</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المرجع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الوصف</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{formatDateShort(expense.date)}</td>
                    <td className="p-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-red-100 text-red-700">
                        {getTypeText(expense.type)}
                      </span>
                    </td>
                    <td className="p-2">{expense.supplier?.name || '-'}</td>
                    <td className="p-2">{expense.project?.name || '-'}</td>
                    <td className="p-2 font-medium text-red-600">{formatCurrency(expense.amount)}</td>
                    <td className="p-2">{expense.reference || '-'}</td>
                    <td className="p-2 max-w-xs truncate" title={expense.description}>
                      {expense.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td colSpan={4} className="p-2 text-right">المجموع</td>
                  <td className="p-2 text-red-600">{formatCurrency(totalExpenses)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center">
              <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchTerm ? 'لا توجد مصروفات تطابق البحث' : 'لا توجد مصروفات مسجلة'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}