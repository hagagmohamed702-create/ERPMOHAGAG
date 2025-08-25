"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ar } from 'date-fns/locale'

interface ChartsSectionProps {
  timeRange: string
}

// Mock data - سيتم استبدالها بـ API calls
const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'dd/MM', { locale: ar }),
  revenue: Math.floor(Math.random() * 50000) + 20000,
  expenses: Math.floor(Math.random() * 30000) + 10000,
}))

const projectsData = [
  { name: 'مكتمل', value: 12, color: '#10b981' },
  { name: 'قيد التنفيذ', value: 8, color: '#3b82f6' },
  { name: 'متأخر', value: 3, color: '#ef4444' },
  { name: 'معلق', value: 2, color: '#f59e0b' },
]

const installmentsData = [
  { month: 'يناير', paid: 450000, pending: 120000 },
  { month: 'فبراير', paid: 520000, pending: 85000 },
  { month: 'مارس', paid: 380000, pending: 150000 },
  { month: 'أبريل', paid: 620000, pending: 95000 },
  { month: 'مايو', paid: 550000, pending: 110000 },
  { month: 'يونيو', paid: 480000, pending: 130000 },
]

export default function ChartsSection({ timeRange }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الإيرادات والمصروفات</CardTitle>
              <CardDescription>آخر 30 يوم</CardDescription>
            </div>
            <Badge variant="secondary">+12.5%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
                labelStyle={{ direction: 'rtl' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="الإيرادات"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorExpenses)"
                name="المصروفات"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Projects Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>حالة المشاريع</CardTitle>
              <CardDescription>توزيع المشاريع حسب الحالة</CardDescription>
            </div>
            <Badge variant="outline">25 مشروع</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {projectsData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Installments Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تحصيل الأقساط</CardTitle>
              <CardDescription>مقارنة الأقساط المحصلة والمعلقة</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                محصل: 2,850,000 ر.س
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                معلق: 650,000 ر.س
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={installmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
                labelStyle={{ direction: 'rtl' }}
              />
              <Legend />
              <Bar dataKey="paid" fill="#10b981" name="محصل" />
              <Bar dataKey="pending" fill="#f59e0b" name="معلق" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}