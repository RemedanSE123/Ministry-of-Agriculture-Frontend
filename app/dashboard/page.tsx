import { DashboardOverview } from "../../components/dashboard/dashboard-overview"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardOverview />
    </ProtectedRoute>
  )
}