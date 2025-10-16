"use client"

import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Download, Eye, EyeOff, Settings } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartData {
  labels?: string[]
  datasets: Array<{
    label: string
    data: number[] | Array<{ x: number; y: number }>
    backgroundColor?: string | string[]
    borderColor?: string
    fill?: boolean
  }>
  rawData?: any[]
  metadata?: {
    chartType: string
    dataSource: string
    totalDataPoints: number
    generatedAt: string
  }
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

interface DynamicChartProps {
  chartConfig: ChartConfig
  projectUid: string
  onError?: (error: string) => void
  onToggle?: (chartId: number, enabled: boolean) => void
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#8DD1E1', '#D084D0', '#FF7C7C'
]

export const DynamicChart: React.FC<DynamicChartProps> = ({
  chartConfig,
  projectUid,
  onError,
  onToggle
}) => {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(chartConfig.is_enabled)

  useEffect(() => {
    if (isEnabled) {
      fetchChartData()
    }
  }, [chartConfig.id, isEnabled])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:5000/api/charts/data/${chartConfig.id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setChartData(result.chartData)
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }
    } catch (err: any) {
      console.error('Error fetching chart data:', err)
      setError(err.message)
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  const transformDataForRecharts = (): any[] => {
    if (!chartData) return []

    const { chart_type } = chartConfig

    switch (chart_type) {
      case 'bar':
      case 'horizontalBar':
      case 'line':
      case 'area':
        if (chartData.labels && chartData.datasets.length > 0) {
          return chartData.labels.map((label, index) => {
            const dataPoint: any = { name: label }
            chartData.datasets.forEach(dataset => {
              dataPoint[dataset.label] = Array.isArray(dataset.data) ? dataset.data[index] : 0
            })
            return dataPoint
          })
        }
        break

      case 'pie':
      case 'doughnut':
        if (chartData.labels && chartData.datasets.length > 0) {
          return chartData.labels.map((label, index) => ({
            name: label,
            value: chartData.datasets[0].data[index] || 0
          }))
        }
        break

      case 'scatter':
        if (chartData.datasets.length > 0) {
          return chartData.datasets[0].data as Array<{ x: number; y: number }>
        }
        break

      default:
        return chartData.rawData || []
    }

    return []
  }

  const renderChart = () => {
    if (!chartData) return null

    const transformedData = transformDataForRecharts()
    const { chart_type } = chartConfig

    switch (chart_type) {
      case 'bar':
        return (
          <BarChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={COLORS[index % COLORS.length]}
                name={dataset.label}
              />
            ))}
          </BarChart>
        )

      case 'horizontalBar':
        return (
          <BarChart data={transformedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            {chartData.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={COLORS[index % COLORS.length]}
                name={dataset.label}
              />
            ))}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData.datasets.map((dataset, index) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={COLORS[index % COLORS.length]}
                name={dataset.label}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData.datasets.map((dataset, index) => (
              <Area
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.3}
                name={dataset.label}
              />
            ))}
          </AreaChart>
        )

      case 'pie':
      case 'doughnut':
        return (
          <PieChart>
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={chart_type === 'pie' ? 80 : 60}
              fill="#8884d8"
              dataKey="value"
            >
              {transformedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )

      case 'scatter':
        return (
          <ScatterChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" name="X" />
            <YAxis dataKey="y" type="number" name="Y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Data" data={transformedData} fill="#8884d8" />
          </ScatterChart>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unsupported chart type: {chart_type}</p>
          </div>
        )
    }
  }

  const handleToggle = async () => {
    const newEnabledState = !isEnabled
    setIsEnabled(newEnabledState)
    
    try {
      const response = await fetch(`http://localhost:5000/api/charts/toggle/${chartConfig.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEnabled: newEnabledState })
      })

      if (!response.ok) {
        throw new Error('Failed to update chart state')
      }

      onToggle?.(chartConfig.id, newEnabledState)
    } catch (err: any) {
      console.error('Error toggling chart:', err)
      setIsEnabled(!newEnabledState) // Revert on error
      onError?.(err.message)
    }
  }

  const exportChartData = () => {
    if (!chartData) return

    const csvContent = [
      ['Chart', 'Data'],
      [chartConfig.chart_name, ''],
      ...(chartData.rawData?.map(item => [JSON.stringify(item)]) || [])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chartConfig.chart_name.replace(/[^a-zA-Z0-9]/g, '_')}_data.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isEnabled) {
    return (
      <Card className="opacity-60 hover:opacity-80 transition-opacity">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              {chartConfig.chart_name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleToggle}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Chart is disabled. Click the eye icon to enable.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">
              {chartConfig.chart_name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {chartConfig.chart_type}
            </Badge>
            {chartConfig.is_auto_generated && (
              <Badge variant="outline" className="text-xs">
                Auto
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportChartData}
              disabled={!chartData}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchChartData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {chartData?.metadata?.totalDataPoints || 0} data points
          {chartData?.metadata?.generatedAt && ` • Generated ${new Date(chartData.metadata.generatedAt).toLocaleTimeString()}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Failed to load chart</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchChartData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : chartData ? (
       <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            {renderChart() ?? <></>}
        </ResponsiveContainer>
        </div>

        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No chart data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}