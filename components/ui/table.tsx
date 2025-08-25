import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm border-collapse",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
        "rounded-2xl overflow-hidden shadow-xl border border-border/30",
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700",
      "border-b-2 border-primary/20",
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "divide-y divide-border/30",
      "bg-white/60 dark:bg-slate-900/60",
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t-2 border-primary/20",
      "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700",
      "font-semibold",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-all duration-200 ease-in-out",
      "hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5",
      "hover:shadow-sm hover:scale-[1.01]",
      "data-[state=selected]:bg-primary/10",
      "group",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-16 px-6 text-right align-middle",
      "font-bold text-slate-700 dark:text-slate-200",
      "text-base tracking-wide",
      "border-r border-border/20 last:border-r-0",
      "bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600",
      "shadow-sm",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-6 align-middle text-right",
      "text-slate-600 dark:text-slate-300",
      "font-medium",
      "border-r border-border/20 last:border-r-0",
      "group-hover:bg-white/50 dark:group-hover:bg-slate-800/50",
      "transition-colors duration-200",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-6 text-lg font-semibold text-slate-600 dark:text-slate-400",
      "text-center",
      className
    )}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Enhanced Table Components for Modern Design
const ModernTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl border border-border/20">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm border-collapse",
        "bg-gradient-to-br from-white/90 via-white/80 to-slate-50/90",
        "dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90",
        "backdrop-blur-xl",
        className
      )}
      {...props}
    />
  </div>
))
ModernTable.displayName = "ModernTable"

const ModernTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10",
      "dark:from-blue-600/20 dark:via-purple-600/20 dark:to-indigo-600/20",
      "border-b-2 border-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30",
      "backdrop-blur-sm",
      className
    )} 
    {...props} 
  />
))
ModernTableHeader.displayName = "ModernTableHeader"

const ModernTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-20 px-8 text-right align-middle",
      "font-bold text-slate-800 dark:text-slate-100",
      "text-lg tracking-wide",
      "border-r border-white/20 dark:border-slate-600/20 last:border-r-0",
      "bg-gradient-to-b from-white/50 to-slate-100/50",
      "dark:from-slate-700/50 dark:to-slate-600/50",
      "backdrop-blur-sm shadow-lg",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
ModernTableHead.displayName = "ModernTableHead"

const ModernTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-8 align-middle text-right",
      "text-slate-700 dark:text-slate-200",
      "font-medium text-base",
      "border-r border-white/30 dark:border-slate-600/30 last:border-r-0",
      "group-hover:bg-gradient-to-r group-hover:from-blue-50/50 group-hover:to-purple-50/50",
      "dark:group-hover:from-blue-900/20 dark:group-hover:to-purple-900/20",
      "transition-all duration-300 ease-out",
      "relative",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
ModernTableCell.displayName = "ModernTableCell"

const ModernTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-all duration-300 ease-out",
      "hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30",
      "dark:hover:from-blue-900/10 dark:hover:to-purple-900/10",
      "hover:shadow-lg hover:scale-[1.005]",
      "hover:border-l-4 hover:border-l-blue-500/50",
      "data-[state=selected]:bg-gradient-to-r data-[state=selected]:from-primary/20 data-[state=selected]:to-purple-500/20",
      "group cursor-pointer",
      "border-b border-white/20 dark:border-slate-700/20",
      className
    )}
    {...props}
  />
))
ModernTableRow.displayName = "ModernTableRow"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  // Modern Table Components
  ModernTable,
  ModernTableHeader,
  ModernTableHead,
  ModernTableRow,
  ModernTableCell,
}