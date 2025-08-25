'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ViewTransitionsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Check if browser supports View Transitions API
    if (!document.startViewTransition) return

    // Add view transition on route change
    const handleRouteChange = () => {
      document.startViewTransition(() => {
        // The actual DOM update happens here
        return Promise.resolve()
      })
    }

    // Observe pathname changes
    handleRouteChange()
  }, [pathname])

  return <>{children}</>
}