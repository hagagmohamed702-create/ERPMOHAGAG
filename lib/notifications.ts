import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'payment' | 'contract' | 'installment' | 'system' | 'general'

export interface Notification {
  id: string
  title: string
  description: string
  type: NotificationType
  category: NotificationCategory
  read: boolean
  createdAt: Date
  link?: string
  actionLabel?: string
  actionCallback?: () => void
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotifications = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date(),
          read: false,
        }

        const updatedNotifications = [newNotification, ...state.notifications]
        const unreadCount = updatedNotifications.filter(n => !n.read).length

        // Play notification sound
        if (typeof window !== 'undefined' && 'Audio' in window) {
          try {
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {})
          } catch (e) {}
        }

        // Show browser notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(notification.title, {
              body: notification.description,
              icon: '/icon-192x192.png',
              badge: '/icon-72x72.png',
            })
          } catch (e) {}
        }

        return { notifications: updatedNotifications, unreadCount }
      }),

      markAsRead: (id) => set((state) => {
        const updatedNotifications = state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
        const unreadCount = updatedNotifications.filter(n => !n.read).length
        return { notifications: updatedNotifications, unreadCount }
      }),

      markAllAsRead: () => set((state) => {
        const updatedNotifications = state.notifications.map(n => ({ ...n, read: true }))
        return { notifications: updatedNotifications, unreadCount: 0 }
      }),

      removeNotification: (id) => set((state) => {
        const updatedNotifications = state.notifications.filter(n => n.id !== id)
        const unreadCount = updatedNotifications.filter(n => !n.read).length
        return { notifications: updatedNotifications, unreadCount }
      }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep only last 50 notifications
      }),
    }
  )
)

// Helper functions
export function createPaymentNotification(clientName: string, amount: number, isLate: boolean = false) {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    title: isLate ? 'دفعة متأخرة' : 'دفعة مستحقة',
    description: `دفعة بقيمة ${amount.toLocaleString('ar-SA')} ر.س من العميل ${clientName}`,
    type: isLate ? 'warning' : 'info',
    category: 'payment',
    link: '/payments',
  }
  
  useNotifications.getState().addNotification(notification)
}

export function createContractNotification(contractNumber: string, daysUntilExpiry: number) {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    title: 'عقد قارب على الانتهاء',
    description: `العقد رقم ${contractNumber} سينتهي خلال ${daysUntilExpiry} يوم`,
    type: 'warning',
    category: 'contract',
    link: '/contracts',
  }
  
  useNotifications.getState().addNotification(notification)
}

export function createInstallmentNotification(clientName: string, amount: number, dueDate: Date) {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    title: 'قسط قادم',
    description: `قسط بقيمة ${amount.toLocaleString('ar-SA')} ر.س للعميل ${clientName} مستحق في ${dueDate.toLocaleDateString('ar-SA')}`,
    type: 'info',
    category: 'installment',
    link: '/installments',
  }
  
  useNotifications.getState().addNotification(notification)
}

// Request browser notification permission
export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (e) {
      return false
    }
  }
  return false
}