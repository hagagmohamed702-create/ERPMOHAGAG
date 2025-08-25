'use client'

import { useState, useEffect } from 'react'
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"

interface Partner {
  id: string
  code: string
  name: string
  type: string
  percentage?: number
}

interface SettlementLine {
  id: string
  partnerId: string
  amount: string
  type: string
  description?: string
  partner?: Partner
}

interface Settlement {
  id: string
  settlementNo: string
  date: string
  type: string
  status: string
  totalAmount: string
  note?: string
  lines: SettlementLine[]
  createdAt: string
}

export default function PartnersSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    settlementNo: '',
    date: new Date().toISOString().split('T')[0],
    type: 'periodic',
    status: 'draft',
    note: '',
    lines: [{ partnerId: '', amount: '', type: 'debit', description: '' }]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [settlementsRes, partnersRes] = await Promise.all([
        fetch('/api/partners/settlements'),
        fetch('/api/partners')
      ])

      if (settlementsRes.ok) {
        const settlementsData = await settlementsRes.json()
        setSettlements(settlementsData)
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json()
        setPartners(partnersData)
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
      lines: [...formData.lines, { partnerId: '', amount: '', type: 'debit', description: '' }]
    })
  }

  const removeLine = (index: number) => {
    const newLines = formData.lines.filter((_, i) => i !== index)
    setFormData({ ...formData, lines: newLines })
  }

  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...formData.lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setFormData({ ...formData, lines: newLines })
  }

  const calculateTotal = () => {
    return formData.lines.reduce((total, line) => {
      const amount = parseFloat(line.amount) || 0
      return total + (line.type === 'debit' ? amount : -amount)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate lines
    const validLines = formData.lines.filter(line => line.partnerId && line.amount)
    if (validLines.length === 0) {
      setError('يجب إضافة سطر واحد على الأقل')
      return
    }

    try {
      const response = await fetch('/api/partners/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lines: validLines.map(line => ({
            ...line,
            amount: parseFloat(line.amount)
          })),
          totalAmount: calculateTotal()
        }),
      })

      const result = await parseApiResponse(response)

      if (response.ok) {
        await fetchData()
        setFormData({
          settlementNo: '',
          date: new Date().toISOString().split('T')[0],
          type: 'periodic',
          status: 'draft',
          note: '',
          lines: [{ partnerId: '', amount: '', type: 'debit', description: '' }]
        })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating settlement:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'draft': return 'مسودة'
      case 'approved': return 'معتمد'
      case 'paid': return 'مدفوع'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch(type) {
      case 'periodic': return 'دورية'
      case 'project': return 'مشروع'
      case 'final': return 'نهائية'
      default: return type
    }
  }

  const getLineTypeText = (type: string) => {
    return type === 'debit' ? 'مدين' : 'دائن'
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>مخالصات الشركاء</h1>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem' }}>قائمة المخالصات</h2>
          <button 
            className="btn"
            onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
          >
            {showForm ? 'إلغاء' : 'إضافة مخالصة جديدة'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            {error && (
              <div style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px' 
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>رقم المخالصة</label>
                <input
                  type="text"
                  value={formData.settlementNo}
                  onChange={(e) => setFormData({ ...formData, settlementNo: e.target.value })}
                  placeholder="سيتم توليده تلقائياً"
                  readOnly
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>التاريخ *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>نوع المخالصة *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="periodic">دورية</option>
                  <option value="project">مشروع</option>
                  <option value="final">نهائية</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>الحالة *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="draft">مسودة</option>
                  <option value="approved">معتمد</option>
                  <option value="paid">مدفوع</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>ملاحظات</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3>سطور المخالصة</h3>
                <button type="button" onClick={addLine} className="btn" style={{ padding: '5px 15px' }}>
                  إضافة سطر
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>الشريك</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>المبلغ</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>النوع</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>الوصف</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', width: '50px' }}>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lines.map((line, index) => (
                    <tr key={index}>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>
                        <select
                          value={line.partnerId}
                          onChange={(e) => updateLine(index, 'partnerId', e.target.value)}
                          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">اختر الشريك</option>
                          {partners.map(partner => (
                            <option key={partner.id} value={partner.id}>
                              {partner.name} ({partner.code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>
                        <input
                          type="number"
                          value={line.amount}
                          onChange={(e) => updateLine(index, 'amount', e.target.value)}
                          step="0.01"
                          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>
                        <select
                          value={line.type}
                          onChange={(e) => updateLine(index, 'type', e.target.value)}
                          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="debit">مدين</option>
                          <option value="credit">دائن</option>
                        </select>
                      </td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {formData.lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            style={{ padding: '2px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', border: '1px solid #ddd' }}>
                      الإجمالي:
                    </td>
                    <td colSpan={3} style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #ddd' }}>
                      {calculateTotal().toFixed(2)} ريال
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button type="submit" className="btn">
              حفظ المخالصة
            </button>
          </form>
        )}

        {loading ? (
          <p>جاري التحميل...</p>
        ) : settlements.length === 0 ? (
          <p>لا توجد مخالصات مسجلة حالياً</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم المخالصة</th>
                  <th>التاريخ</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  <th>إجمالي المبلغ</th>
                  <th>ملاحظات</th>
                  <th>تاريخ الإنشاء</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <td>{settlement.settlementNo}</td>
                    <td>{new Date(settlement.date).toLocaleDateString('ar-EG')}</td>
                    <td>{getTypeText(settlement.type)}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: settlement.status === 'paid' ? '#d4edda' : 
                                       settlement.status === 'approved' ? '#cce5ff' : '#f8f9fa',
                        color: settlement.status === 'paid' ? '#155724' : 
                               settlement.status === 'approved' ? '#004085' : '#495057'
                      }}>
                        {getStatusText(settlement.status)}
                      </span>
                    </td>
                    <td>{parseFloat(settlement.totalAmount).toFixed(2)} ريال</td>
                    <td>{settlement.note || '-'}</td>
                    <td>{new Date(settlement.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <button
                        onClick={() => {
                          // Show details or edit
                          console.log('View settlement:', settlement.id)
                        }}
                        style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                        className="btn"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}