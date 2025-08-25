'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, Plus, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"

interface Cashbox {
  id: string
  code: string
  name: string
  balance: number
}

interface Client {
  id: string
  code: string
  name: string
}

interface Supplier {
  id: string
  code: string
  name: string
}

interface Voucher {
  id: string
  voucherNo: string
  date: string
  type: 'RECEIPT' | 'PAYMENT'
  amount: number
  cashboxId: string
  clientId?: string
  supplierId?: string
  description?: string
  reference?: string
  createdAt: string
  cashbox: Cashbox
  client?: Client
  supplier?: Supplier
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'RECEIPT' | 'PAYMENT'>('RECEIPT')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'RECEIPT' as 'RECEIPT' | 'PAYMENT',
    amount: '',
    cashboxId: '',
    clientId: '',
    supplierId: '',
    description: '',
    reference: ''
  })

  useEffect(() => {
    fetchVouchers()
    fetchCashboxes()
    fetchClients()
    fetchSuppliers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/accounting/vouchers')
      if (!response.ok) throw new Error('Failed to fetch vouchers')
      const data = await response.json()
      setVouchers(data)
    } catch (error) {
      console.error('Error fetching vouchers:', error)
      setError('حدث خطأ في تحميل السندات')
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

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (!response.ok) throw new Error('Failed to fetch clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (!response.ok) throw new Error('Failed to fetch suppliers')
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          clientId: formData.clientId || undefined,
          supplierId: formData.supplierId || undefined,
        })
      })

      const data = await parseApiResponse(response)

      if (!response.ok) {
        throw new Error(getErrorMessage(data))
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: activeTab,
        amount: '',
        cashboxId: '',
        clientId: '',
        supplierId: '',
        description: '',
        reference: ''
      })
      setShowForm(false)
      fetchVouchers()
      fetchCashboxes()
    } catch (error: any) {
      console.error('Error creating voucher:', error)
      setError(error.message || 'حدث خطأ في إنشاء السند')
    }
  }

  const openForm = (type: 'RECEIPT' | 'PAYMENT') => {
    setFormData({
      ...formData,
      type,
      clientId: '',
      supplierId: ''
    })
    setShowForm(true)
  }

  const receiptVouchers = vouchers.filter(v => v.type === 'RECEIPT')
  const paymentVouchers = vouchers.filter(v => v.type === 'PAYMENT')

  const filteredReceipts = receiptVouchers.filter(voucher =>
    voucher.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPayments = paymentVouchers.filter(voucher =>
    voucher.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalReceipts = receiptVouchers.reduce((sum, v) => sum + v.amount, 0)
  const totalPayments = paymentVouchers.reduce((sum, v) => sum + v.amount, 0)

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
          <h1 className="text-3xl font-bold">سندات القبض والصرف</h1>
          <p className="text-muted-foreground mt-1">إدارة سندات القبض والصرف النقدية</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-green-600" />
                إجمالي المقبوضات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceipts)}</div>
              <p className="text-sm text-muted-foreground">{receiptVouchers.length} سند قبض</p>
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
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-red-600" />
                إجمالي المدفوعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPayments)}</div>
              <p className="text-sm text-muted-foreground">{paymentVouchers.length} سند صرف</p>
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
              <CardTitle className="text-base font-medium">صافي الحركة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReceipts - totalPayments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalReceipts - totalPayments)}
              </div>
              <p className="text-sm text-muted-foreground">الفرق</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">إجمالي السندات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vouchers.length}</div>
              <p className="text-sm text-muted-foreground">سند</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Voucher Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {formData.type === 'RECEIPT' ? 'سند قبض جديد' : 'سند صرف جديد'}
              </h2>
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
                <Label htmlFor="cashboxId">الصندوق</Label>
                <Select
                  value={formData.cashboxId}
                  onValueChange={(value) => setFormData({ ...formData, cashboxId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصندوق" />
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

              {formData.type === 'RECEIPT' ? (
                <div>
                  <Label htmlFor="clientId">العميل</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="supplierId">المورد</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                <Label htmlFor="reference">المرجع</Label>
                <Input
                  id="reference"
                  placeholder="رقم الشيك أو المرجع (اختياري)"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  placeholder="وصف السند (اختياري)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  إنشاء السند
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

      {/* Vouchers Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'RECEIPT' | 'PAYMENT')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="RECEIPT" className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              سندات القبض
            </TabsTrigger>
            <TabsTrigger value="PAYMENT" className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              سندات الصرف
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
            <Button onClick={() => openForm(activeTab)} size="lg">
              <Plus className="h-5 w-5 ml-2" />
              {activeTab === 'RECEIPT' ? 'سند قبض جديد' : 'سند صرف جديد'}
            </Button>
          </div>
        </div>

        <TabsContent value="RECEIPT">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم السند</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">العميل</th>
                      <th className="text-right py-3 px-4">الصندوق</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">المرجع</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          لا توجد سندات قبض
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map((voucher) => (
                        <motion.tr
                          key={voucher.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">{voucher.voucherNo}</td>
                          <td className="py-3 px-4">{formatDateShort(voucher.date)}</td>
                          <td className="py-3 px-4">{voucher.client?.name || '-'}</td>
                          <td className="py-3 px-4">{voucher.cashbox.name}</td>
                          <td className="py-3 px-4 font-medium text-green-600">{formatCurrency(voucher.amount)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{voucher.reference || '-'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{voucher.description || '-'}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="PAYMENT">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم السند</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">المورد</th>
                      <th className="text-right py-3 px-4">الصندوق</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">المرجع</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          لا توجد سندات صرف
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((voucher) => (
                        <motion.tr
                          key={voucher.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">{voucher.voucherNo}</td>
                          <td className="py-3 px-4">{formatDateShort(voucher.date)}</td>
                          <td className="py-3 px-4">{voucher.supplier?.name || '-'}</td>
                          <td className="py-3 px-4">{voucher.cashbox.name}</td>
                          <td className="py-3 px-4 font-medium text-red-600">{formatCurrency(voucher.amount)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{voucher.reference || '-'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{voucher.description || '-'}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}