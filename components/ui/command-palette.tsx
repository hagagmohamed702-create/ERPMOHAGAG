"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { 
  Search, 
  Home, 
  Users, 
  Building2, 
  FileText, 
  DollarSign,
  Plus,
  Settings,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navigate = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "home",
      title: "الصفحة الرئيسية",
      icon: Home,
      action: () => navigate("/"),
      keywords: ["home", "الرئيسية"]
    },
    {
      id: "clients",
      title: "العملاء",
      subtitle: "إدارة العملاء",
      icon: Users,
      action: () => navigate("/clients"),
      keywords: ["clients", "عملاء"]
    },
    {
      id: "projects",
      title: "المشاريع",
      subtitle: "إدارة المشاريع",
      icon: Building2,
      action: () => navigate("/projects"),
      keywords: ["projects", "مشاريع"]
    },
    {
      id: "contracts",
      title: "العقود",
      subtitle: "إدارة العقود",
      icon: FileText,
      action: () => navigate("/contracts"),
      keywords: ["contracts", "عقود"]
    },
    {
      id: "payments",
      title: "المدفوعات",
      subtitle: "إدارة المدفوعات",
      icon: DollarSign,
      action: () => navigate("/payments"),
      keywords: ["payments", "مدفوعات"]
    },
    // Actions
    {
      id: "add-client",
      title: "إضافة عميل جديد",
      icon: Plus,
      action: () => navigate("/clients?action=new"),
      keywords: ["add", "new", "client", "إضافة", "عميل"]
    },
    {
      id: "add-project",
      title: "إضافة مشروع جديد",
      icon: Plus,
      action: () => navigate("/projects?action=new"),
      keywords: ["add", "new", "project", "إضافة", "مشروع"]
    },
    {
      id: "settings",
      title: "الإعدادات",
      icon: Settings,
      action: () => navigate("/settings"),
      keywords: ["settings", "إعدادات"]
    }
  ]

  const filteredCommands = commands.filter(command => {
    const searchLower = search.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.subtitle?.toLowerCase().includes(searchLower) ||
      command.keywords?.some(k => k.toLowerCase().includes(searchLower))
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="ابحث عن أمر أو صفحة..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              لا توجد نتائج
            </Command.Empty>
            
            {filteredCommands.length > 0 && (
              <Command.Group heading="الأوامر">
                {filteredCommands.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={command.id}
                    onSelect={() => command.action()}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-lg px-2 py-3 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    )}
                  >
                    <command.icon className="ml-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{command.title}</div>
                      {command.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {command.subtitle}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
          
          <div className="border-t p-2">
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span>اضغط للاختيار</span>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}