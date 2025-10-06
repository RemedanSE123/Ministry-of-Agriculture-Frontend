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
import { useAuth } from "@/contexts/AuthContext" // ← ADD THIS IMPORT

export function DashboardNavbar() {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  
  // 🎯 REPLACE local state with Auth Context
  const { user, logout, isLoading } = useAuth()

  // 🎯 REMOVE this useEffect - AuthContext handles it now
  // useEffect(() => {
  //   const userData = localStorage.getItem("user")
  //   if (userData) {
  //     setUser(JSON.parse(userData))
  //   }
  // }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  // 🎯 UPDATE logout to use Auth Context
  const handleLogout = () => {
    logout() // ← This now uses the context logout function
    // localStorage.removeItem("user") ← REMOVE - handled by context
    // router.push("/login") ← REMOVE - handled by context
  }

  // 🎯 UPDATE to use full_name from backend (not fullName)
  const getUserInitials = () => {
    if (!user?.full_name) return "U"
    const names = user.full_name.split(" ")
    return names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase() 
      : names[0][0].toUpperCase()
  }

  // 🎯 Function to get profile image URL
  const getProfileImageUrl = () => {
    if (!user?.profile_image) return "/placeholder.svg?height=32&width=32"
    
    // If profile_image is a full URL, use it directly
    if (user.profile_image.startsWith('http')) {
      return user.profile_image
    }
    
    // If it's a file path, construct the URL
    return `http://localhost:5000/${user.profile_image}`
  }

  // Show loading state if auth is still checking
  if (isLoading) {
    return (
      <header className="flex h-[72px] items-center justify-between border-b border-border bg-card/50 backdrop-blur-xl px-8">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-xl">
            <div className="h-11 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </header>
    )
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
          
        </div>
      </div>

      <div className="flex items-center gap-2">
      

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 hover:bg-muted/80 transition-colors"
        >
          {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
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
            
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
              
            <DropdownMenuSeparator />
           
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-2 h-8 w-px bg-border" />

        {/* 🎯 UPDATED User Menu - Now uses Auth Context */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-3 px-3 hover:bg-muted/80 transition-colors">
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarImage 
                  src={getProfileImageUrl()} 
                  alt={user?.full_name || "User"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-[13px] font-semibold leading-tight">
                  {user?.full_name || "User"}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight capitalize">
                  {user?.role || user?.position || "Staff"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold capitalize">{user?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email || "user@example.com"}</p>
                {/* 🎯 ADD Role Badge */}
                <Badge 
                  variant="secondary" 
                  className="w-fit text-[10px] capitalize"
                >
                  {user?.role || "user"}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
           <DropdownMenuSeparator />
            
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}