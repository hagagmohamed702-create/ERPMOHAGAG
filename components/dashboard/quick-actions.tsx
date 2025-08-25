"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Users, 
  Receipt, 
  Wallet, 
  Building2, 
  Home,
  Calculator,
  TrendingUp,
  Zap
} from "lucide-react"

const quickActions = [
  {
    title: "إضافة عقد جديد",
    description: "إنشاء عقد بيع أو إيجار جديد",
    icon: FileText,
    href: "/contracts/new",
    color: "bg-blue-500",
    badge: "سريع"
  },
  {
    title: "تسجيل عميل جديد",
    description: "إضافة عميل جديد للنظام",
    icon: Users,
    href: "/clients/new",
    color: "bg-green-500",
    badge: "مهم"
  },
  {
    title: "إنشاء فاتورة",
    description: "إنشاء فاتورة خدمات أو بضائع",
    icon: Receipt,
    href: "/invoices/new",
    color: "bg-purple-500",
    badge: "عاجل"
  },
  {
    title: "تسجيل دفعة",
    description: "تسجيل دفعة من عميل أو لمورد",
    icon: Wallet,
    href: "/payments/new",
    color: "bg-emerald-500",
    badge: "يومي"
  },
  {
    title: "إضافة مشروع",
    description: "إنشاء مشروع عقاري جديد",
    icon: Building2,
    href: "/projects/new",
    color: "bg-orange-500",
    badge: "جديد"
  },
  {
    title: "حجز وحدة",
    description: "حجز وحدة في مشروع معين",
    icon: Home,
    href: "/units/new",
    color: "bg-indigo-500",
    badge: "مطلوب"
  },
  {
    title: "حساب الأقساط",
    description: "حساب جدول الأقساط للعقود",
    icon: Calculator,
    href: "/installments/calculate",
    color: "bg-pink-500",
    badge: "أداة"
  },
  {
    title: "تقرير مالي",
    description: "إنشاء تقرير مالي شامل",
    icon: TrendingUp,
    href: "/reports/financial",
    color: "bg-teal-500",
    badge: "شهري"
  }
]

export default function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">الإجراءات السريعة</h3>
          <p className="text-sm text-muted-foreground">الوصول السريع للمهام الشائعة</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card 
            key={action.title} 
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => window.location.href = action.href}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {action.badge}
                </Badge>
              </div>
              
              <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">48</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">عقد نشط</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">156</div>
                <div className="text-sm text-green-600 dark:text-green-400">عميل نشط</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">12</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">مشروع نشط</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}