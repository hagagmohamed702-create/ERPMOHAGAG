"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ModernTable,
  ModernTableHeader,
  ModernTableHead,
  ModernTableRow,
  ModernTableCell,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  Settings2,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
} from "lucide-react"

interface ModernDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  title?: string
  description?: string
  showToolbar?: boolean
  showPagination?: boolean
  showColumnVisibility?: boolean
  showExport?: boolean
  showActions?: boolean
  onAdd?: () => void
  onRefresh?: () => void
  onExport?: () => void
  onBulkDelete?: (selectedRows: TData[]) => void
  pageSize?: number
  className?: string
  variant?: "default" | "modern"
}

export function ModernDataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  searchPlaceholder = "البحث...",
  title,
  description,
  showToolbar = true,
  showPagination = true,
  showColumnVisibility = true,
  showExport = true,
  showActions = true,
  onAdd,
  onRefresh,
  onExport,
  onBulkDelete,
  pageSize = 10,
  className,
  variant = "modern",
}: ModernDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const TableComponent = variant === "modern" ? ModernTable : Table
  const TableHeaderComponent = variant === "modern" ? ModernTableHeader : TableHeader
  const TableHeadComponent = variant === "modern" ? ModernTableHead : TableHead
  const TableRowComponent = variant === "modern" ? ModernTableRow : TableRow
  const TableCellComponent = variant === "modern" ? ModernTableCell : TableCell

  return (
    <div className="space-y-6">
      {/* Header Section */}
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="pr-10 pl-4 h-12 rounded-xl border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                )}

                {onAdd && (
                  <Button
                    onClick={onAdd}
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 ml-2" />
                    إضافة جديد
                  </Button>
                )}

                {showColumnVisibility && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                      >
                        <Settings2 className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              <div className="flex items-center gap-2">
                                {column.getIsVisible() ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                                {column.id}
                              </div>
                            </DropdownMenuCheckboxItem>
                          )
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {showExport && onExport && (
                  <Button
                    variant="outline"
                    onClick={onExport}
                    className="h-12 px-6 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                  >
                    <Download className="h-5 w-5 ml-2" />
                    تصدير
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedRows.length > 0 && onBulkDelete && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  {selectedRows.length} صف محدد
                </Badge>
                <span className="text-sm text-muted-foreground">
                  تم تحديد {selectedRows.length} صف
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkDelete(selectedRows.map(row => row.original))}
                className="rounded-lg"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف المحدد
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <TableComponent className={className}>
              <TableHeaderComponent>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHeadComponent key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHeadComponent>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeaderComponent>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRowComponent
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCellComponent key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCellComponent>
                      ))}
                    </TableRowComponent>
                  ))
                ) : (
                  <TableRow>
                    <TableCellComponent
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <Search className="h-6 w-6" />
                        </div>
                        <p>لا توجد نتائج</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </TableCellComponent>
                  </TableRow>
                )}
              </TableBody>
            </TableComponent>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      {showPagination && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} إلى{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  من {table.getFilteredRowModel().rows.length} نتيجة
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">الصفحة:</p>
                  <Select
                    value={`${table.getState().pagination.pageIndex + 1}`}
                    onValueChange={(value) => {
                      table.setPageIndex(Number(value) - 1)
                    }}
                  >
                    <SelectTrigger className="w-20 h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: table.getPageCount() }, (_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}`}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    من {table.getPageCount()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}