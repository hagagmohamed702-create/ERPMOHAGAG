'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { MotionSection } from "@/components/ui/motion-section"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  FileBarChart,
  Printer,
  Share2
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ExportButton } from '@/components/export/export-button'

// بيانات تجريبية
const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
  month: format(subMonths(new Date(), 11 - i), 'MMM', { locale: ar }),
  revenue: Math.floor(Math.random() * 500000) + 300000,
  expenses: Math.floor(Math.random() * 300000) + 200000,
  profit: 0
})).map(item => ({ ...item, profit: item.revenue - item.expenses }))

const projectPerformance = [
  { project: 'مشروع النخيل', sold: 85, available: 15 },
  { project: 'مشروع الواحة', sold: 72, available: 28 },
  { project: 'مشروع المرجان', sold: 93, available: 7 },
  { project: 'مشروع الزهور', sold: 65, available: 35 },
]

const clientSegmentation = [
  { segment: 'عملاء VIP', count: 12, revenue: 2500000 },
  { segment: 'عملاء متميزون', count: 45, revenue: 1800000 },
  { segment: 'عملاء عاديون', count: 120, revenue: 1200000 },
  { segment: 'عملاء جدد', count: 35, revenue: 400000 },
]

const paymentMethods = [
  { method: 'نقدي', value: 45, color: '#10b981' },
  { method: 'تحويل بنكي', value: 30, color: '#3b82f6' },
  { method: 'شيكات', value: 20, color: '#f59e0b' },
  { method: 'أخرى', value: 5, color: '#6b7280' },
]

const kpiData = [
  { subject: 'المبيعات', current: 85, target: 100 },
  { subject: 'التحصيل', current: 78, target: 100 },
  { subject: 'رضا العملاء', current: 92, target: 100 },
  { subject: 'الإشغال', current: 73, target: 100 },
  { subject: 'الربحية', current: 68, target: 100 },
]

interface ReportCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
  badge?: string
}

function ReportCard({ title, description, icon, onClick, badge }: ReportCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <CardTitle className="text-lg mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [selectedReport, setSelectedReport] = useState<string>('overview')

  return (
    <MotionSection className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>التقارير</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
          <p className="text-muted-foreground">تحليلات شاملة لأداء النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <ExportButton
            data={monthlyRevenue}
            filename="reports"
            title="تقرير شامل"
          />
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="تقرير المبيعات"
          description="تحليل المبيعات والإيرادات"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          badge="محدث"
        />
        <ReportCard
          title="تقرير العملاء"
          description="تحليل قاعدة العملاء"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <ReportCard
          title="تقرير المشاريع"
          description="أداء المشاريع العقارية"
          icon={<Building className="h-5 w-5 text-primary" />}
        />
        <ReportCard
          title="التقرير المالي"
          description="التدفقات النقدية والأرباح"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          badge="جديد"
        />
      </div>

      {/* Main Report Area */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="financial">التحليل المالي</TabsTrigger>
            <TabsTrigger value="projects">تحليل المشاريع</TabsTrigger>
            <TabsTrigger value="clients">تحليل العملاء</TabsTrigger>
          </TabsList>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المشاريع</SelectItem>
                <SelectItem value="nakheel">مشروع النخيل</SelectItem>
                <SelectItem value="waha">مشروع الواحة</SelectItem>
              </SelectContent>
            </Select>
            
            <DatePicker
              date={dateRange.from}
              onChange={(date) => date && setDateRange({ ...dateRange, from: date })}
            />
            <span className="text-muted-foreground">إلى</span>
            <DatePicker
              date={dateRange.to}
              onChange={(date) => date && setDateRange({ ...dateRange, to: date })}
            />
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
                <CardDescription>مقارنة الأداء الفعلي بالمستهدف</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={kpiData}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="الفعلي" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name="المستهدف" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع طرق الدفع</CardTitle>
                <CardDescription>نسب استخدام طرق الدفع المختلفة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, value }) => `${method}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الإيرادات والمصروفات</CardTitle>
              <CardDescription>تحليل شهري للسنة الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="الإيرادات" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="المصروفات" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="الربح" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5,892,350 ر.س</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">+12.5%</span> عن الفترة السابقة
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,245,780 ر.س</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-600">+8.3%</span> عن الفترة السابقة
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,646,570 ر.س</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">+18.2%</span> عن الفترة السابقة
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>التدفق النقدي</CardTitle>
              <CardDescription>حركة السيولة النقدية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="المقبوضات" />
                  <Bar dataKey="expenses" fill="#ef4444" name="المدفوعات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المشاريع</CardTitle>
              <CardDescription>نسب البيع والإشغال</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="project" type="category" />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="sold" stackId="a" fill="#10b981" name="مباع" />
                  <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="متاح" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectPerformance.map((project) => (
              <Card key={project.project}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{project.project}</CardTitle>
                    <Badge 
                      variant={project.sold > 80 ? "default" : "secondary"}
                      className={project.sold > 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                    >
                      {project.sold}% مباع
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الوحدات المباعة</span>
                      <span className="font-medium">{Math.round(project.sold * 1.2)} وحدة</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الوحدات المتاحة</span>
                      <span className="font-medium">{Math.round(project.available * 0.5)} وحدة</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>إجمالي الإيرادات</span>
                      <span className="font-medium">{(project.sold * 50000).toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تصنيف العملاء</CardTitle>
              <CardDescription>توزيع العملاء حسب قيمة المشتريات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientSegmentation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') {
                        return `${value.toLocaleString('ar-SA')} ر.س`
                      }
                      return value
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="عدد العملاء" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="الإيرادات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {clientSegmentation.map((segment) => (
              <Card key={segment.segment}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{segment.segment}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{segment.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {segment.revenue.toLocaleString('ar-SA')} ر.س
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    متوسط: {Math.round(segment.revenue / segment.count).toLocaleString('ar-SA')} ر.س
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </MotionSection>
  )
}