"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, X, Clock, AlertCircle, CheckCircle, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  type: "info" | "success" | "warning" | "error"
  time: string
  read: boolean
}

export function NotificationsDrawer() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "دفعة جديدة مستلمة",
      description: "تم استلام دفعة بقيمة 50,000 ريال من العميل أحمد محمد",
      type: "success",
      time: "منذ 5 دقائق",
      read: false
    },
    {
      id: "2",
      title: "قسط متأخر",
      description: "قسط بقيمة 25,000 ريال متأخر عن الموعد المحدد",
      type: "warning",
      time: "منذ ساعة",
      read: false
    },
    {
      id: "3",
      title: "عقد جديد",
      description: "تم إنشاء عقد جديد للوحدة A-101 في مشروع النخيل",
      type: "info",
      time: "منذ 3 ساعات",
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "error":
        return <X className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      case "warning":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10"
      case "error":
        return "text-red-600 dark:text-red-400 bg-red-500/10"
      default:
        return "text-sky-600 dark:text-sky-400 bg-sky-500/10"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>الإشعارات</SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="ml-1 h-3 w-3" />
                تحديد الكل كمقروء
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] pt-4">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">
                  لا توجد إشعارات جديدة
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative rounded-xl border p-4 transition-all",
                      notification.read 
                        ? "border-border/40 bg-muted/20" 
                        : "border-border bg-background shadow-sm hover:shadow-md"
                    )}
                  >
                    {!notification.read && (
                      <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        getTypeStyles(notification.type)
                      )}>
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}