"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MotionSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: boolean
  staggerDelay?: number
}

export function MotionSection({
  children,
  className,
  delay = 0,
  stagger = false,
  staggerDelay = 0.1
}: MotionSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        when: "beforeChildren" as const,
        staggerChildren: stagger ? staggerDelay : 0
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {stagger ? (
        Array.isArray(children) ? (
          children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        ) : (
          <motion.div variants={itemVariants}>
            {children}
          </motion.div>
        )
      ) : (
        children
      )}
    </motion.section>
  )
}