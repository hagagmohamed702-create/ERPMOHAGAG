"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  DollarSign,
  Users,
  FileText,
  Bell,
  Zap
} from "lucide-react"

const alerts = [
  {
    id: 1,
    type: 'danger',
    icon: AlertTriangle,
    title: '5 أقساط متأخرة',
    description: 'إجمالي 125,000 ر.س',
    time: 'منذ ساعة',
    action: 'عرض',
    color: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200/50 dark:border-red-800/50',
    iconColor: 'text-red-600'
  },
  {
    id: 2,
    type: 'warning',
    icon: Clock,
    title: '3 عقود تنتهي هذا الشهر',
    description: 'تحتاج للتجديد',
    time: 'منذ 3 ساعات',
    action: 'عرض',
    color: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200/50 dark:border-yellow-800/50',
    iconColor: 'text-yellow-600'
  },
  {
    id: 3,
    type: 'info',
    icon: Calendar,
    title: 'اجتماع مع العميل أحمد محمد',
    description: 'اليوم في 3:00 م',
    time: 'منذ 5 ساعات',
    action: 'تفاصيل',
    color: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200/50 dark:border-blue-800/50',
    iconColor: 'text-blue-600'
  },
  {
    id: 4,
    type: 'success',
    icon: DollarSign,
    title: 'دفعة جديدة مستلمة',
    description: '75,000 ر.س من العميل سارة',
    time: 'منذ 6 ساعات',
    action: 'عرض',
    color: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200/50 dark:border-green-800/50',
    iconColor: 'text-green-600'
  },
  {
    id: 5,
    type: 'info',
    icon: Users,
    title: 'عميل جديد مسجل',
    description: 'عبدالله محمد - 3 عقود',
    time: 'منذ 8 ساعات',
    action: 'عرض',
    color: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200/50 dark:border-purple-800/50',
    iconColor: 'text-purple-600'
  },
  {
    id: 6,
    type: 'warning',
    icon: FileText,
    title: 'فاتورة متأخرة',
    description: 'فاتورة #1234 - 15,000 ر.س',
    time: 'منذ يوم',
    action: 'متابعة',
    color: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200/50 dark:border-amber-800/50',
    iconColor: 'text-amber-600'
  }
]

export default function AlertsSection() {
  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-r-4 border-r-red-500'
      case 'warning':
        return 'border-r-4 border-r-yellow-500'
      case 'info':
        return 'border-r-4 border-r-blue-500'
      case 'success':
        return 'border-r-4 border-r-green-500'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <Bell className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle>تنبيهات مهمة</CardTitle>
              <p className="text-sm text-muted-foreground">آخر التنبيهات والإشعارات</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            {alerts.length} تنبيه
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${alert.color} ${alert.borderColor} ${getPriorityColor(alert.type)} hover:shadow-sm transition-all duration-200`}
            >
              <div className={`p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 ${alert.iconColor}`}>
                <alert.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${alert.iconColor} border-current`}
                  >
                    {alert.type === 'danger' ? 'عاجل' : 
                     alert.type === 'warning' ? 'تحذير' : 
                     alert.type === 'info' ? 'معلومات' : 'نجح'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{alert.description}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="flex-shrink-0 hover:scale-105 transition-transform"
              >
                {alert.action}
              </Button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">إجراءات سريعة</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">تجاهل الكل</Button>
              <Button size="sm">عرض الكل</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}