'use client'

import { useState, useEffect } from 'react'
import { parseApiResponse, getErrorMessage } from "@/lib/api-utils"

interface Partner {
  id: string
  code: string
  name: string
  phone?: string
  email?: string
  type: string
  percentage?: number
  note?: string
  createdAt: string
  _count?: {
    contracts: number
    returns: number
  }
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    type: 'investor', // قيمة افتراضية
    percentage: '',
    note: ''
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners')
      if (response.ok) {
        const data = await response.json()
        setPartners(data)
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const dataToSend = {
        ...formData,
        percentage: formData.percentage ? parseFloat(formData.percentage) : undefined
      }
      
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
      
      const result = await parseApiResponse(response)
      
      if (response.ok) {
        await fetchPartners()
        setFormData({ code: '', name: '', phone: '', email: '', type: 'investor', percentage: '', note: '' })
        setShowForm(false)
      } else {
        setError(getErrorMessage(result))
      }
    } catch (error) {
      console.error('Error creating partner:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const getPartnerTypeText = (type: string) => {
    switch(type) {
      case 'buyer': return 'مشتري'
      case 'seller': return 'بائع'
      case 'investor': return 'مستثمر'
      default: return type
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>إدارة الشركاء</h1>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem' }}>قائمة الشركاء</h2>
          <button 
            className="btn"
            onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
          >
            {showForm ? 'إلغاء' : 'إضافة شريك جديد'}
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
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>كود الشريك *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>اسم الشريك *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>نوع الشريك *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="buyer">مشتري</option>
                <option value="seller">بائع</option>
                <option value="investor">مستثمر</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>رقم الهاتف</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>نسبة الشراكة %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>ملاحظات</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <button type="submit" className="btn">
              حفظ الشريك
            </button>
          </form>
        )}

        {loading ? (
          <p>جاري التحميل...</p>
        ) : partners.length === 0 ? (
          <p>لا يوجد شركاء مسجلين حالياً</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الشريك</th>
                  <th>النوع</th>
                  <th>رقم الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>نسبة الشراكة</th>
                  <th>العقود</th>
                  <th>الإرجاعات</th>
                  <th>ملاحظات</th>
                  <th>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id}>
                    <td>{partner.code}</td>
                    <td>{partner.name}</td>
                    <td>{getPartnerTypeText(partner.type)}</td>
                    <td>{partner.phone || '-'}</td>
                    <td>{partner.email || '-'}</td>
                    <td>{partner.percentage ? `${partner.percentage}%` : '-'}</td>
                    <td>{partner._count?.contracts || 0}</td>
                    <td>{partner._count?.returns || 0}</td>
                    <td>{partner.note || '-'}</td>
                    <td>{new Date(partner.createdAt).toLocaleDateString('ar-EG')}</td>
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