"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"

interface EnhancedKPICardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  prefix?: string
  suffix?: string
  status?: 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
  onClick?: () => void
  className?: string
}

export function EnhancedKPICard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  prefix = "",
  suffix = "",
  status = 'info',
  loading = false,
  onClick,
  className
}: EnhancedKPICardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (typeof value === 'number') {
      const target = value
      const duration = 1000
      const steps = 60
      const increment = target / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setDisplayValue(Math.floor(current))
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [value])

  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          border: 'border-emerald-200/50 dark:border-emerald-800/50',
          icon: 'text-emerald-600 dark:text-emerald-400',
          change: 'text-emerald-600 dark:text-emerald-400'
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200/50 dark:border-amber-800/50',
          icon: 'text-amber-600 dark:text-amber-400',
          change: 'text-amber-600 dark:text-amber-400'
        }
      case 'danger':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200/50 dark:border-red-800/50',
          icon: 'text-red-600 dark:text-red-400',
          change: 'text-red-600 dark:text-red-400'
        }
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200/50 dark:border-blue-800/50',
          icon: 'text-blue-600 dark:text-blue-400',
          change: 'text-blue-600 dark:text-blue-400'
        }
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const colors = getStatusColors()

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10",
        colors.bg,
        colors.border,
        isHovered && "ring-2 ring-primary/20"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16" />
        </div>

        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-foreground/80">
            {title}
          </CardTitle>
          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={cn("p-2 rounded-lg bg-white/80 dark:bg-slate-900/80", colors.icon)}
          >
            {icon}
          </motion.div>
        </CardHeader>

        {/* Content */}
        <CardContent className="relative z-10">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="animate-pulse bg-muted rounded h-8 w-24" />
              </motion.div>
            ) : (
              <motion.div
                key="value"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <div className="text-3xl font-bold text-foreground">
                  {prefix}
                  {typeof value === 'number' ? displayValue.toLocaleString('ar-SA') : value}
                  {suffix}
                </div>

                {change !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className={cn("flex items-center text-xs font-medium", colors.change)}
                  >
                    {getTrendIcon()}
                    <span className="mr-1">{Math.abs(change)}%</span>
                    <span className="text-muted-foreground mr-1">عن الشهر السابق</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Status Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      </Card>
    </motion.div>
  )
}