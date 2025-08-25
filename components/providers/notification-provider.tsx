'use client'

import { useEffect } from 'react'
import { useNotifications, createPaymentNotification, createContractNotification, createInstallmentNotification } from '@/lib/notifications'
import { addDays, isAfter, differenceInDays } from 'date-fns'

// Mock function - في الإنتاج سيتم استبدالها بـ API calls
async function fetchPendingNotifications() {
  // Simulate API call
  return {
    latePayments: [
      { clientName: 'أحمد محمد', amount: 25000, daysLate: 5 },
      { clientName: 'سارة خالد', amount: 15000, daysLate: 3 },
    ],
    upcomingContracts: [
      { contractNumber: 'CNT-2024-001', daysUntilExpiry: 15 },
      { contractNumber: 'CNT-2024-005', daysUntilExpiry: 7 },
    ],
    upcomingInstallments: [
      { clientName: 'محمد علي', amount: 30000, dueDate: addDays(new Date(), 2) },
      { clientName: 'فاطمة أحمد', amount: 20000, dueDate: addDays(new Date(), 5) },
    ],
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const addNotification = useNotifications(state => state.addNotification)

  useEffect(() => {
    // Check for notifications every 5 minutes
    const checkNotifications = async () => {
      try {
        const data = await fetchPendingNotifications()
        
        // Process late payments
        data.latePayments.forEach(payment => {
          createPaymentNotification(payment.clientName, payment.amount, true)
        })
        
        // Process expiring contracts
        data.upcomingContracts.forEach(contract => {
          if (contract.daysUntilExpiry <= 30) {
            createContractNotification(contract.contractNumber, contract.daysUntilExpiry)
          }
        })
        
        // Process upcoming installments
        data.upcomingInstallments.forEach(installment => {
          const daysUntilDue = differenceInDays(installment.dueDate, new Date())
          if (daysUntilDue <= 7 && daysUntilDue >= 0) {
            createInstallmentNotification(
              installment.clientName, 
              installment.amount, 
              installment.dueDate
            )
          }
        })
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    // Initial check
    checkNotifications()

    // Set up interval
    const interval = setInterval(checkNotifications, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [addNotification])

  // Simulate real-time notifications (for demo)
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      addNotification({
        title: 'مرحباً بك!',
        description: 'نظام الإشعارات جاهز للعمل. ستصلك التنبيهات المهمة هنا.',
        type: 'success',
        category: 'system',
      })
    }, 3000)

    return () => clearTimeout(demoTimeout)
  }, [addNotification])

  return <>{children}</>
}