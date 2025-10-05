"use client"

import { useState, useEffect } from "react"
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
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SidebarProject {
  id: number
  project_uid: string
  project_name: string
  token_name: string
  deployment_active: boolean
}

// API utility for sidebar
const sidebarApi = {
  async getUserProjects(): Promise<{ success: boolean; projects: SidebarProject[] }> {
    try {
      const response = await fetch('http://localhost:5000/api/projects/user')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching projects for sidebar:', error)
      return { success: false, projects: [] }
    }
  }
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [savedProjects, setSavedProjects] = useState<SidebarProject[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'collected-data']))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedProjects()
  }, [])

  const loadSavedProjects = async () => {
    try {
      setLoading(true)
      const response = await sidebarApi.getUserProjects()
      if (response.success) {
        console.log('Loaded projects for sidebar:', response.projects.length)
        setSavedProjects(response.projects)
      } else {
        console.error('Failed to load projects for sidebar')
      }
    } catch (error) {
      console.error('Error loading projects for sidebar:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  // Group projects by token
  const projectsByToken = savedProjects.reduce((acc, project) => {
    if (!acc[project.token_name]) {
      acc[project.token_name] = []
    }
    acc[project.token_name].push(project)
    return acc
  }, {} as Record<string, SidebarProject[]>)

  const baseNavigationItems = [
    {
      title: "Overview",
      id: "overview",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Collected Data", 
      id: "collected-data",
      items: [
        { 
          name: "Kobo Data Management", 
          href: "/dashboard/collected-data", 
          icon: Database 
        },
      ],
    },
    {
      title: "Administration",
      id: "administration",
      items: [
        { name: "Stakeholders", href: "/dashboard/stakeholders", icon: Users },
        { name: "User Management", href: "/dashboard/users", icon: UserCog },
        { name: "Reports", href: "/dashboard/reports", icon: FileText },
        { name: "Data Management", href: "/dashboard/data", icon: Database },
      ],
    },
    {
      title: "System",
      id: "system",
      items: [
        { name: "Alerts", href: "/dashboard/alerts", icon: AlertCircle, badge: "3" },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ]

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
        {baseNavigationItems.map((section) => (
          <div key={section.id} className="mb-6">
            {!collapsed && (
              <div className="flex items-center justify-between mb-3 px-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {section.title}
                </h3>
                {section.id === "collected-data" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-sidebar-accent/50"
                    onClick={() => toggleSection(section.id)}
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
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

              {/* Saved Projects Section */}
              {!collapsed && section.id === "collected-data" && expandedSections.has(section.id) && (
                <div className="ml-4 mt-3 space-y-3 border-l-2 border-sidebar-border pl-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground ml-2">Loading projects...</span>
                    </div>
                  ) : Object.keys(projectsByToken).length > 0 ? (
                    Object.entries(projectsByToken).map(([tokenName, projects]) => (
                      <div key={tokenName} className="space-y-2">
                        <div className="flex items-center gap-2 px-2 py-1 bg-sidebar-accent/30 rounded-lg">
                          <FolderOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-sidebar-foreground truncate flex-1">
                            {tokenName}
                          </span>
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-primary/20">
                            {projects.length}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {projects.map((project) => {
                            const isActive = pathname === `/dashboard/project/${project.project_uid}`
                            return (
                              <Link key={project.id} href={`/dashboard/project/${project.project_uid}`}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "relative w-full justify-start gap-2 h-8 text-xs transition-all duration-200",
                                    isActive
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                  )}
                                >
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    project.deployment_active ? "bg-green-500" : "bg-gray-400"
                                  )} />
                                  <span className="truncate flex-1 text-left">{project.project_name}</span>
                                  {isActive && (
                                    <div className="absolute left-0 top-1/2 h-3 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                                  )}
                                </Button>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center bg-sidebar-accent/20 rounded-lg border border-sidebar-border">
                      <Database className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No saved projects yet</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        Add projects from Kobo Data Management
                      </p>
                    </div>
                  )}
                </div>
              )}
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