"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
  gradient?: boolean
  className?: string
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = "عن الشهر الماضي",
  trend = "neutral",
  gradient = false,
  className
}: KpiCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />
      case "down":
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      case "down":
        return "text-red-600 dark:text-red-400 bg-red-500/10"
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-500/10"
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 dark:border-white/10",
        "bg-white/70 dark:bg-slate-900/60 backdrop-blur-md",
        "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]",
        "transition-all duration-300",
        className
      )}>
        {/* Gradient Background (optional) */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10" />
        )}

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            {/* Icon Container */}
            <motion.div
              whileHover={{ rotate: 5 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 backdrop-blur-sm"
            >
              <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </motion.div>

            {/* Change Badge */}
            {change !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span className="tabular-nums">
                  {change > 0 ? "+" : ""}{change}%
                </span>
              </motion.div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight"
            >
              {value}
            </motion.p>
            {change !== undefined && changeLabel && (
              <p className="text-xs text-muted-foreground mt-1">
                {changeLabel}
              </p>
            )}
          </div>
        </div>

        {/* Decorative Element */}
        <motion.div
          className="absolute -bottom-2 -left-2 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
        />
      </Card>
    </motion.div>
  )
}