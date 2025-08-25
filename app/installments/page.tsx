import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

async function getInstallments() {
  try {
    const installments = await prisma.installment.findMany({
      take: 50,
      orderBy: { dueDate: 'asc' },
      include: {
        contract: {
          include: {
            client: true,
            unit: true
          }
        }
      }
    })
    
    return installments
  } catch (error) {
    console.error('Error fetching installments:', error)
    return []
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ar-EG')
}

function formatCurrency(amount: any) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount)
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { class: string; text: string }> = {
    PENDING: { class: 'pending', text: 'مستحق' },
    PAID: { class: 'paid', text: 'مدفوع' },
    OVERDUE: { class: 'overdue', text: 'متأخر' }
  }
  
  const statusInfo = statusMap[status] || { class: '', text: status }
  
  return (
    <span className={`status-badge ${statusInfo.class}`}>
      {statusInfo.text}
    </span>
  )
}

export default async function InstallmentsPage() {
  const installments = await getInstallments()
  
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>جدول الأقساط</h1>
      
      <div className="card">
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>أول 50 قسط</h2>
        
        {installments.length === 0 ? (
          <p>لا توجد أقساط مسجلة حالياً</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>كود الوحدة</th>
                  <th>المبلغ</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((installment) => (
                  <tr key={installment.id}>
                    <td>{installment.contract.client.name}</td>
                    <td>{installment.contract.unit.code}</td>
                    <td>{formatCurrency(installment.amount)}</td>
                    <td>{formatDate(installment.dueDate)}</td>
                    <td>{getStatusBadge(installment.status)}</td>
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