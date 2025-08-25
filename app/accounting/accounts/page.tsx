'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ChevronRight, ChevronDown, Calculator } from "lucide-react"
import { motion } from "framer-motion"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Account {
  id: string
  code: string
  name: string
  type: string
  parentId?: string
  isActive: boolean
  description?: string
  createdAt: string
  parent?: Account
  children?: Account[]
  _count?: {
    journalLines: number
  }
}

const accountTypes = [
  { value: 'asset', label: 'أصول' },
  { value: 'liability', label: 'خصوم' },
  { value: 'equity', label: 'حقوق الملكية' },
  { value: 'revenue', label: 'إيرادات' },
  { value: 'expense', label: 'مصروفات' }
]

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    parentId: '',
    isActive: true,
    description: ''
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounting/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/accounting/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchAccounts()
        setFormData({
          code: '',
          name: '',
          type: 'asset',
          parentId: '',
          isActive: true,
          description: ''
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating account:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const getAccountTypeText = (type: string) => {
    const accountType = accountTypes.find(t => t.value === type)
    return accountType?.label || type
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800'
      case 'liability': return 'bg-red-100 text-red-800'
      case 'equity': return 'bg-purple-100 text-purple-800'
      case 'revenue': return 'bg-green-100 text-green-800'
      case 'expense': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleAccount = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedAccounts(newExpanded)
  }

  const buildAccountTree = (accounts: Account[]): Account[] => {
    const accountMap = new Map<string, Account>()
    const rootAccounts: Account[] = []

    // First pass: create a map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] })
    })

    // Second pass: build the tree
    accounts.forEach(account => {
      const accountWithChildren = accountMap.get(account.id)!
      if (account.parentId) {
        const parent = accountMap.get(account.parentId)
        if (parent) {
          parent.children!.push(accountWithChildren)
        }
      } else {
        rootAccounts.push(accountWithChildren)
      }
    })

    return rootAccounts
  }

  const renderAccountTree = (account: Account, level: number = 0) => {
    const isExpanded = expandedAccounts.has(account.id)
    const hasChildren = account.children && account.children.length > 0

    return (
      <div key={account.id}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg cursor-pointer ${
            level > 0 ? 'mr-' + (level * 8) : ''
          }`}
          style={{ marginRight: `${level * 2}rem` }}
          onClick={() => hasChildren && toggleAccount(account.id)}
        >
          {hasChildren && (
            <button className="p-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div className="flex-1 flex items-center gap-4">
            <span className="font-mono text-sm text-muted-foreground">{account.code}</span>
            <span className="font-medium">{account.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
              {getAccountTypeText(account.type)}
            </span>
            {!account.isActive && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                غير نشط
              </span>
            )}
            {account._count?.journalLines && account._count.journalLines > 0 && (
              <span className="text-xs text-muted-foreground">
                ({account._count.journalLines} قيد)
              </span>
            )}
          </div>
        </motion.div>
        
        {isExpanded && hasChildren && (
          <div>
            {account.children!.map(child => renderAccountTree(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const accountTree = buildAccountTree(filteredAccounts)

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
          <h1 className="text-3xl font-bold">دليل الحسابات</h1>
          <p className="text-muted-foreground">إدارة شجرة الحسابات المحاسبية</p>
        </div>
        <Button type="button" onClick={(e) => { e.preventDefault(); setShowForm(true) }}>
          <Plus className="ml-2 h-4 w-4" />
          حساب جديد
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الحسابات..."
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
          <div className="w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>إضافة حساب جديد</CardTitle>
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
                      <Label htmlFor="code">رقم الحساب</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="سيتم توليده تلقائياً"
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">نوع الحساب *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accountTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الحساب *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: الصندوق النقدي"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentId">الحساب الرئيسي</Label>
                    <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحساب الرئيسي (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون حساب رئيسي</SelectItem>
                        {accounts
                          .filter(acc => acc.type === formData.type)
                          .map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
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
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive" className="mr-2">حساب نشط</Label>
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

      {/* Accounts Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            شجرة الحسابات
          </CardTitle>
          <CardDescription>
            انقر على الحساب لعرض الحسابات الفرعية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calculator className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لا توجد حسابات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-1">
              {accountTree.map(account => renderAccountTree(account))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}