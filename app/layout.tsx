import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ViewTransitionsProvider } from '@/components/providers/view-transitions'
import { QueryProvider } from '@/components/providers/query-provider'
import { NotificationProvider } from '@/components/providers/notification-provider'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { GlassHeader } from '@/components/ui/glass-header'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationsDrawerEnhanced } from '@/components/ui/notifications-drawer-enhanced'
import { CommandPalette } from '@/components/ui/command-palette'
import { Footer } from '@/components/ui/footer'
import { EnhancedSearch } from '@/components/ui/enhanced-search'
import LoggerProvider from '@/components/system/LoggerProvider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'نظام ERP العقاري المتكامل',
  description: 'نظام محاسبي وإداري متكامل لشركات المقاولات والعقارات',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ViewTransitionsProvider>
              <NotificationProvider>
                <LoggerProvider>
                  <CommandPalette />
                  <div className="flex h-screen overflow-hidden bg-background">
                    {/* Sidebar */}
                    <AppSidebar />
                    
                    {/* Main Content */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      {/* Glass Header */}
                      <GlassHeader>
                        {/* Enhanced Search Bar */}
                        <EnhancedSearch />
                        
                        {/* Header Actions */}
                        <div className="flex items-center gap-2">
                          <ThemeToggle />
                          <NotificationsDrawerEnhanced />
                        </div>
                      </GlassHeader>
                  
                      {/* Page Content */}
                      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
                        <div className="container mx-auto max-w-[1400px] px-4 md:px-6 lg:px-10 py-6 pb-14">
                          {children}
                        </div>
                        <Footer />
                      </main>
                    </div>
                  </div>
                </LoggerProvider>
              </NotificationProvider>
            </ViewTransitionsProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}