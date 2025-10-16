"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ChartTest({ projectUid }: { projectUid: string }) {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCharts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/charts/test/${projectUid}`)
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResult({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart System Test</CardTitle>
        <CardDescription>Test the chart generation system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testCharts} disabled={loading}>
          {loading ? 'Testing...' : 'Test Charts API'}
        </Button>
        
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}