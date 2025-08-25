"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Command } from "lucide-react"
import { cn } from "@/lib/utils"

interface GradientHeroProps {
  title: string
  subtitle?: string
  ctaText?: string
  onCtaClick?: () => void
  gradient?: "ocean" | "midnight" | "sunrise"
  showPattern?: boolean
  className?: string
}

export function GradientHero({
  title,
  subtitle,
  ctaText = "ابدأ الآن",
  onCtaClick,
  gradient = "ocean",
  showPattern = true,
  className
}: GradientHeroProps) {
  const gradients = {
    ocean: "from-indigo-600 via-sky-500 to-emerald-400",
    midnight: "from-slate-900 via-indigo-900 to-slate-800",
    sunrise: "from-fuchsia-500 via-rose-500 to-amber-400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 md:p-10 text-white",
        `bg-gradient-to-br ${gradients[gradient]}`,
        className
      )}
    >
      {/* Pattern Overlay */}
      {showPattern && (
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
      )}

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut" as const
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut" as const
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2"
        >
          <Sparkles className="w-8 h-8 text-white/80 mb-4" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {onCtaClick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onCtaClick}
              size="lg"
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              <Command className="ml-2 h-4 w-4" />
              {ctaText}
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}