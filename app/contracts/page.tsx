'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, Calendar, Calculator, DollarSign, Users } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency, formatDate } from "@/lib/utils"
import { parseApiResponse, getErrorMessage, prepareFormData } from "@/lib/api-utils"
import { GenerateInstallmentsButton } from "@/components/contracts/generate-installments-button"

interface Contract {
  id: string
  contractNo: string
  date: string
  clientId: string
  unitId: string
  projectId?: string
  totalAmount: number
  downPayment: number
  months: number
  planType: string
  discount?: number
  commission?: number
  status: string
  notes?: string
  createdAt: string
  client: {
    id: string
    code: string
    name: string
  }
  unit: {
    id: string
    code: string
    name?: string
    type: string
    project: {
      id: string
      code: string
      name: string
    }
  }
  _count?: {
    installments: number
  }
}

interface Client {
  id: string
  code: string
  name: string
}

interface Unit {
  id: string
  code: string
  name?: string
  type: string
  status: string
  price: number
  project: {
    id: string
    code: string
    name: string
  }
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    contractNo: '',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    unitId: '',
    totalAmount: '',
    downPayment: '',
    months: '12',
    planType: 'MONTHLY',
    discount: '',
    commission: '',
    notes: ''
  })

  useEffect(() => {
    fetchContracts()
    fetchClients()
    fetchUnits()
  }, [])

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts')
      if (response.ok) {
        const data = await response.json()
        setContracts(data)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units?status=available')
      if (response.ok) {
        const data = await response.json()
        setUnits(data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const handleUnitChange = (unitId: string) => {
    const unit = units.find(u => u.id === unitId)
    if (unit) {
      setFormData({
        ...formData,
        unitId,
        totalAmount: unit.price.toString(),
        downPayment: (unit.price * 0.2).toString() // افتراضي 20% مقدم
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareFormData(formData)),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchContracts()
        await fetchUnits() // لتحديث حالة الوحدة
        setFormData({
          contractNo: '',
          date: new Date().toISOString().split('T')[0],
          clientId: '',
          unitId: '',
          totalAmount: '',
          downPayment: '',
          months: '12',
          planType: 'MONTHLY',
          discount: '',
          commission: '',
          notes: ''
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const calculateInstallment = () => {
    const total = parseFloat(formData.totalAmount) || 0
    const down = parseFloat(formData.downPayment) || 0
    const discount = parseFloat(formData.discount) || 0
    const months = parseInt(formData.months) || 1
    
    const remaining = total - down - discount
    return remaining / months
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      case 'cancelled': return 'ملغى'
      default: return status
    }
  }

  const getPlanTypeText = (type: string) => {
    switch (type) {
      case 'MONTHLY': return 'شهري'
      case 'QUARTERLY': return 'ربع سنوي'
      case 'YEARLY': return 'سنوي'
      default: return type
    }
  }

  const filteredContracts = contracts.filter(contract =>
    contract.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.unit.code.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">العقود</h1>
          <p className="text-muted-foreground">إدارة عقود البيع والأقساط</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="ml-2 h-4 w-4" />
          عقد جديد
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في العقود..."
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>إنشاء عقد جديد</CardTitle>
                <CardDescription>
                  سيتم توليد الأقساط تلقائياً بعد حفظ العقد
                </CardDescription>
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
                      <Label htmlFor="contractNo">رقم العقد</Label>
                      <Input
                        id="contractNo"
                        value={formData.contractNo}
                        onChange={(e) => setFormData({ ...formData, contractNo: e.target.value })}
                        placeholder="سيتم توليده تلقائياً"
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">تاريخ العقد *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">العميل *</Label>
                      <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })} required>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العميل" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unitId">الوحدة *</Label>
                      <Select value={formData.unitId} onValueChange={handleUnitChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الوحدة" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name || unit.code} - {unit.project.name} ({formatCurrency(unit.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">المبلغ الإجمالي *</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">الدفعة المقدمة *</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={formData.downPayment}
                        onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discount">الخصم</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="months">عدد الأشهر *</Label>
                      <Input
                        id="months"
                        type="number"
                        value={formData.months}
                        onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="planType">خطة السداد *</Label>
                      <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">شهري</SelectItem>
                          <SelectItem value="QUARTERLY">ربع سنوي</SelectItem>
                          <SelectItem value="YEARLY">سنوي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="commission">العمولة</Label>
                      <Input
                        id="commission"
                        type="number"
                        value={formData.commission}
                        onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* حساب القسط */}
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">المبلغ المتبقي</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(
                              (parseFloat(formData.totalAmount) || 0) - 
                              (parseFloat(formData.downPayment) || 0) - 
                              (parseFloat(formData.discount) || 0)
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">قيمة القسط</p>
                          <p className="text-lg font-semibold text-primary">
                            {formatCurrency(calculateInstallment())}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <textarea
                      id="notes"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      حفظ وتوليد الأقساط
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

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا توجد عقود مسجلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">عقد {contract.contractNo}</CardTitle>
                      <CardDescription>{contract.client.name}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {getStatusText(contract.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">الوحدة:</span> {contract.unit.name || contract.unit.code}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">المشروع:</span> {contract.unit.project.name}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(contract.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span>{contract.months} شهر - {getPlanTypeText(contract.planType)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 border-t pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                      <span className="font-medium">{formatCurrency(contract.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">الدفعة المقدمة:</span>
                      <span className="font-medium">{formatCurrency(contract.downPayment)}</span>
                    </div>
                    {contract.discount && contract.discount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">الخصم:</span>
                        <span className="font-medium text-green-600">-{formatCurrency(contract.discount)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t">
                    <span>الأقساط: {contract._count?.installments || 0}</span>
                    <div className="flex gap-2">
                      {contract._count?.installments === 0 && (
                        <GenerateInstallmentsButton
                          contractId={contract.id}
                          contractNo={contract.contractNo}
                          onSuccess={fetchContracts}
                        />
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/installments?contractId=${contract.id}`}>
                          عرض الأقساط
                        </a>
                      </Button>
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