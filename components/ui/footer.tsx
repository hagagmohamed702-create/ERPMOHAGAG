"use client"

import { motion } from "framer-motion"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-auto border-t bg-background/50 backdrop-blur-sm"
    >
      <div className="container mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} نظام ERP العقاري المتكامل. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>الإصدار 1.0.0</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">تم التطوير بواسطة فريق التطوير</span>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}