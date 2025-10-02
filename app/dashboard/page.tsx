"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"

interface User {
  id: number
  full_name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats] = useState({
    totalUsers: 150,
    pendingApprovals: 23,
    activeUsers: 127,
    dataPoints: 50000,
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="animate-fadeInUp">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {user.full_name}! 👋</h1>
        <p className="text-lg text-muted-foreground">Here's what's happening with the agricultural data portal today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary animate-fadeInUp delay-100">
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-4xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-2xl mr-2">👥</span>
              <span>Registered in system</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent animate-fadeInUp delay-200">
          <CardHeader className="pb-3">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-4xl">{stats.pendingApprovals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-2xl mr-2">⏳</span>
              <span>Awaiting review</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary animate-fadeInUp delay-300">
          <CardHeader className="pb-3">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-4xl">{stats.activeUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-2xl mr-2">✅</span>
              <span>Currently active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary animate-fadeInUp delay-400">
          <CardHeader className="pb-3">
            <CardDescription>Data Points</CardDescription>
            <CardTitle className="text-4xl">{stats.dataPoints.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-2xl mr-2">📊</span>
              <span>Collected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-fadeInUp delay-500">
        <CardHeader>
          <CardTitle className="text-2xl">Quick Actions</CardTitle>
          <CardDescription>Frequently used features and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push("/dashboard/users")}
              variant="outline"
              className="h-auto py-6 flex flex-col items-start space-y-2 hover:bg-primary/5 hover:border-primary transition-all duration-300"
            >
              <span className="text-3xl">👥</span>
              <div className="text-left">
                <p className="font-semibold">Manage Users</p>
                <p className="text-xs text-muted-foreground">Approve and manage access</p>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/dashboard/reports")}
              variant="outline"
              className="h-auto py-6 flex flex-col items-start space-y-2 hover:bg-accent/5 hover:border-accent transition-all duration-300"
            >
              <span className="text-3xl">📊</span>
              <div className="text-left">
                <p className="font-semibold">View Reports</p>
                <p className="text-xs text-muted-foreground">Analytics and insights</p>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/dashboard/settings")}
              variant="outline"
              className="h-auto py-6 flex flex-col items-start space-y-2 hover:bg-secondary/5 hover:border-secondary transition-all duration-300"
            >
              <span className="text-3xl">⚙️</span>
              <div className="text-left">
                <p className="font-semibold">Settings</p>
                <p className="text-xs text-muted-foreground">Account settings</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-start space-y-2 hover:bg-primary/5 hover:border-primary transition-all duration-300 bg-transparent"
            >
              <span className="text-3xl">📋</span>
              <div className="text-left">
                <p className="font-semibold">Activities</p>
                <p className="text-xs text-muted-foreground">Recent activities</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="animate-fadeInUp delay-600">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Activity</CardTitle>
          <CardDescription>Latest system events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: "✅", text: "New user registration: John Doe", time: "2 hours ago", color: "bg-primary/10" },
              {
                icon: "📊",
                text: "Data collection completed: Farm Survey 2025",
                time: "5 hours ago",
                color: "bg-accent/10",
              },
              { icon: "🔄", text: "System backup completed successfully", time: "1 day ago", color: "bg-secondary/10" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center text-xl`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{activity.text}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
