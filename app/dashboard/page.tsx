'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MotionSection } from "@/components/ui/motion-section"
import { EnhancedKPICard } from "@/components/ui/enhanced-kpi-card"
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  Briefcase,
  Receipt,
  Wallet,
  Zap,
  Target,
  BarChart3,
  Activity
} from "lucide-react"

// Lazy load charts for better performance
const ChartsSection = lazy(() => import('@/components/dashboard/charts-section'))
const QuickActions = lazy(() => import('@/components/dashboard/quick-actions'))
const AlertsSection = lazy(() => import('@/components/dashboard/alerts-section'))
const ActivityTimeline = lazy(() => import('@/components/dashboard/activity-timeline'))

// Mock data - سيتم استبدالها بـ API calls
const dashboardData = {
  kpis: [
    {
      title: "إجمالي الإيرادات",
      value: 2450000,
      change: 12.5,
      trend: "up" as const,
      icon: <DollarSign className="h-5 w-5" />,
      suffix: " ر.س",
      status: "success" as const
    },
    {
      title: "العقود النشطة",
      value: 48,
      change: 8,
      trend: "up" as const,
      icon: <FileText className="h-5 w-5" />,
      status: "success" as const
    },
    {
      title: "العملاء",
      value: 156,
      change: -2.3,
      trend: "down" as const,
      icon: <Users className="h-5 w-5" />,
      status: "warning" as const
    },
    {
      title: "نسبة التحصيل",
      value: 87.5,
      change: 5.2,
      trend: "up" as const,
      icon: <CheckCircle className="h-5 w-5" />,
      suffix: "%",
      status: "success" as const
    }
  ],
  quickStats: [
    { label: "المشاريع النشطة", value: 12, icon: Building2, color: "text-blue-600" },
    { label: "الوحدات المتاحة", value: 89, icon: Home, color: "text-green-600" },
    { label: "المدفوعات اليوم", value: 125000, icon: Wallet, color: "text-emerald-600" },
    { label: "المهام المعلقة", value: 7, icon: Clock, color: "text-amber-600" }
  ]
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('month')
  const [loading, setLoading] = useState(true)
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleKPIClick = (kpiTitle: string) => {
    setSelectedKPI(kpiTitle)
    // يمكن إضافة navigation أو modal هنا
    console.log(`KPI clicked: ${kpiTitle}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <MotionSection className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء النظام</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="min-w-[60px]"
          >
            أسبوع
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="min-w-[60px]"
          >
            شهر
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('year')}
            className="min-w-[60px]"
          >
            سنة
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.kpis.map((kpi, index) => (
          <EnhancedKPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            suffix={kpi.suffix}
            status={kpi.status}
            onClick={() => handleKPIClick(kpi.title)}
            className="transition-all duration-300"
          />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardData.quickStats.map((stat, index) => (
          <Card key={stat.label} className="text-center hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`mx-auto w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center mb-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold">{stat.value.toLocaleString('ar-SA')}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="actions">الإجراءات</TabsTrigger>
          <TabsTrigger value="activity">النشاطات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Section */}
          <Suspense fallback={
            <Card className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">جاري تحميل الرسوم البيانية...</div>
            </Card>
          }>
            <ChartsSection timeRange={timeRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات متقدمة</CardTitle>
              <CardDescription>مؤشرات الأداء والاتجاهات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">مؤشرات الأداء الرئيسية</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل النمو الشهري</span>
                      <Badge variant="secondary">+15.2%</Badge>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">رضا العملاء</span>
                      <Badge variant="secondary">92%</Badge>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">التوقعات</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm">الإيرادات المتوقعة الشهر القادم</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">2,850,000 ر.س</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Suspense fallback={
            <Card className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">جاري تحميل الإجراءات السريعة...</div>
            </Card>
          }>
            <QuickActions />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Suspense fallback={
            <Card className="h-96 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">جاري تحميل النشاطات...</div>
            </Card>
          }>
            <ActivityTimeline />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Alerts Section */}
      <Suspense fallback={
        <Card className="h-48 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">جاري تحميل التنبيهات...</div>
        </Card>
      }>
        <AlertsSection />
      </Suspense>
    </MotionSection>
  )
}