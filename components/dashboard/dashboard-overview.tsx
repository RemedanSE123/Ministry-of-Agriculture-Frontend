import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Sprout,
  MapPin,
  Package,
  ArrowUpRight,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const stats = [
  {
    title: "Total Registered Farms",
    value: "12,458",
    change: "+12.5%",
    trend: "up",
    icon: MapPin,
    description: "Active farms nationwide",
  },
  {
    title: "Active Crop Cycles",
    value: "8,234",
    change: "+8.2%",
    trend: "up",
    icon: Sprout,
    description: "Currently in production",
  },
  {
    title: "Registered Farmers",
    value: "45,892",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    description: "Verified stakeholders",
  },
  {
    title: "Production Volume",
    value: "234.5K MT",
    change: "-2.4%",
    trend: "down",
    icon: Package,
    description: "Total metric tons",
  },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">Agricultural Dashboard</h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Comprehensive overview of national agricultural operations, production metrics, and stakeholder management
          </p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card
              key={stat.title}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
                    {stat.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground/70">{stat.description}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`gap-1 px-2 py-0.5 ${
                      stat.trend === "up"
                        ? "bg-accent/10 text-accent border-accent/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-xs font-semibold">{stat.change}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart Placeholder */}
        <Card className="col-span-4 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Production Trends</CardTitle>
              <CardDescription>Monthly agricultural production overview for 2025</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5">
              View Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="h-[320px] flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
            <div className="text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Chart Component Placeholder</p>
              <p className="text-xs text-muted-foreground/70">Production analytics will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest system updates and events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "New Farm Registration",
                description: "Farm ID: AGR-2025-1234 • Northern Province",
                time: "5 minutes ago",
                type: "success",
              },
              {
                title: "Production Report Submitted",
                description: "Region: Central District • Crop: Rice",
                time: "23 minutes ago",
                type: "info",
              },
              {
                title: "Inventory Update",
                description: "Warehouse: Central Storage • +2,500 MT",
                time: "1 hour ago",
                type: "info",
              },
              {
                title: "Stakeholder Meeting",
                description: "Quarterly review scheduled",
                time: "2 hours ago",
                type: "warning",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="group flex gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    activity.type === "success"
                      ? "bg-accent"
                      : activity.type === "warning"
                        ? "bg-chart-3"
                        : "bg-primary"
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{activity.description}</p>
                  <p className="text-[11px] text-muted-foreground/70">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Regional Distribution</CardTitle>
            <CardDescription>Farm distribution across provinces</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
            <div className="text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 mx-auto">
                <MapPin className="h-6 w-6 text-chart-2" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Map Component</p>
              <p className="text-xs text-muted-foreground/70">Geographic data visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Crop Distribution</CardTitle>
            <CardDescription>Production by crop category</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
            <div className="text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mx-auto">
                <Sprout className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Chart Component</p>
              <p className="text-xs text-muted-foreground/70">Crop type breakdown</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
            <div className="text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Metrics Component</p>
              <p className="text-xs text-muted-foreground/70">System status indicators</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
