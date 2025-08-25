"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Share2,
  Archive,
  RefreshCw,
  Star,
  Heart,
  Flag,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface ActionButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ElementType
}

export function ActionButton({
  variant = "outline",
  size = "sm",
  className,
  children,
  onClick,
  disabled = false,
  icon: Icon,
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 px-3 rounded-lg transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "shadow-sm hover:shadow-md",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4 ml-2" />}
      {children}
    </Button>
  )
}

interface ActionMenuProps {
  actions: {
    label: string
    icon?: React.ElementType
    onClick?: () => void
    disabled?: boolean
    variant?: "default" | "destructive" | "outline"
    badge?: string
    badgeVariant?: "default" | "secondary" | "destructive" | "outline"
    separator?: boolean
  }[]
  trigger?: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

export function ActionMenu({
  actions,
  trigger,
  align = "end",
  className,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-muted/50",
              "transition-all duration-200 hover:scale-105",
              className
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer",
                "transition-all duration-200 hover:bg-muted/50",
                action.variant === "destructive" && "text-destructive hover:text-destructive",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {action.icon && (
                <action.icon className={cn(
                  "h-4 w-4",
                  action.variant === "destructive" ? "text-destructive" : "text-muted-foreground"
                )} />
              )}
              <span className="flex-1">{action.label}</span>
              {action.badge && (
                <Badge variant={action.badgeVariant || "secondary"} className="ml-auto">
                  {action.badge}
                </Badge>
              )}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function StatusBadge({
  status,
  variant = "default",
  size = "default",
  className,
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, {
      variant: "default" | "secondary" | "destructive" | "outline"
      icon: React.ElementType
      className: string
    }> = {
      active: {
        variant: "default",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      },
      inactive: {
        variant: "destructive",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      },
      pending: {
        variant: "secondary",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      },
      completed: {
        variant: "default",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      },
      cancelled: {
        variant: "destructive",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      },
      draft: {
        variant: "secondary",
        icon: FileText,
        className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      },
      published: {
        variant: "default",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      },
      archived: {
        variant: "secondary",
        icon: Archive,
        className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      }
    }
    
    return configs[status.toLowerCase()] || {
      variant: "default",
      icon: Info,
      className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border font-medium",
        "transition-all duration-200 hover:scale-105",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-4 py-2",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

interface DataCellProps {
  value: string | number | boolean | Date | null | undefined
  type?: "text" | "number" | "currency" | "date" | "status" | "boolean" | "email" | "phone" | "url"
  format?: Intl.DateTimeFormatOptions
  className?: string
  icon?: React.ElementType
  statusConfig?: Record<string, any>
}

export function DataCell({
  value,
  type = "text",
  format,
  className,
  icon: Icon,
  statusConfig,
}: DataCellProps) {
    const formatValue = (): React.ReactNode => {
    if (value === null || value === undefined) return "-"
    
    switch (type) {
      case "number":
        return typeof value === "number" ? value.toLocaleString() : String(value)
      case "currency":
        return typeof value === "number" ? `$${value.toLocaleString()}` : String(value)
      case "date":
        if (value instanceof Date) {
          return format ? value.toLocaleDateString("ar-SA", { ...format }) : value.toLocaleDateString("ar-SA")
        }
        return String(value)
      case "status":
        return statusConfig ? (
          <StatusBadge status={String(value)} {...statusConfig} />
        ) : (
          <StatusBadge status={String(value)} />
        )
      case "boolean":
        return value ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )
      case "email":
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${String(value)}`} className="text-blue-600 hover:underline">
              {String(value)}
            </a>
          </div>
        )
      case "phone":
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${String(value)}`} className="text-blue-600 hover:underline">
              {String(value)}
            </a>
          </div>
        )
      case "url":
        return (
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {String(value)}
            </a>
          </div>
        )
      default:
        return String(value)
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-2",
      type === "status" && "justify-center",
      className
    )}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      {formatValue()}
    </div>
  )
}

