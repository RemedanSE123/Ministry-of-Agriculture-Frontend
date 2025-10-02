"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./ui/button"

interface User {
  role: string
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
  { id: "users", label: "User Management", icon: "👥", path: "/dashboard/users", adminOnly: true },
  { id: "reports", label: "Reports", icon: "📈", path: "/dashboard/reports" },
  { id: "settings", label: "Settings", icon: "⚙️", path: "/dashboard/settings" },
]

export default function DashboardSidebar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col animate-slideInLeft">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-sidebar-primary-foreground font-bold">MOA</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Data Portal</h2>
            <p className="text-xs text-sidebar-foreground/70">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          if (item.adminOnly && user?.role === "user") return null

          return (
            <Button
              key={item.id}
              onClick={() => router.push(item.path)}
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start h-12 text-base transition-all duration-300 ${
                isActive(item.path)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-105"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } animate-fadeInUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-4">
          <p className="text-sm font-medium text-sidebar-accent-foreground mb-1">Need Help?</p>
          <p className="text-xs text-sidebar-accent-foreground/70">Contact system administrator</p>
        </div>
      </div>
    </aside>
  )
}
