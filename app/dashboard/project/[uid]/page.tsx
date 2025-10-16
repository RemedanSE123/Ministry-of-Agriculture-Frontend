"use client"

import { useProtectedRoute } from "@/hooks/useProtectedRoute"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Database, ArrowLeft, RefreshCw, Download, CheckSquare, Trash2, Save, ChevronDown, ChevronRight, Clock, Settings, AlertCircle, CheckCircle, X, ImageIcon, BarChart3, Map, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartsDashboard } from '@/components/charts/ChartsDashboard'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectData {
  id: number
  project_uid: string
  project_name: string
  owner_username: string
  date_created: string
  deployment_active: boolean
  total_submissions: number
  available_columns: string[]
  selected_columns: string[]
  data_url: string
  last_sync: string
  token_name: string
  submissions: any[]
  auto_sync_enabled: boolean
  auto_sync_interval?: string
  next_sync_time?: string
}

interface GraphConfig {
  xAxis: string
  yAxes: string[]
  graphType: 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'doughnut' | 'polarArea'
  title: string
}

// API utility
const api = {
  async makeRequest(url: string, options: RequestInit = {}) {
    const API_BASE_URL = 'http://localhost:5000/api';
    const fullUrl = `${API_BASE_URL}${url}`;
    
    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async getProject(projectUid: string) {
    return this.makeRequest(`/projects/${projectUid}`);
  },

  async updateProjectColumns(projectUid: string, selectedColumns: string[]) {
    return this.makeRequest(`/projects/${projectUid}/columns`, {
      method: 'PUT',
      body: JSON.stringify({ selected_columns: selectedColumns }),
    });
  },

  async syncProject(projectUid: string) {
    return this.makeRequest(`/projects/${projectUid}/sync`, {
      method: 'POST',
    });
  },

  async deleteProject(projectId: number) {
    return this.makeRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  async configureAutoSync(projectUid: string, enabled: boolean, interval: string) {
    return this.makeRequest(`/projects/${projectUid}/auto-sync`, {
      method: 'PUT',
      body: JSON.stringify({ enabled, interval }),
    });
  },

  // Image API - using your backend
  async getImage(projectUid: string, submissionId: string, filename: string, token: string) {
    return this.makeRequest(`/kobo/image/${projectUid}/${submissionId}/${filename}?token=${encodeURIComponent(token)}`);
  }
}

// Enhanced Image display component
const ImageDisplay = ({ value, column, submission, projectUid, token }: { 
  value: any, 
  column: string, 
  submission: any, 
  projectUid?: string, 
  token?: string 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const stringValue = String(value || '');
  
  // ENHANCED URL CONSTRUCTION - Better detection for both initial and synced data
  const getImageUrl = () => {
    // First, try to use the pre-processed URLs from backend
    const directUrl = submission[`${column}_attachment_url`];
    const directToken = submission[`${column}_attachment_url_auth`] || token;

    const imageUrl = submission[`${column}_url`];
    const imageToken = submission[`${column}_url_auth`] || token;

    // Use the first available image URL (prefer direct URLs)
    const finalImageUrl = directUrl || imageUrl;
    const finalToken = directToken || imageToken;

    if (finalImageUrl && finalToken) {
      // Extract filename from URL for the proxy endpoint
      const filename = finalImageUrl.split('/').pop() || stringValue;
      return `http://localhost:5000/api/kobo/image/${projectUid}/${submission._id}/${encodeURIComponent(filename)}?token=${encodeURIComponent(finalToken)}`;
    }

    // Fallback: construct URL from filename
    if (stringValue.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) && projectUid && submission._id && token) {
      return `http://localhost:5000/api/kobo/image/${projectUid}/${submission._id}/${encodeURIComponent(stringValue)}?token=${encodeURIComponent(token)}`;
    }

    return null;
  };

  const imageUrl = getImageUrl();

  const handleRetry = () => {
    setImageError(false);
    setImageLoading(true);
    setRetryCount(prev => prev + 1);
  };

  if (imageUrl && !imageError) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <img 
            src={`${imageUrl}&retry=${retryCount}`}
            alt={stringValue}
            className="w-12 h-12 object-cover rounded border hover:scale-110 transition-transform cursor-pointer"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              console.error('Image failed to load:', imageUrl);
              setImageError(true);
              setImageLoading(false);
            }}
            onClick={() => window.open(imageUrl, '_blank')}
          />
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 rounded">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {stringValue}
        </span>
      </div>
    );
  }

  // Fallback - just show image icon with filename
  if (stringValue.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {stringValue}
        </span>
        {imageError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="h-6 w-6 p-0 ml-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Default text display
  return (
    <span className="truncate max-w-[200px]" title={stringValue}>
      {stringValue}
    </span>
  );
};

// User Generated Graph Component
const UserGeneratedGraph = ({ project, projectUid }: { project: ProjectData, projectUid: string }) => {
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    xAxis: '',
    yAxes: [],
    graphType: 'bar',
    title: ''
  });
  const [availableYAxis, setAvailableYAxis] = useState<string[]>([]);
  const [generatedGraph, setGeneratedGraph] = useState<any>(null);

  useEffect(() => {
    if (project) {
      setAvailableYAxis(project.available_columns);
    }
  }, [project]);

  const addYAxis = (column: string) => {
    if (!graphConfig.yAxes.includes(column)) {
      setGraphConfig(prev => ({
        ...prev,
        yAxes: [...prev.yAxes, column]
      }));
    }
  };

  const removeYAxis = (column: string) => {
    setGraphConfig(prev => ({
      ...prev,
      yAxes: prev.yAxes.filter(y => y !== column)
    }));
  };

  const generateGraph = () => {
    if (!graphConfig.xAxis || graphConfig.yAxes.length === 0) {
      alert('Please select X-axis and at least one Y-axis');
      return;
    }

    // Mock graph generation - in real implementation, you would use a charting library
    const mockGraph = {
      type: graphConfig.graphType,
      title: graphConfig.title || `${graphConfig.graphType.toUpperCase()} Chart`,
      data: {
        labels: project.submissions.map(sub => sub[graphConfig.xAxis] || 'N/A').slice(0, 10),
        datasets: graphConfig.yAxes.map((yAxis, index) => ({
          label: yAxis,
          data: project.submissions.map(sub => sub[yAxis] || 0).slice(0, 10),
          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
          borderColor: `hsl(${index * 60}, 70%, 30%)`,
          borderWidth: 2
        }))
      }
    };

    setGeneratedGraph(mockGraph);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Graph</CardTitle>
          <CardDescription>
            Select data columns and configure your graph settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="graph-title">Graph Title</Label>
              <Input
                id="graph-title"
                placeholder="Enter graph title"
                value={graphConfig.title}
                onChange={(e) => setGraphConfig(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graph-type">Graph Type</Label>
              <Select
                value={graphConfig.graphType}
                onValueChange={(value: GraphConfig['graphType']) => 
                  setGraphConfig(prev => ({ ...prev, graphType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                  <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                  <SelectItem value="polarArea">Polar Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="x-axis">X-Axis (Category)</Label>
            <Select
              value={graphConfig.xAxis}
              onValueChange={(value) => setGraphConfig(prev => ({ ...prev, xAxis: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select X-axis column" />
              </SelectTrigger>
              <SelectContent>
                {availableYAxis.map(column => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Y-Axis (Values)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available Columns</Label>
                <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                  {availableYAxis
                    .filter(col => col !== graphConfig.xAxis && !graphConfig.yAxes.includes(col))
                    .map(column => (
                      <div
                        key={column}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => addYAxis(column)}
                      >
                        <span className="text-sm">{column}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Y-Axis ({graphConfig.yAxes.length})</Label>
                <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                  {graphConfig.yAxes.map(column => (
                    <div
                      key={column}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded"
                    >
                      <span className="text-sm">{column}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => removeYAxis(column)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button onClick={generateGraph} className="w-full">
            Generate Graph
          </Button>
        </CardContent>
      </Card>

      {generatedGraph && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedGraph.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-6 text-center border">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">{generatedGraph.title}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Type: {generatedGraph.type.toUpperCase()} | 
                X-Axis: {graphConfig.xAxis} | 
                Y-Axes: {graphConfig.yAxes.join(', ')}
              </p>
              <div className="bg-white p-4 rounded border">
                <p className="text-xs text-muted-foreground">
                  [Graph visualization would be rendered here using Chart.js or similar library]
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Data points: {generatedGraph.data.labels.length} labels × {generatedGraph.data.datasets.length} datasets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Map Visualization Component
const MapVisualization = ({ project }: { project: ProjectData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Visualization</CardTitle>
        <CardDescription>
          Geographic data visualization (requires location data in submissions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/20 rounded-lg p-12 text-center border">
          <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map View</h3>
          <p className="text-muted-foreground mb-4">
            Interactive map visualization would be displayed here
          </p>
          <div className="bg-white p-4 rounded border inline-block">
            <p className="text-sm">[Map Container]</p>
            <p className="text-xs text-muted-foreground mt-2">
              Latitude/Longitude data points: {project.submissions.filter(sub => sub._geolocation).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Admin Map Component
const AdminMap = ({ project }: { project: ProjectData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Map View</CardTitle>
        <CardDescription>
          Administrative boundaries and management view
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/20 rounded-lg p-12 text-center border">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin Map</h3>
          <p className="text-muted-foreground mb-4">
            Administrative boundaries and management overlay
          </p>
          <div className="bg-white p-4 rounded border inline-block">
            <p className="text-sm">[Admin Map Container]</p>
            <p className="text-xs text-muted-foreground mt-2">
              Administrative layers and management tools
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Plus icon component
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function ProjectDetailPage() {
  const { user, isLoading } = useProtectedRoute()
  const params = useParams()
  const router = useRouter()
  const projectUid = params.uid as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['data']))
  const [autoSyncConfig, setAutoSyncConfig] = useState<{enabled: boolean, interval: string}>({enabled: false, interval: '01:00:00'})
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (projectUid) {
      loadProject()
    }
  }, [projectUid])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const loadProject = async () => {
    try {
      setLoading(true)
      const response = await api.getProject(projectUid)
      
      if (response.success && response.project) {
        setProject(response.project)
        setAutoSyncConfig({
          enabled: response.project.auto_sync_enabled || false,
          interval: response.project.auto_sync_interval || '01:00:00'
        })
      } else {
        console.error('Failed to load project:', response.error)
        showNotification('error', `Failed to load project: ${response.error}`)
      }
    } catch (error) {
      console.error('Error loading project:', error)
      showNotification('error', 'Error loading project data')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  const toggleColumn = async (column: string) => {
    if (!project) return

    const newSelectedColumns = project.selected_columns.includes(column)
      ? project.selected_columns.filter(col => col !== column)
      : [...project.selected_columns, column]

    try {
      const response = await api.updateProjectColumns(projectUid, newSelectedColumns)
      
      if (response.success) {
        setProject(prev => prev ? { ...prev, selected_columns: newSelectedColumns } : null)
        showNotification('success', 'Columns updated successfully')
      } else {
        showNotification('error', `Error updating columns: ${response.error}`)
      }
    } catch (error) {
      console.error('Error updating columns:', error)
      showNotification('error', 'Error updating columns')
    }
  }

  const selectAllColumns = async () => {
    if (!project) return

    try {
      const response = await api.updateProjectColumns(projectUid, project.available_columns)
      
      if (response.success) {
        setProject(prev => prev ? { ...prev, selected_columns: project.available_columns } : null)
        showNotification('success', 'All columns selected')
      } else {
        showNotification('error', `Error updating columns: ${response.error}`)
      }
    } catch (error) {
      console.error('Error selecting all columns:', error)
      showNotification('error', 'Error selecting all columns')
    }
  }

  const clearAllColumns = async () => {
    if (!project) return

    try {
      const response = await api.updateProjectColumns(projectUid, [])
      
      if (response.success) {
        setProject(prev => prev ? { ...prev, selected_columns: [] } : null)
        showNotification('success', 'All columns cleared')
      } else {
        showNotification('error', `Error updating columns: ${response.error}`)
      }
    } catch (error) {
      console.error('Error clearing columns:', error)
      showNotification('error', 'Error clearing columns')
    }
  }

  const syncProject = async () => {
    if (!project) return

    setSyncing(true)
    try {
      const response = await api.syncProject(projectUid)
      
      if (response.success) {
        await loadProject() // Reload project data
        showNotification('success', 'Project synced successfully!')
      } else {
        showNotification('error', `Error syncing project: ${response.error}`)
      }
    } catch (error) {
      console.error('Error syncing project:', error)
      showNotification('error', 'Error syncing project')
    } finally {
      setSyncing(false)
    }
  }

  const configureAutoSync = async (enabled: boolean, interval: string) => {
    try {
      const response = await api.configureAutoSync(projectUid, enabled, interval)
      
      if (response.success) {
        setAutoSyncConfig({ enabled, interval })
        await loadProject() // Reload to get updated sync times
        showNotification('success', response.message)
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error configuring auto-sync:', error)
      showNotification('error', `Failed to configure auto-sync: ${error.message}`)
    }
  }

  const deleteProject = async () => {
    if (!project || !confirm(`Are you sure you want to delete "${project.project_name}"?`)) return

    try {
      const response = await api.deleteProject(project.id)
      
      if (response.success) {
        showNotification('success', 'Project deleted successfully!')
        router.push('/dashboard/collected-data')
      } else {
        showNotification('error', `Error deleting project: ${response.error}`)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      showNotification('error', 'Error deleting project')
    }
  }

  const exportData = () => {
    if (!project || project.submissions.length === 0) {
      showNotification('error', 'No data to export')
      return
    }

    // Simple CSV export
    const headers = project.selected_columns.length > 0 ? project.selected_columns : project.available_columns
    const csvContent = [
      headers.join(','),
      ...project.submissions.map(submission => 
        headers.map(header => {
          const value = submission[header]
          return value !== undefined && value !== null ? `"${String(value).replace(/"/g, '""')}"` : ''
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.project_name}_data.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showNotification('success', 'Data exported successfully')
  }

  const formatTimeUntilSync = (nextSyncTime: string): string => {
    const now = new Date()
    const nextSync = new Date(nextSyncTime)
    const diffMs = nextSync.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Now'
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading project...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/dashboard/collected-data')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Notification */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-md",
          notification.type === 'success' 
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        )}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
            <span className="flex-1">{notification.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotification(null)}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/collected-data')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{project.project_name}</h1>
                <p className="text-muted-foreground">
                  Token: {project.token_name} • {project.total_submissions} submissions • 
                  Last sync: {project.last_sync ? new Date(project.last_sync).toLocaleString() : 'Never'}
                  {project.auto_sync_enabled && project.next_sync_time && (
                    <span className="ml-2 text-blue-600">
                      • Next sync in: {formatTimeUntilSync(project.next_sync_time)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" disabled={project.submissions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            {/* Auto-Sync Configuration Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Auto-Sync
                  {project.auto_sync_enabled && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure Auto-Sync</DialogTitle>
                  <DialogDescription>
                    Set up automatic synchronization for "{project.project_name}"
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sync-enabled">Enable Auto-Sync</Label>
                    <Switch
                      id="auto-sync-enabled"
                      checked={autoSyncConfig.enabled}
                      onCheckedChange={(enabled) => 
                        configureAutoSync(enabled, autoSyncConfig.interval)
                      }
                    />
                  </div>
                  {autoSyncConfig.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="sync-interval">Sync Interval</Label>
                      <Select
                        value={autoSyncConfig.interval}
                        onValueChange={(interval) => 
                          configureAutoSync(true, interval)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00:30:00">Every 30 minutes</SelectItem>
                          <SelectItem value="01:00:00">Every hour</SelectItem>
                          <SelectItem value="02:00:00">Every 2 hours</SelectItem>
                          <SelectItem value="06:00:00">Every 6 hours</SelectItem>
                          <SelectItem value="12:00:00">Every 12 hours</SelectItem>
                          <SelectItem value="24:00:00">Every 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Next sync: {project.next_sync_time ? 
                          new Date(project.next_sync_time).toLocaleString() : 
                          'Not scheduled'
                        }
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => configureAutoSync(false, '00:00:00')}
                    disabled={!project.auto_sync_enabled}
                  >
                    Disable Auto-Sync
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={syncProject} disabled={syncing}>
              <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync"}
            </Button>
            <Button onClick={deleteProject} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{project.total_submissions}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Submissions</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{project.available_columns.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Available Columns</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{project.selected_columns.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Selected Columns</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <Badge variant={project.deployment_active ? "default" : "secondary"} className="text-lg">
              {project.deployment_active ? "Active" : "Inactive"}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Status</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin View
            </TabsTrigger>
            <TabsTrigger value="graphs" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              User Graphs
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="admin-map" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin Map
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Only shows selected columns data */}
          <TabsContent value="overview" className="space-y-6">
            {/* Data Table Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">
                      Collected Data ({project.submissions.length} submissions)
                    </h2>
                    <Badge variant="secondary">
                      {project.selected_columns.length} columns selected
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('data')}
                  >
                    {expandedSections.has('data') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedSections.has('data') && (
                <div className="p-6">
                  {project.submissions.length > 0 && project.selected_columns.length > 0 ? (
                    <div className="overflow-x-auto border border-border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            {project.selected_columns.map((column) => (
                              <th
                                key={column}
                                className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border whitespace-nowrap"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {project.submissions.map((submission, index) => (
                            <tr
                              key={submission._id || index}
                              className="hover:bg-muted/20 transition-colors"
                            >
                              {project.selected_columns.map((column) => (
                                <td
                                  key={column}
                                  className="px-4 py-3 text-sm text-foreground"
                                >
                                  <ImageDisplay 
                                    value={submission[column]} 
                                    column={column} 
                                    submission={submission}
                                    projectUid={project.project_uid}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : project.selected_columns.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                      <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-semibold">No columns selected</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Please go to Admin View to select columns for display
                      </p>
                      <Button 
                        onClick={() => setActiveTab("admin")} 
                        className="mt-4"
                      >
                        Go to Admin View
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-semibold">No submissions collected</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Data will appear here once submissions are received and synced
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Admin View Tab - Column selection and management */}
          <TabsContent value="admin" className="space-y-6">
            {/* Column Selection Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Column Selection</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('columns')}
                  >
                    {expandedSections.has('columns') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedSections.has('columns') && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-foreground">Select columns to display in data table</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.selected_columns.length} of {project.available_columns.length} columns selected
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={selectAllColumns} variant="outline" size="sm">
                        Select All
                      </Button>
                      <Button onClick={clearAllColumns} variant="outline" size="sm">
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-4 border border-border rounded-lg">
                    {project.available_columns.map((column) => (
                      <label
                        key={column}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group border border-border"
                      >
                        <input
                          type="checkbox"
                          checked={project.selected_columns.includes(column)}
                          onChange={() => toggleColumn(column)}
                          className="w-4 h-4 text-primary rounded border-input focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-sm text-foreground flex-1 font-medium" title={column}>
                          {column}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {column.split('/').length > 1 ? 'Grouped' : 'Basic'}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Settings */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Project Management</h3>
              <div className="flex gap-2">
                <Button onClick={syncProject} disabled={syncing}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
                <Button onClick={deleteProject} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* User Generated Graphs Tab */}
          <TabsContent value="graphs" className="space-y-4">
            <UserGeneratedGraph project={project} projectUid={projectUid} />
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <MapVisualization project={project} />
          </TabsContent>

          {/* Admin Map Tab */}
          <TabsContent value="admin-map" className="space-y-4">
            <AdminMap project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}