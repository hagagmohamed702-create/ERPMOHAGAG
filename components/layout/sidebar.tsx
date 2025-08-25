"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  ChevronDown
} from "lucide-react"
import { useState } from "react"

interface MenuItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "الرئيسية",
    href: "/",
    icon: Home,
  },
  {
    title: "لوحة التحكم",
    href: "/dashboard",
    icon: TrendingUp,
  },
  {
    title: "العملاء والموردين",
    icon: Users,
    children: [
      { title: "العملاء", href: "/clients", icon: Users },
      { title: "الموردين", href: "/suppliers", icon: Briefcase },
      { title: "الشركاء", href: "/real-estate/partners", icon: UserCheck },
    ],
  },
  {
    title: "العقارات",
    icon: Building2,
    children: [
      { title: "المشاريع", href: "/projects", icon: Building2 },
      { title: "الوحدات", href: "/units", icon: Home },
      { title: "العقود", href: "/contracts", icon: FileText },
      { title: "الأقساط", href: "/real-estate/installments", icon: Receipt },
      { title: "الإرجاعات", href: "/real-estate/returns", icon: Shield },
    ],
  },
  {
    title: "المحاسبة",
    icon: Calculator,
    children: [
      { title: "دليل الحسابات", href: "/accounting/accounts", icon: Calculator },
      { title: "القيود المحاسبية", href: "/accounting/journal-entries", icon: FileText },
      { title: "الصناديق", href: "/accounting/cashboxes", icon: Database },
      { title: "سندات القبض والصرف", href: "/accounting/vouchers", icon: Receipt },
      { title: "التحويلات", href: "/accounting/transfers", icon: DollarSign },
      { title: "الإيرادات", href: "/revenues", icon: TrendingUp },
      { title: "المصروفات", href: "/expenses", icon: DollarSign },
    ],
  },
  {
    title: "الموارد البشرية",
    icon: UserCheck,
    children: [
      { title: "الموظفين", href: "/employees", icon: Users },
      { title: "المرتبات", href: "/payrolls", icon: DollarSign },
    ],
  },
  {
    title: "المخازن",
    icon: Warehouse,
    children: [
      { title: "المخازن", href: "/warehouses", icon: Warehouse },
      { title: "المواد", href: "/materials", icon: Package },
      { title: "حركات المواد", href: "/material-moves", icon: TrendingUp },
    ],
  },
  {
    title: "التقارير",
    href: "/reports",
    icon: FileBarChart,
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const Icon = item.icon

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isExpanded && "bg-accent"
            )}
            style={{ paddingRight: `${12 + depth * 16}px` }}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && item.children && (
            <div className="mt-1 space-y-1">
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          pathname === item.href && "bg-accent text-accent-foreground"
        )}
        style={{ paddingRight: `${12 + depth * 16}px` }}
      >
        <Icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-l bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">نظام ERP العقاري</h2>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  )
}