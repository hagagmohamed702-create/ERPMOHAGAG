'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { MotionSection } from "@/components/ui/motion-section"
import { EmptyState } from "@/components/ui/empty-state"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Plus, Download, Upload } from "lucide-react"
import { motion } from "framer-motion"
import type { ColumnDef } from "@tanstack/react-table"

interface ListPageTemplateProps<T> {
  title: string
  description: string
  breadcrumbs: Array<{ label: string; href: string }>
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  onAdd?: () => void
  onExport?: () => void
  onImport?: () => void
  emptyStateProps?: {
    title: string
    description: string
    icon?: React.ElementType
  }
  children?: React.ReactNode
}

export function ListPageTemplate<T>({
  title,
  description,
  breadcrumbs,
  data,
  columns,
  loading = false,
  onAdd,
  onExport,
  onImport,
  emptyStateProps = {
    title: "لا توجد بيانات",
    description: "ابدأ بإضافة عنصر جديد"
  },
  children
}: ListPageTemplateProps<T>) {
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
              <div>
                <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                <CardDescription className="text-base mt-2">{description}</CardDescription>
              </div>
              <div className="flex gap-2">
                {onImport && (
                  <Button variant="outline" onClick={onImport} className="gap-2">
                    <Upload className="h-4 w-4" />
                    استيراد
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير
                  </Button>
                )}
                {onAdd && (
                  <Button onClick={onAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة جديد
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              title={emptyStateProps.title}
              description={emptyStateProps.description}
              icon={emptyStateProps.icon}
              actionLabel={onAdd ? "إضافة الآن" : undefined}
              onAction={onAdd}
            />
          ) : (
            <DataTable
              columns={columns}
              data={data}
            />
          )}
        </CardContent>
      </Card>

      {/* Additional Content */}
      {children}
    </MotionSection>
  )
}