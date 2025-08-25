'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Plus, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"

interface Cashbox {
  id: string
  code: string
  name: string
  balance: number
}

interface Transfer {
  id: string
  transferNumber: string
  date: string
  fromCashboxId: string
  toCashboxId: string
  amount: number
  description?: string
  createdAt: string
  fromCashbox: Cashbox
  toCashbox: Cashbox
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromCashboxId: '',
    toCashboxId: '',
    amount: '',
    description: ''
  })

  useEffect(() => {
    fetchTransfers()
    fetchCashboxes()
  }, [])

  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/accounting/transfers')
      if (!response.ok) throw new Error('Failed to fetch transfers')
      const data = await response.json()
      setTransfers(data)
    } catch (error) {
      console.error('Error fetching transfers:', error)
      setError('حدث خطأ في تحميل التحويلات')
    } finally {
      setLoading(false)
    }
  }

  const fetchCashboxes = async () => {
    try {
      const response = await fetch('/api/accounting/cashboxes')
      if (!response.ok) throw new Error('Failed to fetch cashboxes')
      const data = await response.json()
      setCashboxes(data)
    } catch (error) {
      console.error('Error fetching cashboxes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.fromCashboxId === formData.toCashboxId) {
      setError('لا يمكن التحويل من وإلى نفس الصندوق')
      return
    }

    try {
      const response = await fetch('/api/accounting/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      const data = await parseApiResponse(response)

      if (!response.ok) {
        throw new Error(getErrorMessage(data))
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        fromCashboxId: '',
        toCashboxId: '',
        amount: '',
        description: ''
      })
      setShowForm(false)
      fetchTransfers()
      fetchCashboxes()
    } catch (error: any) {
      console.error('Error creating transfer:', error)
      setError(error.message || 'حدث خطأ في إنشاء التحويل')
    }
  }

  const filteredTransfers = transfers.filter(transfer =>
    transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromCashbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toCashbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalTransfers = transfers.reduce((sum, transfer) => sum + transfer.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التحويلات بين الصناديق</h1>
          <p className="text-muted-foreground mt-1">إدارة التحويلات المالية بين الصناديق</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus className="h-5 w-5 ml-2" />
          تحويل جديد
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">إجمالي التحويلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transfers.length}</div>
              <p className="text-sm text-muted-foreground">تحويل</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">إجمالي المبالغ المحولة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalTransfers)}</div>
              <p className="text-sm text-muted-foreground">جنيه</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">آخر تحويل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transfers.length > 0 ? formatDateShort(transfers[0].date) : '-'}
              </div>
              <p className="text-sm text-muted-foreground">
                {transfers.length > 0 ? formatCurrency(transfers[0].amount) : ''}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transfer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">تحويل جديد</h2>
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

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fromCashboxId">من صندوق</Label>
                <Select
                  value={formData.fromCashboxId}
                  onValueChange={(value) => setFormData({ ...formData, fromCashboxId: value })}
                  required
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

              <div>
                <Label htmlFor="toCashboxId">إلى صندوق</Label>
                <Select
                  value={formData.toCashboxId}
                  onValueChange={(value) => setFormData({ ...formData, toCashboxId: value })}
                  required
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

              <div>
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  placeholder="وصف التحويل (اختياري)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  إنشاء التحويل
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Transfers List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>قائمة التحويلات</CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4">رقم التحويل</th>
                  <th className="text-right py-3 px-4">التاريخ</th>
                  <th className="text-right py-3 px-4">من صندوق</th>
                  <th className="text-right py-3 px-4"></th>
                  <th className="text-right py-3 px-4">إلى صندوق</th>
                  <th className="text-right py-3 px-4">المبلغ</th>
                  <th className="text-right py-3 px-4">الوصف</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد تحويلات
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((transfer) => (
                    <motion.tr
                      key={transfer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">{transfer.transferNumber}</td>
                      <td className="py-3 px-4">{formatDateShort(transfer.date)}</td>
                      <td className="py-3 px-4">{transfer.fromCashbox.name}</td>
                      <td className="py-3 px-4">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                      </td>
                      <td className="py-3 px-4">{transfer.toCashbox.name}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(transfer.amount)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{transfer.description || '-'}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}