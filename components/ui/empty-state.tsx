"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, FileX, Search, Database } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ElementType
  actionLabel?: string
  onAction?: () => void
  variant?: "default" | "search" | "error"
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = "default",
  className
}: EmptyStateProps) {
  const getIcon = () => {
    if (icon) return icon
    switch (variant) {
      case "search":
        return Search
      case "error":
        return FileX
      default:
        return Database
    }
  }

  const Icon = getIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 backdrop-blur-sm">
          <Icon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-emerald-500/40"
          animate={{
            y: [-2, 2, -2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-indigo-500/40"
          animate={{
            y: [2, -2, 2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
        />
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md space-y-2"
      >
        <h3 className="text-xl font-semibold tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </motion.div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Button
            onClick={onAction}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 text-white shadow-lg hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Plus className="ml-2 h-4 w-4" />
            {actionLabel}
          </Button>
        </motion.div>
      )}

      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-tl from-emerald-500/5 to-transparent blur-3xl" />
      </div>
    </motion.div>
  )
}