'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, X, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"

interface Account {
  id: string
  code: string
  name: string
  type: string
}

interface Project {
  id: string
  code: string
  name: string
}

interface JournalLine {
  id?: string
  accountId: string
  account?: Account
  debit: number
  credit: number
  description?: string
}

interface JournalEntry {
  id: string
  entryNo: string
  date: string
  type: string
  projectId?: string
  project?: Project
  description?: string
  reference?: string
  isPosted: boolean
  createdAt: string
  lines: JournalLine[]
}

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'general',
    projectId: '',
    description: '',
    reference: '',
    lines: [
      { accountId: '', debit: 0, credit: 0, description: '' },
      { accountId: '', debit: 0, credit: 0, description: '' }
    ] as JournalLine[]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [entriesRes, accountsRes, projectsRes] = await Promise.all([
        fetch('/api/accounting/journal-entries'),
        fetch('/api/accounting/accounts'),
        fetch('/api/projects')
      ])

      if (entriesRes.ok && accountsRes.ok && projectsRes.ok) {
        setEntries(await entriesRes.json())
        setAccounts(await accountsRes.json())
        setProjects(await projectsRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { accountId: '', debit: 0, credit: 0, description: '' }]
    })
  }

  const removeLine = (index: number) => {
    if (formData.lines.length > 2) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index)
      })
    }
  }

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const newLines = [...formData.lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setFormData({ ...formData, lines: newLines })
  }

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    return { totalDebit, totalCredit, difference: Math.abs(totalDebit - totalCredit) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const { difference } = calculateTotals()
    if (difference > 0.01) {
      setError('القيد غير متوازن - يجب أن يكون مجموع المدين مساوياً لمجموع الدائن')
      return
    }
    
    try {
      const response = await fetch('/api/accounting/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lines: formData.lines.map(line => ({
            accountId: line.accountId,
            debit: parseFloat(line.debit.toString()) || 0,
            credit: parseFloat(line.credit.toString()) || 0,
            description: line.description
          }))
        }),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchData()
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'general',
          projectId: '',
          description: '',
          reference: '',
          lines: [
            { accountId: '', debit: 0, credit: 0, description: '' },
            { accountId: '', debit: 0, credit: 0, description: '' }
          ]
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating entry:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const filteredEntries = entries.filter(entry =>
    entry.entryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeText = (type: string) => {
    switch (type) {
      case 'general': return 'عام'
      case 'payment': return 'دفع'
      case 'receipt': return 'قبض'
      case 'adjustment': return 'تسوية'
      default: return type
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
          <h1 className="text-3xl font-bold">القيود المحاسبية</h1>
          <p className="text-muted-foreground">إدارة القيود اليومية</p>
        </div>
        <Button type="button" onClick={() => setShowForm(true)}>
          <Plus className="ml-2 h-4 w-4" />
          قيد جديد
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث برقم القيد أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showForm && (
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة قيد جديد</CardTitle>
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
                
                <div className="grid gap-4 md:grid-cols-4">
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
                    <Label htmlFor="type">نوع القيد</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">عام</SelectItem>
                        <SelectItem value="payment">دفع</SelectItem>
                        <SelectItem value="receipt">قبض</SelectItem>
                        <SelectItem value="adjustment">تسوية</SelectItem>
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

                  <div className="space-y-2">
                    <Label htmlFor="reference">المرجع</Label>
                    <Input
                      id="reference"
                      placeholder="رقم الفاتورة أو المستند"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف القيد</Label>
                  <Input
                    id="description"
                    placeholder="وصف مختصر للقيد"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Journal Lines */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>سطور القيد</Label>
                    <Button type="button" size="sm" onClick={addLine}>
                      <Plus className="ml-2 h-3 w-3" />
                      إضافة سطر
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2 font-medium text-sm">الحساب</th>
                          <th className="text-right p-2 font-medium text-sm">مدين</th>
                          <th className="text-right p-2 font-medium text-sm">دائن</th>
                          <th className="text-right p-2 font-medium text-sm">البيان</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lines.map((line, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              <Select 
                                value={line.accountId} 
                                onValueChange={(value) => updateLine(index, 'accountId', value)}
                                required
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="اختر الحساب" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                      {account.name} ({account.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={line.debit || ''}
                                onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                step="0.01"
                                className="w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={line.credit || ''}
                                onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                step="0.01"
                                className="w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={line.description || ''}
                                onChange={(e) => updateLine(index, 'description', e.target.value)}
                                placeholder="بيان السطر"
                              />
                            </td>
                            <td className="p-2">
                              {formData.lines.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLine(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-medium">
                          <td className="p-2 text-right">المجموع</td>
                          <td className="p-2 text-right">{formatCurrency(calculateTotals().totalDebit)}</td>
                          <td className="p-2 text-right">{formatCurrency(calculateTotals().totalCredit)}</td>
                          <td colSpan={2} className="p-2 text-right">
                            {calculateTotals().difference > 0.01 && (
                              <span className="text-red-600">
                                الفرق: {formatCurrency(calculateTotals().difference)}
                              </span>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">حفظ القيد</Button>
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
      )}

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>القيود المسجلة</CardTitle>
          <CardDescription>
            عرض {filteredEntries.length} قيد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{entry.entryNo}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        entry.isPosted 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {entry.isPosted ? 'مرحل' : 'مسودة'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {getTypeText(entry.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateShort(entry.date)}
                      {entry.project && ` • ${entry.project.name}`}
                      {entry.reference && ` • مرجع: ${entry.reference}`}
                    </p>
                    {entry.description && (
                      <p className="text-sm mt-1">{entry.description}</p>
                    )}
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-right pb-2">الحساب</th>
                        <th className="text-right pb-2">مدين</th>
                        <th className="text-right pb-2">دائن</th>
                        <th className="text-right pb-2">البيان</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{line.account?.name}</td>
                          <td className="py-2 text-right">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className="py-2 text-right">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                          <td className="py-2">{line.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchTerm ? 'لا توجد قيود تطابق البحث' : 'لا توجد قيود مسجلة'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}