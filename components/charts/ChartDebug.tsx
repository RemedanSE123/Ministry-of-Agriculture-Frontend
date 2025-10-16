// components/charts/ChartDebug.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ChartDebug({ projectUid }: { projectUid: string }) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/charts/debug/${projectUid}`)
      const result = await response.json()
      setDebugInfo(result)
    } catch (error) {
      console.error('Debug failed:', error)
      setDebugInfo({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const forceDelete = async () => {
    if (!confirm('Are you sure you want to delete ALL charts for this project?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/charts/force-delete/${projectUid}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      setDebugInfo(result)
      alert(`Deleted ${result.deletedCount} charts`)
    } catch (error) {
      console.error('Force delete failed:', error)
      setDebugInfo({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart System Debug</CardTitle>
        <CardDescription>Debug and fix chart generation issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebug} disabled={loading}>
            {loading ? 'Debugging...' : 'Debug Charts'}
          </Button>
          <Button onClick={forceDelete} variant="destructive" disabled={loading}>
            Force Delete All Charts
          </Button>
        </div>
        
        {debugInfo && (
          <div className={`p-4 rounded-lg border ${
            debugInfo.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <pre className="text-sm whitespace-pre-wrap max-h-96 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}