import { useState, useCallback } from 'react'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string }>>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...options, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, options.duration || 3000)
  }, [])

  return {
    toast,
    toasts
  }
}