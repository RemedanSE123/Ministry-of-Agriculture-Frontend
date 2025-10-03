"use client"

import {
  Bell,
  Search,
  HelpCircle,
  Moon,
  Sun,
  Command,
  FileText,
  AlertCircle,
  TrendingUp,
  LogOut,
  User,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function DashboardNavbar() {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!user?.fullName) return "U"
    const names = user.fullName.split(" ")
    return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase()
  }

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-card/50 backdrop-blur-xl px-8">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search farms, reports, analytics..."
            className="h-11 pl-11 pr-20 bg-background/60 border-border/60 focus-visible:bg-background transition-colors text-[13px] placeholder:text-muted-foreground/60"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Environment Badge */}
        <Badge variant="outline" className="hidden md:flex gap-2 px-3 py-1.5 border-accent/30 bg-accent/5 text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-semibold">Production</span>
        </Badge>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 hover:bg-muted/80 transition-colors"
        >
          {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/80 transition-colors">
          <HelpCircle className="h-[18px] w-[18px]" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-muted/80 transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px]">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                3 new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              <DropdownMenuItem className="flex flex-col items-start gap-2 p-4 cursor-pointer">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[13px] font-semibold leading-tight">Crop Report Ready</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Q1 2025 agricultural production report is now available for review
                    </p>
                    <span className="text-[11px] text-muted-foreground">2 minutes ago</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-2 p-4 cursor-pointer">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[13px] font-semibold leading-tight">System Maintenance</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Scheduled database maintenance tonight at 2:00 AM
                    </p>
                    <span className="text-[11px] text-muted-foreground">1 hour ago</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-2 p-4 cursor-pointer">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[13px] font-semibold leading-tight">Production Milestone</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Northern region exceeded quarterly targets by 15%
                    </p>
                    <span className="text-[11px] text-muted-foreground">3 hours ago</span>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-[13px] font-medium text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-2 h-8 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-3 px-3 hover:bg-muted/80 transition-colors">
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarImage src={user?.profileImage || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-[13px] font-semibold leading-tight">{user?.fullName || "User"}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{user?.position || "Staff"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{user?.fullName || "User"}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profile">
              <DropdownMenuItem className="cursor-pointer text-[13px]">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="cursor-pointer text-[13px]">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer text-[13px] font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
