'use client'

import { useCallback } from 'react'

// Simple toast implementation using alert for now
// Can be replaced with a proper toast library later
export function useErrorToast() {
  const showError = useCallback((error: unknown, customMessage?: string) => {
    let message = customMessage || 'حدث خطأ غير متوقع'
    
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    
    // Log to console for debugging
    console.error('Error:', error)
    
    // For now, using console.error as visual feedback
    // In production, this should be replaced with a proper toast library
    if (typeof window !== 'undefined') {
      // Create a temporary error div
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2'
      errorDiv.textContent = message
      document.body.appendChild(errorDiv)
      
      // Remove after 5 seconds
      setTimeout(() => {
        errorDiv.remove()
      }, 5000)
    }
  }, [])
  
  const showSuccess = useCallback((message: string) => {
    if (typeof window !== 'undefined') {
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2'
      successDiv.textContent = message
      document.body.appendChild(successDiv)
      
      setTimeout(() => {
        successDiv.remove()
      }, 3000)
    }
  }, [])
  
  const showWarning = useCallback((message: string) => {
    if (typeof window !== 'undefined') {
      const warningDiv = document.createElement('div')
      warningDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2'
      warningDiv.textContent = message
      document.body.appendChild(warningDiv)
      
      setTimeout(() => {
        warningDiv.remove()
      }, 4000)
    }
  }, [])
  
  return {
    showError,
    showSuccess,
    showWarning,
  }
}