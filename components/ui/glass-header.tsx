"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassHeaderProps {
  children: ReactNode
  className?: string
}

export function GlassHeader({ children, className }: GlassHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
      "shadow-sm shadow-black/5 dark:shadow-white/5",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full opacity-90" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                نظام ERP العقاري
              </h1>
              <p className="text-xs text-muted-foreground">الإدارة الذكية للعقارات</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center max-w-2xl mx-8">
          {children}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">متصل</span>
            </div>
            <div className="text-xs text-muted-foreground">
              آخر تحديث: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}