"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Home,
  Package,
  TrendingUp,
  Settings,
  Briefcase,
  UserCheck,
  Calculator,
  Database,
  Receipt,
  Warehouse,
  FileBarChart,
  Shield,
  ChevronRight,
  ChevronLeft,
  Menu,
  LayoutDashboard,
  Search,
  Bell,
  Zap,
  Target,
  BarChart3,
  Calendar,
  MapPin,
  CreditCard,
  PieChart,
  Activity
} from "lucide-react"

interface MenuItem {
  id: string
  title: string
  href?: string
  icon: React.ElementType
  badge?: string
  children?: MenuItem[]
  priority?: 'high' | 'medium' | 'low'
}

const menuItems: MenuItem[] = [
  {
    id: "home",
    title: "الرئيسية",
    href: "/",
    icon: Home,
    priority: 'high'
  },
  {
    id: "dashboard",
    title: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: "جديد",
    priority: 'high'
  },
  {
    id: "quick-actions",
    title: "إجراءات سريعة",
    icon: Zap,
    priority: 'high',
    children: [
      { id: "new-contract", title: "عقد جديد", href: "/contracts/new", icon: FileText, priority: 'high' },
      { id: "new-client", title: "عميل جديد", href: "/clients/new", icon: Users, priority: 'high' },
      { id: "new-payment", title: "دفعة جديدة", href: "/payments/new", icon: DollarSign, priority: 'high' },
      { id: "new-invoice", title: "فاتورة جديدة", href: "/invoices/new", icon: Receipt, priority: 'high' },
    ]
  },
  {
    id: "real-estate",
    title: "العقارات",
    icon: Building2,
    priority: 'high',
    children: [
      { id: "projects", title: "المشاريع", href: "/projects", icon: Building2, priority: 'high' },
      { id: "units", title: "الوحدات", href: "/units", icon: Home, priority: 'high' },
      { id: "contracts", title: "العقود", href: "/contracts", icon: FileText, priority: 'high' },
      { id: "installments", title: "الأقساط", href: "/installments", icon: Calculator, priority: 'high' },
      { id: "invoices", title: "الفواتير", href: "/invoices", icon: FileText, priority: 'medium' },
      { id: "payments", title: "المدفوعات", href: "/payments", icon: DollarSign, priority: 'medium' },
    ]
  },
  {
    id: "clients-suppliers",
    title: "العملاء والموردين",
    icon: Users,
    priority: 'high',
    children: [
      { id: "clients", title: "العملاء", href: "/clients", icon: Users, priority: 'high' },
      { id: "suppliers", title: "الموردين", href: "/suppliers", icon: Briefcase, priority: 'medium' },
      { id: "partners", title: "الشركاء", href: "/partners", icon: UserCheck, priority: 'medium' },
      { id: "partners-settlements", title: "مخالصات الشركاء", href: "/partners/settlements", icon: Receipt, priority: 'low' },
    ]
  },
  {
    id: "accounting",
    title: "المحاسبة",
    icon: Calculator,
    priority: 'medium',
    children: [
      { id: "accounts", title: "دليل الحسابات", href: "/accounting/accounts", icon: Calculator, priority: 'medium' },
      { id: "journal-entries", title: "القيود المحاسبية", href: "/accounting/journal-entries", icon: FileText, priority: 'medium' },
      { id: "cashboxes", title: "الصناديق", href: "/accounting/cashboxes", icon: Database, priority: 'medium' },
      { id: "vouchers", title: "سندات القبض والصرف", href: "/accounting/vouchers", icon: Receipt, priority: 'low' },
      { id: "transfers", title: "التحويلات", href: "/accounting/transfers", icon: DollarSign, priority: 'low' },
      { id: "revenues", title: "الإيرادات", href: "/revenues", icon: TrendingUp, priority: 'medium' },
      { id: "expenses", title: "المصروفات", href: "/expenses", icon: Receipt, priority: 'medium' },
    ]
  },
  {
    id: "hr",
    title: "الموارد البشرية",
    icon: UserCheck,
    priority: 'medium',
    children: [
      { id: "employees", title: "الموظفين", href: "/employees", icon: Users, priority: 'medium' },
      { id: "payrolls", title: "الرواتب", href: "/payrolls", icon: DollarSign, priority: 'medium' },
    ]
  },
  {
    id: "inventory",
    title: "المخزون",
    icon: Package,
    priority: 'low',
    children: [
      { id: "materials", title: "المواد", href: "/materials", icon: Package, priority: 'low' },
      { id: "warehouses", title: "المستودعات", href: "/warehouses", icon: Warehouse, priority: 'low' },
      { id: "material-moves", title: "حركة المواد", href: "/material-moves", icon: Activity, priority: 'low' },
    ]
  },
  {
    id: "reports",
    title: "التقارير",
    icon: FileBarChart,
    priority: 'low',
    children: [
      { id: "financial-reports", title: "التقارير المالية", href: "/reports", icon: BarChart3, priority: 'low' },
      { id: "installment-reports", title: "تقارير الأقساط", href: "/reports/installments", icon: CreditCard, priority: 'low' },
      { id: "bank-reports", title: "تقارير البنوك", href: "/reports/bank", icon: Database, priority: 'low' },
    ]
  },
  {
    id: "settings",
    title: "الإعدادات",
    href: "/settings",
    icon: Settings,
    priority: 'low'
  },
]

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed])

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(!isMobileOpen)
  }, [isMobileOpen])

  const isActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }, [pathname])

  const renderMenuItem = useCallback((item: MenuItem, level: number = 0) => {
    const isItemActive = item.href ? isActive(item.href) : false
    const hasChildren = item.children && item.children.length > 0
    const [isExpanded, setIsExpanded] = useState(level === 0 || isItemActive)

    const handleToggle = () => {
      if (hasChildren) {
        setIsExpanded(!isExpanded)
      }
    }

    return (
      <div key={item.id} className="space-y-1">
        {item.href ? (
          <Link href={item.href}>
            <Button
              variant={isItemActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-10 px-3",
                level > 0 && "mr-4",
                isItemActive && "bg-primary/10 text-primary border-r-2 border-primary"
              )}
            >
              <item.icon className="h-4 w-4 ml-2" />
              {!isCollapsed && (
                <span className="flex-1 text-right">{item.title}</span>
              )}
              {item.badge && !isCollapsed && (
                <Badge variant="secondary" className="mr-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3"
            onClick={handleToggle}
          >
            <item.icon className="h-4 w-4 ml-2" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-right">{item.title}</span>
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90"
                  )} 
                />
              </>
            )}
          </Button>
        )}

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 mt-1">
                  {item.children!.map((child) => renderMenuItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    )
  }, [isCollapsed, isActive])

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">ERP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Target className="h-3 w-3" />
          {!isCollapsed && <span>نظام متطور</span>}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 right-4 z-50"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleMobile}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed right-0 top-0 h-full z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}