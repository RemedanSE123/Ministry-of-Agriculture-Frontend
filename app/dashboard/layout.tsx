import type React from "react"
// import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardNavbar } from "../../components/dashboard/dashboard-navbar"
import { DashboardSidebar } from "../../components/dashboard/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
