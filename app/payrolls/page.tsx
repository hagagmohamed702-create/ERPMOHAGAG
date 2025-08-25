'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Receipt, X, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDate } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Employee {
  id: string
  code: string
  name: string
  position?: string
  department?: string
  salary: number
}

interface Project {
  id: string
  code: string
  name: string
}

interface ProjectPhase {
  id: string
  name: string
  projectId: string
}

interface Payroll {
  id: string
  employeeId: string
  projectId?: string
  phaseId?: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
  paidAt?: string
  note?: string
  createdAt: string
  employee: Employee
  project?: Project
  phase?: ProjectPhase
}

const months = [
  { value: 1, label: 'يناير' },
  { value: 2, label: 'فبراير' },
  { value: 3, label: 'مارس' },
  { value: 4, label: 'أبريل' },
  { value: 5, label: 'مايو' },
  { value: 6, label: 'يونيو' },
  { value: 7, label: 'يوليو' },
  { value: 8, label: 'أغسطس' },
  { value: 9, label: 'سبتمبر' },
  { value: 10, label: 'أكتوبر' },
  { value: 11, label: 'نوفمبر' },
  { value: 12, label: 'ديسمبر' }
]

export default function PayrollsPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [currentYear, setCurrentYear] = useState(2024)
  const [currentMonth, setCurrentMonth] = useState(1)
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
    setCurrentMonth(new Date().getMonth() + 1)
  }, [])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    projectId: '',
    phaseId: '',
    month: currentMonth,
    year: currentYear,
    basicSalary: '',
    allowances: '0',
    deductions: '0',
    note: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      setFormData(prev => ({
        ...prev,
        basicSalary: selectedEmployee.salary.toString()
      }))
    }
  }, [selectedEmployee])

  const fetchData = async () => {
    try {
      const [payrollsRes, employeesRes, projectsRes] = await Promise.all([
        fetch('/api/payrolls'),
        fetch('/api/employees'),
        fetch('/api/projects')
      ])

      if (payrollsRes.ok && employeesRes.ok && projectsRes.ok) {
        setPayrolls(await payrollsRes.json())
        setEmployees(await employeesRes.json())
        setProjects(await projectsRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0
    const allowances = parseFloat(formData.allowances) || 0
    const deductions = parseFloat(formData.deductions) || 0
    return basic + allowances - deductions
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/payrolls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData({
          ...formData,
          month: parseInt(formData.month.toString()),
          year: parseInt(formData.year.toString())
        })),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchData()
        setFormData({
          employeeId: '',
          projectId: '',
          phaseId: '',
          month: currentMonth,
          year: currentYear,
          basicSalary: '',
          allowances: '0',
          deductions: '0',
          note: ''
        })
        setSelectedEmployee(null)
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating payroll:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const filteredPayrolls = payrolls.filter(payroll =>
    payroll.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'paid': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'approved': return 'معتمد'
      case 'paid': return 'مدفوع'
      default: return status
    }
  }

  const totalPayrolls = filteredPayrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0)

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
          <h1 className="text-3xl font-bold">المرتبات</h1>
          <p className="text-muted-foreground">إدارة مرتبات الموظفين</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="ml-2 h-4 w-4" />
          مرتب جديد
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المرتبات</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPayrolls)}</p>
            </div>
            <Receipt className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالموظف أو المشروع..."
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
                <CardTitle>إضافة مرتب جديد</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                    setSelectedEmployee(null)
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
                    <Label htmlFor="employee">الموظف</Label>
                    <Select 
                      value={formData.employeeId} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, employeeId: value })
                        const emp = employees.find(e => e.id === value)
                        setSelectedEmployee(emp || null)
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.code})
                            {employee.position && ` - ${employee.position}`}
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="month">الشهر</Label>
                    <Select 
                      value={formData.month.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">السنة</Label>
                    <Select 
                      value={formData.year.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">الراتب الأساسي</Label>
                    <Input
                      id="basicSalary"
                      type="number"
                      placeholder="0"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="allowances">البدلات</Label>
                    <Input
                      id="allowances"
                      type="number"
                      placeholder="0"
                      value={formData.allowances}
                      onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deductions">الخصومات</Label>
                    <Input
                      id="deductions"
                      type="number"
                      placeholder="0"
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">صافي المرتب:</span>
                    <span className="text-xl font-bold">{formatCurrency(calculateNetSalary())}</span>
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
                  <Button type="submit">حفظ المرتب</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setError('')
                      setSelectedEmployee(null)
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

      {/* Payrolls Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المرتبات</CardTitle>
          <CardDescription>
            عرض {filteredPayrolls.length} مرتب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-medium text-muted-foreground">الموظف</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الشهر/السنة</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">المشروع</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الراتب الأساسي</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">البدلات</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الخصومات</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">صافي المرتب</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الحالة</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((payroll) => (
                  <tr key={payroll.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{payroll.employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payroll.employee.position || payroll.employee.department}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      {months.find(m => m.value === payroll.month)?.label} {payroll.year}
                    </td>
                    <td className="p-2">{payroll.project?.name || '-'}</td>
                    <td className="p-2">{formatCurrency(payroll.basicSalary)}</td>
                    <td className="p-2 text-green-600">+{formatCurrency(payroll.allowances)}</td>
                    <td className="p-2 text-red-600">-{formatCurrency(payroll.deductions)}</td>
                    <td className="p-2 font-medium">{formatCurrency(payroll.netSalary)}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(payroll.status)}`}>
                        {getStatusText(payroll.status)}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="outline">
                        <DollarSign className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td colSpan={6} className="p-2 text-right">المجموع</td>
                  <td className="p-2">{formatCurrency(totalPayrolls)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredPayrolls.length === 0 && (
            <div className="py-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchTerm ? 'لا توجد مرتبات تطابق البحث' : 'لا توجد مرتبات مسجلة'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}