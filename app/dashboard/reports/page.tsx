"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="animate-fadeInUp">
        <h1 className="text-4xl font-bold text-foreground mb-2">Reports & Analytics</h1>
        <p className="text-lg text-muted-foreground">View agricultural data insights and reports</p>
      </div>

      <Card className="animate-fadeInUp delay-100">
        <CardHeader>
          <CardTitle className="text-2xl">Data Analytics</CardTitle>
          <CardDescription>Comprehensive agricultural data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
