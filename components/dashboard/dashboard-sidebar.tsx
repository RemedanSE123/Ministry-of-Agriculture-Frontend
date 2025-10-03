"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Sprout,
  Users,
  FileText,
  Settings,
  Database,
  TrendingUp,
  MapPin,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Leaf,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navigationItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Collected Data",
    items: [
      { name: "Kobo Data", href: "/dashboard/collected-data", icon: Database }, // Add this line
      { name: "Crop Management", href: "/dashboard/crops", icon: Sprout },
      { name: "Farm Registry", href: "/dashboard/farms", icon: MapPin },
      { name: "Production Data", href: "/dashboard/production", icon: TrendingUp },
      { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "Stakeholders", href: "/dashboard/stakeholders", icon: Users },
      { name: "User Management", href: "/dashboard/users", icon: UserCog },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
      { name: "Data Management", href: "/dashboard/data", icon: Database },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Alerts", href: "/dashboard/alerts", icon: AlertCircle, badge: "3" },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[280px]",
      )}
    >
      <div className="flex h-[72px] items-center border-b border-sidebar-border px-5">
        {!collapsed ? (
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Leaf className="h-5 w-5 text-primary-foreground" />
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-sidebar" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-sidebar-foreground">
                Ministry of Agriculture
              </span>
              <span className="text-xs text-muted-foreground leading-tight">Central Dashboard</span>
            </div>
          </div>
        ) : (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Leaf className="h-5 w-5 text-primary-foreground" />
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-sidebar" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 scrollbar-thin">
        {navigationItems.map((section, sectionIndex) => (
          <div key={section.title} className={cn("mb-8", sectionIndex === navigationItems.length - 1 && "mb-0")}>
            {!collapsed && (
              <h3 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative w-full justify-start gap-3 font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
                      {!collapsed && <span className="flex-1 text-left text-[13px]">{item.name}</span>}
                      {!collapsed && item.badge && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px] font-semibold">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-start gap-3 font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[13px]">Collapse sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
