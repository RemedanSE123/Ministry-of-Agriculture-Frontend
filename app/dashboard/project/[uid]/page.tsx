"use client"

import { useProtectedRoute } from "@/hooks/useProtectedRoute"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Database, ArrowLeft, RefreshCw, Download, CheckSquare, Trash2, Save, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
}

// API utility
const api = {
  async getProject(projectUid: string): Promise<{ success: boolean; project?: ProjectData; error?: string }> {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectUid}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching project:', error)
      return { success: false, error: typeof error === "object" && error !== null && "message" in error ? String((error as { message?: unknown }).message) : String(error) }
    }
  },

  async updateProjectColumns(projectUid: string, selectedColumns: string[]) {
    const response = await fetch(`http://localhost:5000/api/projects/${projectUid}/columns`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_columns: selectedColumns }),
    })
    return await response.json()
  },

  async syncProject(projectUid: string) {
    const response = await fetch(`http://localhost:5000/api/projects/${projectUid}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    return await response.json()
  },

  async deleteProject(projectId: number) {
    const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: 'DELETE',
    })
    return await response.json()
  }
}

export default function ProjectDetailPage() {
  const { user, isLoading } = useProtectedRoute()
  const params = useParams()
  const router = useRouter()
  const projectUid = params.uid as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['columns']))

  useEffect(() => {
    if (projectUid) {
      loadProject()
    }
  }, [projectUid])

  const loadProject = async () => {
    try {
      setLoading(true)
      const response = await api.getProject(projectUid)
      
      if (response.success && response.project) {
        setProject(response.project)
      } else {
        console.error('Failed to load project:', response.error)
        alert(`Failed to load project: ${response.error}`)
      }
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Error loading project data')
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
      } else {
        alert(`Error updating columns: ${response.error}`)
      }
    } catch (error) {
      console.error('Error updating columns:', error)
      alert('Error updating columns')
    }
  }

  const selectAllColumns = async () => {
    if (!project) return

    try {
      const response = await api.updateProjectColumns(projectUid, project.available_columns)
      
      if (response.success) {
        setProject(prev => prev ? { ...prev, selected_columns: project.available_columns } : null)
      } else {
        alert(`Error updating columns: ${response.error}`)
      }
    } catch (error) {
      console.error('Error selecting all columns:', error)
      alert('Error selecting all columns')
    }
  }

  const clearAllColumns = async () => {
    if (!project) return

    try {
      const response = await api.updateProjectColumns(projectUid, [])
      
      if (response.success) {
        setProject(prev => prev ? { ...prev, selected_columns: [] } : null)
      } else {
        alert(`Error updating columns: ${response.error}`)
      }
    } catch (error) {
      console.error('Error clearing columns:', error)
      alert('Error clearing columns')
    }
  }

  const syncProject = async () => {
    if (!project) return

    setSyncing(true)
    try {
      const response = await api.syncProject(projectUid)
      
      if (response.success) {
        await loadProject() // Reload project data
        alert('Project synced successfully!')
      } else {
        alert(`Error syncing project: ${response.error}`)
      }
    } catch (error) {
      console.error('Error syncing project:', error)
      alert('Error syncing project')
    } finally {
      setSyncing(false)
    }
  }

  const deleteProject = async () => {
    if (!project || !confirm(`Are you sure you want to delete "${project.project_name}"?`)) return

    try {
      const response = await api.deleteProject(project.id)
      
      if (response.success) {
        alert('Project deleted successfully!')
        router.push('/dashboard/collected-data')
      } else {
        alert(`Error deleting project: ${response.error}`)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project')
    }
  }

  const exportData = () => {
    if (!project || project.submissions.length === 0) {
      alert('No data to export')
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
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" disabled={project.submissions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
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

        {/* Data Table Section */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Collected Data ({project.submissions.length} submissions)
                </h2>
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
                              className="px-4 py-3 text-sm text-foreground max-w-xs truncate"
                              title={String(submission[column] || '')}
                            >
                              {submission[column] !== undefined && submission[column] !== null
                                ? String(submission[column])
                                : '-'}
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
                    Please select at least one column to display data
                  </p>
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
      </div>
    </div>
  )
}