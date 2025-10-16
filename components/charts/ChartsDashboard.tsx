"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  AlertCircle,
  CheckCircle2,
  Download
} from 'lucide-react'
import { DynamicChart } from './DynamicChart'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartsDashboardProps {
  projectUid: string
  projectName: string
}

interface ChartConfig {
  id: number
  chart_name: string
  chart_type: string
  config_data: any
  is_enabled: boolean
  is_auto_generated: boolean
  display_order: number
}

interface AnalysisStats {
  total_analyses: number
  successful_analyses: number
  failed_analyses: number
  last_analysis: string
}

export const ChartsDashboard: React.FC<ChartsDashboardProps> = ({
  projectUid,
  projectName
}) => {
  const [charts, setCharts] = useState<ChartConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadCharts()
    loadAnalysisStats()
  }, [projectUid])

  const loadCharts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/charts/project/${projectUid}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load charts: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setCharts(result.charts || [])
        setAnalysisStats(result.analysisStats)
      } else {
        throw new Error(result.error || 'Failed to load charts')
      }
    } catch (err: any) {
      console.error('Error loading charts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysisStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/charts/quality/${projectUid}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Stats are already loaded with charts
        }
      }
    } catch (err) {
      console.error('Error loading analysis stats:', err)
    }
  }

  const analyzeData = async () => {
    try {
      setAnalyzing(true)
      setError(null)
      
      const response = await fetch(`http://localhost:5000/api/charts/analyze/${projectUid}`, {
        method: 'POST'
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccessMessage(`Generated ${result.generatedCharts} charts automatically!`)
        setTimeout(() => setSuccessMessage(null), 5000)
        await loadCharts() // Reload charts
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (err: any) {
      console.error('Error analyzing data:', err)
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleChartToggle = (chartId: number, enabled: boolean) => {
    setCharts(prev => prev.map(chart => 
      chart.id === chartId ? { ...chart, is_enabled: enabled } : chart
    ))
  }

  const handleChartError = (error: string) => {
    setError(error)
    setTimeout(() => setError(null), 5000)
  }

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.chart_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.chart_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || chart.chart_type === filterType
    
    return matchesSearch && matchesType
  })

  const enabledCharts = filteredCharts.filter(chart => chart.is_enabled)
  const disabledCharts = filteredCharts.filter(chart => !chart.is_enabled)

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-4 w-4" />
      case 'pie': return <PieChart className="h-4 w-4" />
      case 'line': return <LineChart className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const exportAllCharts = () => {
    const chartData = charts.map(chart => ({
      name: chart.chart_name,
      type: chart.chart_type,
      enabled: chart.is_enabled,
      auto_generated: chart.is_auto_generated
    }))

    const csvContent = [
      ['Chart Name', 'Type', 'Enabled', 'Auto Generated'],
      ...chartData.map(chart => [chart.name, chart.type, chart.enabled ? 'Yes' : 'No', chart.auto_generated ? 'Yes' : 'No'])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}_charts_export.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Analytics</h2>
          <p className="text-muted-foreground">
            Automatic charts and insights for {projectName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAllCharts}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button onClick={analyzeData} disabled={analyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Generate Charts'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{successMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{charts.length}</div>
            <p className="text-xs text-muted-foreground">
              {enabledCharts.length} enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chart Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(charts.map(c => c.chart_type)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {charts.filter(c => c.is_auto_generated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((charts.filter(c => c.is_auto_generated).length / charts.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analysis Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisStats?.successful_analyses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last: {analysisStats?.last_analysis ? new Date(analysisStats.last_analysis).toLocaleDateString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search charts..."
                  className="pl-8 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="flex h-9 w-[120px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="scatter">Scatter</option>
                <option value="area">Area</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Showing {enabledCharts.length} of {filteredCharts.length} charts
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : enabledCharts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enabledCharts.map((chart) => (
            <DynamicChart
              key={chart.id}
              chartConfig={chart}
              projectUid={projectUid}
              onError={handleChartError}
              onToggle={handleChartToggle}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Charts Available</h3>
              <p className="text-muted-foreground mb-4">
                {charts.length === 0 
                  ? "No charts have been generated yet. Click 'Generate Charts' to start."
                  : "No charts match your current filters."}
              </p>
              <Button onClick={analyzeData} disabled={analyzing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
                Generate Charts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disabled Charts Section */}
      {disabledCharts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Disabled Charts ({disabledCharts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {disabledCharts.map((chart) => (
              <DynamicChart
                key={chart.id}
                chartConfig={chart}
                projectUid={projectUid}
                onError={handleChartError}
                onToggle={handleChartToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}