'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GradientHero } from "@/components/ui/gradient-hero"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Package,
  Settings,
  Shield,
  Database,
  BarChart3
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const features = [
    {
      title: "إدارة العملاء والموردين",
      description: "نظام متكامل لإدارة بيانات العملاء والموردين والشركاء",
      icon: Users,
      href: "/clients",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "إدارة العقارات",
      description: "متابعة المشاريع والوحدات والعقود والأقساط",
      icon: Building2,
      href: "/projects",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "النظام المحاسبي",
      description: "نظام محاسبي متكامل مع دليل الحسابات والقيود",
      icon: DollarSign,
      href: "/accounting/accounts",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "إدارة المخازن",
      description: "متابعة المواد والمخازن وحركات المواد",
      icon: Package,
      href: "/warehouses",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "التقارير والإحصائيات",
      description: "تقارير شاملة مع إمكانية التصدير PDF و Excel",
      icon: BarChart3,
      href: "/reports",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "النسخ الاحتياطي",
      description: "نظام آمن للنسخ الاحتياطي واستعادة البيانات",
      icon: Database,
      href: "/settings/backup",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <GradientHero
        title="نظام ERP العقاري المتكامل"
        subtitle="نظام محاسبي وإداري شامل لإدارة شركات المقاولات والعقارات"
        ctaText="لوحة التحكم"
        onCtaClick={() => router.push('/dashboard')}
        gradient="ocean"
      />

      {/* Features Grid */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold">المميزات الرئيسية</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-3 ${feature.bgColor}`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {feature.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={feature.href}>
                      الذهاب إلى القسم
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>نظرة سريعة</CardTitle>
          <CardDescription>
            احصائيات سريعة عن النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">عميل نشط</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">مشروع جاري</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">عقد نشط</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">قسط مستحق</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">نظام آمن وموثوق</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يتميز النظام بأعلى معايير الأمان وحماية البيانات، مع نظام نسخ احتياطي تلقائي
            وإمكانية استعادة البيانات في أي وقت
          </p>
        </CardContent>
      </Card>
    </div>
  )
}