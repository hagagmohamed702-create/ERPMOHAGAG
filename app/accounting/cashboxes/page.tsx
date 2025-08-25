'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Wallet, ArrowUpDown, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"

interface Cashbox {
  id: string
  code: string
  name: string
  balance: number
  type: string
  description?: string
  createdAt: string
  updatedAt: string
  _count?: {
    transfersFrom: number
    transfersTo: number
    vouchers: number
  }
}

export default function CashboxesPage() {
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'main',
    description: ''
  })
  const [transferData, setTransferData] = useState({
    fromCashboxId: '',
    toCashboxId: '',
    amount: '',
    description: '',
    reference: ''
  })

  useEffect(() => {
    fetchCashboxes()
  }, [])

  const fetchCashboxes = async () => {
    try {
      const response = await fetch('/api/accounting/cashboxes')
      if (response.ok) {
        const data = await response.json()
        setCashboxes(data)
      }
    } catch (error) {
      console.error('Error fetching cashboxes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/accounting/cashboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchCashboxes()
        setFormData({
          code: '',
          name: '',
          type: 'main',
          description: ''
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating cashbox:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (transferData.fromCashboxId === transferData.toCashboxId) {
      setError('لا يمكن التحويل من وإلى نفس الصندوق')
      return
    }
    
    try {
      const response = await fetch('/api/accounting/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transferData,
          amount: parseFloat(transferData.amount),
          date: new Date().toISOString()
        }),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchCashboxes()
        setTransferData({
          fromCashboxId: '',
          toCashboxId: '',
          amount: '',
          description: '',
          reference: ''
        })
        setShowTransferForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating transfer:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const getTotalBalance = () => {
    return cashboxes.reduce((sum, cashbox) => sum + cashbox.balance, 0)
  }

  const filteredCashboxes = cashboxes.filter(cashbox =>
    cashbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cashbox.code.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">الصناديق</h1>
          <p className="text-muted-foreground">إدارة الصناديق والتحويلات النقدية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTransferForm(true)}>
            <ArrowUpDown className="ml-2 h-4 w-4" />
            تحويل بين الصناديق
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="ml-2 h-4 w-4" />
            صندوق جديد
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>الرصيد الإجمالي</CardTitle>
          <CardDescription>إجمالي أرصدة جميع الصناديق</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(getTotalBalance())}
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الصناديق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Cashbox Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle>إضافة صندوق جديد</CardTitle>
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
                      <Label htmlFor="code">كود الصندوق</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="سيتم توليده تلقائياً"
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">نوع الصندوق *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">رئيسي</SelectItem>
                          <SelectItem value="sub">فرعي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الصندوق *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
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
          </motion.div>
        </div>
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 z-50 flex items_center justify_center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle>تحويل بين الصناديق</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransfer} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromCashboxId">من صندوق *</Label>
                    <Select 
                      value={transferData.fromCashboxId} 
                      onValueChange={(value) => setTransferData({ ...transferData, fromCashboxId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصندوق المحول منه" />
                      </SelectTrigger>
                      <SelectContent>
                        {cashboxes.map(cashbox => (
                          <SelectItem key={cashbox.id} value={cashbox.id}>
                            {cashbox.name} ({formatCurrency(cashbox.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="toCashboxId">إلى صندوق *</Label>
                    <Select 
                      value={transferData.toCashboxId} 
                      onValueChange={(value) => setTransferData({ ...transferData, toCashboxId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصندوق المحول إليه" />
                      </SelectTrigger>
                      <SelectContent>
                        {cashboxes.map(cashbox => (
                          <SelectItem key={cashbox.id} value={cashbox.id}>
                            {cashbox.name} ({formatCurrency(cashbox.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reference">رقم المرجع</Label>
                    <Input
                      id="reference"
                      value={transferData.reference}
                      onChange={(e) => setTransferData({ ...transferData, reference: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      تحويل
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTransferForm(false)
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

      {/* Cashboxes Grid */}
      {filteredCashboxes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا توجد صناديق مسجلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCashboxes.map((cashbox) => (
            <motion.div
              key={cashbox.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cashbox.name}</CardTitle>
                      <CardDescription>كود: {cashbox.code}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cashbox.type === 'main' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cashbox.type === 'main' ? 'رئيسي' : 'فرعي'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatCurrency(cashbox.balance)}</span>
                  </div>
                  
                  {cashbox.description && (
                    <p className="text-sm text-muted-foreground">{cashbox.description}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2 pt-3 text-xs text-muted-foreground border-t">
                    <div className="text-center">
                      <div className="font-medium">{cashbox._count?.vouchers || 0}</div>
                      <div>السندات</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{cashbox._count?.transfersFrom || 0}</div>
                      <div>تحويلات صادرة</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{cashbox._count?.transfersTo || 0}</div>
                      <div>تحويلات واردة</div>
                    </div>
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