'use client'

import { useState, useEffect } from 'react'

interface Unit {
  id: string
  code: string
  type: string
  status: string
}

interface Return {
  id: string
  unitId: string
  reason?: string
  resaleStatus: string
  createdAt: string
  unit: Unit
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    unitId: '',
    reason: '',
    resaleStatus: 'pending'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [returnsRes, unitsRes] = await Promise.all([
        fetch('/api/returns'),
        fetch('/api/units?status=sold')
      ])
      
      if (returnsRes.ok) {
        const returnsData = await returnsRes.json()
        setReturns(returnsData)
      }
      
      if (unitsRes.ok) {
        const unitsData = await unitsRes.json()
        setUnits(unitsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        await fetchData()
        setFormData({ unitId: '', reason: '', resaleStatus: 'pending' })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating return:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; text: string }> = {
      pending: { class: 'pending', text: 'معلق' },
      resold: { class: 'paid', text: 'تم إعادة البيع' }
    }
    
    const statusInfo = statusMap[status] || { class: '', text: status }
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>إدارة إرجاع الوحدات</h1>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem' }}>قائمة الوحدات المرتجعة</h2>
          <button 
            className="btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'إلغاء' : 'تسجيل إرجاع جديد'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>الوحدة *</label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">اختر الوحدة</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} - {unit.type}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>سبب الإرجاع</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>حالة إعادة البيع</label>
              <select
                value={formData.resaleStatus}
                onChange={(e) => setFormData({ ...formData, resaleStatus: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="pending">معلق</option>
                <option value="resold">تم إعادة البيع</option>
              </select>
            </div>
            
            <button type="submit" className="btn">
              حفظ الإرجاع
            </button>
          </form>
        )}

        {loading ? (
          <p>جاري التحميل...</p>
        ) : returns.length === 0 ? (
          <p>لا يوجد وحدات مرتجعة حالياً</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>كود الوحدة</th>
                  <th>نوع الوحدة</th>
                  <th>سبب الإرجاع</th>
                  <th>حالة إعادة البيع</th>
                  <th>تاريخ الإرجاع</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnItem) => (
                  <tr key={returnItem.id}>
                    <td>{returnItem.unit.code}</td>
                    <td>{returnItem.unit.type}</td>
                    <td>{returnItem.reason || '-'}</td>
                    <td>{getStatusBadge(returnItem.resaleStatus)}</td>
                    <td>{new Date(returnItem.createdAt).toLocaleDateString('ar-EG')}</td>
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