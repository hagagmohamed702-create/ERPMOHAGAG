'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Database,
  Download,
  Globe,
  Moon,
  RefreshCw,
  Settings2,
  Shield,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useErrorToast } from "@/lib/hooks/useErrorToast"
import { motion } from "framer-motion"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { showError, showSuccess, showWarning } = useErrorToast()
  const [loading, setLoading] = useState(false)
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: false,
    backupInterval: 'daily',
    backupLocation: 'local',
  })

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/backups/run', { method: 'POST' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Backup failed')
      showSuccess(result.message || 'تم إنشاء نسخة احتياطية بنجاح')
    } catch (error) {
      showError('فشل في إنشاء نسخة احتياطية')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) return
    setLoading(true)
    try {
      // Placeholder: no restore API implemented yet
      showError('ميزة الاستعادة غير متاحة حالياً')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('تحذير: سيتم حذف جميع البيانات نهائياً. هل أنت متأكد؟')) return
    if (!confirm('هذا الإجراء لا يمكن التراجع عنه. هل تريد المتابعة؟')) return
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reset', { method: 'POST' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Reset failed')
      showWarning(result.message || 'تم إعادة ضبط النظام بنجاح')
    } catch (error) {
      showError('فشل في إعادة ضبط النظام')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MotionSection className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>الإعدادات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام والتفضيلات</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            النسخ الاحتياطي
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            متقدم
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>تخصيص الإعدادات الأساسية للنظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">اسم الشركة</Label>
                <Input id="company-name" placeholder="أدخل اسم الشركة" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-email">البريد الإلكتروني</Label>
                <Input id="company-email" type="email" placeholder="info@company.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-phone">رقم الهاتف</Label>
                <Input id="company-phone" type="tel" dir="ltr" placeholder="+20 100 000 0000" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الإشعارات</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات بالأقساط المستحقة والمتأخرة
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="btn-primary">
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>المظهر</CardTitle>
              <CardDescription>تخصيص مظهر النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>السمة</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'فاتح', icon: '☀️' },
                    { value: 'dark', label: 'داكن', icon: '🌙' },
                    { value: 'system', label: 'النظام', icon: '💻' },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(option.value)}
                      className={`
                        relative rounded-xl border-2 p-4 text-center transition-all
                        ${theme === option.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                      {theme === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>اللغة</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Globe className="ml-2 h-4 w-4" />
                    العربية (RTL)
                  </Button>
                  <Button variant="outline" className="justify-start" disabled>
                    <Globe className="ml-2 h-4 w-4" />
                    English (LTR)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>النسخ الاحتياطي</CardTitle>
              <CardDescription>إدارة النسخ الاحتياطية للبيانات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>النسخ الاحتياطي التلقائي</Label>
                  <p className="text-sm text-muted-foreground">
                    إنشاء نسخ احتياطية تلقائياً
                  </p>
                </div>
                <Switch 
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => 
                    setBackupSettings({ ...backupSettings, autoBackup: checked })
                  }
                />
              </div>

              {backupSettings.autoBackup && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>تكرار النسخ</Label>
                    <select 
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={backupSettings.backupInterval}
                      onChange={(e) => 
                        setBackupSettings({ ...backupSettings, backupInterval: e.target.value })
                      }
                    >
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>موقع الحفظ</Label>
                    <select 
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={backupSettings.backupLocation}
                      onChange={(e) => 
                        setBackupSettings({ ...backupSettings, backupLocation: e.target.value })
                      }
                    >
                      <option value="local">محلي</option>
                      <option value="cloud">سحابي</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleBackup}
                  disabled={loading}
                  className="flex-1"
                >
                  <Download className="ml-2 h-4 w-4" />
                  إنشاء نسخة احتياطية الآن
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleRestore}
                  disabled={loading}
                  className="flex-1"
                >
                  <Upload className="ml-2 h-4 w-4" />
                  استعادة نسخة احتياطية
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                آخر نسخة احتياطية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">التاريخ: منذ 3 أيام</p>
              <p className="text-sm">الحجم: 45.2 ميجابايت</p>
              <p className="text-sm">الموقع: محلي</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>الإعدادات المتقدمة</CardTitle>
              <CardDescription>إعدادات متقدمة للنظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => showSuccess('تم مسح ذاكرة التخزين المؤقت')}
                >
                  <RefreshCw className="ml-2 h-4 w-4" />
                  مسح ذاكرة التخزين المؤقت
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => showSuccess('تم تحديث الفهارس')}
                >
                  <Database className="ml-2 h-4 w-4" />
                  إعادة بناء فهارس قاعدة البيانات
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                منطقة خطرة
              </CardTitle>
              <CardDescription>
                إجراءات لا يمكن التراجع عنها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive"
                onClick={handleReset}
                disabled={loading}
                className="w-full"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                إعادة ضبط النظام وحذف جميع البيانات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MotionSection>
  )
}