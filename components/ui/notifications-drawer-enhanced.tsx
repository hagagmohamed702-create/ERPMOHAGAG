"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info,
  DollarSign,
  FileText,
  Receipt,
  Settings,
  ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useNotifications, requestNotificationPermission, type NotificationCategory } from "@/lib/notifications"
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
}

const categoryIconMap = {
  payment: DollarSign,
  contract: FileText,
  installment: Receipt,
  system: Settings,
  general: Bell,
}

const typeStyles = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export function NotificationsDrawerEnhanced() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all')
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setHasPermission(granted)
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === filter)

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id)
    if (notification.link) {
      setOpen(false)
    }
    if (notification.actionCallback) {
      notification.actionCallback()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md" side="left">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>الإشعارات</SheetTitle>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <Check className="h-4 w-4 ml-1" />
                    قراءة الكل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                  >
                    <X className="h-4 w-4 ml-1" />
                    مسح الكل
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        {!hasPermission && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              فعّل الإشعارات لتصلك التنبيهات المهمة
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestPermission}
              className="w-full"
            >
              <Bell className="h-4 w-4 ml-2" />
              تفعيل الإشعارات
            </Button>
          </div>
        )}

        <Tabs value={filter} onValueChange={(value) => setFilter(value as NotificationCategory | 'all')} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">
              الكل {notifications.length > 0 && `(${notifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="payment">
              مدفوعات
            </TabsTrigger>
            <TabsTrigger value="contract">
              عقود
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <TabsContent value={filter} className="mt-0">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد إشعارات</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => {
                      const Icon = iconMap[notification.type]
                      const CategoryIcon = categoryIconMap[notification.category]
                      
                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                              !notification.read && "bg-primary/5 border-primary/20",
                              notification.read && "bg-muted/30"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2 rounded-full",
                                typeStyles[notification.type]
                              )}>
                                <Icon className="h-4 w-4" />
                              </div>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{notification.title}</p>
                                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {notification.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 ml-1" />
                                    {formatDistanceToNow(notification.createdAt, { 
                                      addSuffix: true,
                                      locale: ar 
                                    })}
                                  </p>
                                  {notification.link && (
                                    <Link href={notification.link}>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        className="h-6 text-xs"
                                      >
                                        عرض
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}