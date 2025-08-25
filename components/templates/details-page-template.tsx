'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Edit, Trash2, ArrowRight, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface DetailsPageTemplateProps {
  title: string
  subtitle?: string
  breadcrumbs: Array<{ label: string; href: string }>
  loading?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onBack?: () => void
  tabs?: Tab[]
  actions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ElementType
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
  children?: React.ReactNode
}

export function DetailsPageTemplate({
  title,
  subtitle,
  breadcrumbs,
  loading = false,
  onEdit,
  onDelete,
  onBack,
  tabs,
  actions,
  children
}: DetailsPageTemplateProps) {
  return (
    <MotionSection className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.href}>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-none bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
                <div>
                  <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                  {subtitle && (
                    <CardDescription className="text-base mt-2">{subtitle}</CardDescription>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {actions?.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    onClick={action.onClick}
                    className="gap-2"
                  >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </Button>
                ))}
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : tabs ? (
        <Tabs defaultValue={tabs[0]?.id} className="space-y-4">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        children
      )}
    </MotionSection>
  )
}