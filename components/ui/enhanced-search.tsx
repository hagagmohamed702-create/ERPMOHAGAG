"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Command, ArrowUp, ArrowDown, FileText, Users, Building2, DollarSign, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'contract' | 'client' | 'project' | 'unit' | 'payment' | 'invoice'
  href: string
  icon: React.ReactNode
  priority: number
}

const searchResults: SearchResult[] = [
  {
    id: '1',
    title: 'عقد محمد أحمد',
    description: 'عقد بيع وحدة A-101 في مشروع النخيل',
    type: 'contract',
    href: '/contracts/1',
    icon: <FileText className="h-4 w-4" />,
    priority: 1
  },
  {
    id: '2',
    title: 'العميل أحمد محمد',
    description: 'عميل نشط - 3 عقود',
    type: 'client',
    href: '/clients/1',
    icon: <Users className="h-4 w-4" />,
    priority: 2
  },
  {
    id: '3',
    title: 'مشروع النخيل',
    description: 'مشروع سكني - 85% مكتمل',
    type: 'project',
    href: '/projects/1',
    icon: <Building2 className="h-4 w-4" />,
    priority: 3
  },
  {
    id: '4',
    title: 'دفعة العميل سارة',
    description: '50,000 ر.س - تم استلامها اليوم',
    type: 'payment',
    href: '/payments/1',
    icon: <DollarSign className="h-4 w-4" />,
    priority: 4
  },
  {
    id: '5',
    title: 'فاتورة #1234',
    description: 'فاتورة خدمات - 15,000 ر.س',
    type: 'invoice',
    href: '/invoices/1',
    icon: <FileText className="h-4 w-4" />,
    priority: 5
  }
]

const typeColors = {
  contract: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  client: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  project: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  unit: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  payment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  invoice: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
}

const typeLabels = {
  contract: 'عقد',
  client: 'عميل',
  project: 'مشروع',
  unit: 'وحدة',
  payment: 'دفعة',
  invoice: 'فاتورة'
}

export function EnhancedSearch() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchResults
        .filter(result => 
          result.title.includes(query) || 
          result.description.includes(query)
        )
        .sort((a, b) => a.priority - b.priority)
      setFilteredResults(filtered)
      setSelectedIndex(0)
    } else {
      setFilteredResults([])
    }
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery("")
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : 0
        )
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredResults.length - 1
        )
      }
      
      if (e.key === 'Enter' && filteredResults.length > 0) {
        e.preventDefault()
        const selected = filteredResults[selectedIndex]
        if (selected) {
          window.location.href = selected.href
          setIsOpen(false)
          setQuery("")
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredResults, selectedIndex])

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.href
    setIsOpen(false)
    setQuery("")
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="بحث في النظام... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pr-10 pl-4 h-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || filteredResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-2xl shadow-black/10 dark:shadow-white/5 backdrop-blur-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/20">
            <span className="text-sm font-medium text-muted-foreground">
              نتائج البحث
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    index === selectedIndex && "bg-muted/80"
                  )}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      {result.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {result.title}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", typeColors[result.type])}
                      >
                        {typeLabels[result.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <ArrowUp className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : query.trim() ? (
              <div className="p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
                <p className="text-xs text-muted-foreground mt-1">
                  جرب البحث بكلمات مختلفة
                </p>
              </div>
            ) : (
              <div className="p-6 text-center">
                <Command className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">ابدأ الكتابة للبحث</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ابحث في العقود، العملاء، المشاريع والمزيد
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredResults.length > 0 && (
            <div className="p-3 border-t border-border/20 bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>استخدم ↑↓ للتنقل، Enter للاختيار</span>
                <span>{filteredResults.length} نتيجة</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}