"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div className="animate-fadeInUp">
        <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-lg text-muted-foreground">Approve and manage user access to the portal</p>
      </div>

      <Card className="animate-fadeInUp delay-100">
        <CardHeader>
          <CardTitle className="text-2xl">Pending Approvals</CardTitle>
          <CardDescription>Review and approve new user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User approval system coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
