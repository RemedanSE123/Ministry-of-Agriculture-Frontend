"use client"

import type React from "react"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"
import { useState, useEffect } from "react"
import { Database, Plus, RefreshCw, Trash2, ChevronDown, ChevronRight, Key, CheckSquare, Download, Save, ChevronUp, ChevronLeft, Clock, Settings, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// API utility with better error handling
const api = {
  async makeRequest(url: string, options: RequestInit = {}) {
    const API_BASE_URL = 'http://localhost:5000/api';
    const fullUrl = `${API_BASE_URL}${url}`;
    
    console.log('Making request to:', fullUrl);
    
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
        console.error('Server returned HTML instead of JSON:', text.substring(0, 500));
        throw new Error(`Server error: ${response.status} ${response.statusText}. Please check if the backend is running.`);
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

  // Token APIs
  async addToken(tokenData: any) {
    return this.makeRequest('/tokens', {
      method: 'POST',
      body: JSON.stringify(tokenData),
    });
  },

  async getTokens() {
    return this.makeRequest('/tokens');
  },

  async deleteToken(tokenId: string) {
    return this.makeRequest(`/tokens/${tokenId}`, {
      method: 'DELETE',
    });
  },

  // Project APIs
  async saveProject(projectData: any) {
    return this.makeRequest('/projects/save', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async getUserProjects() {
    return this.makeRequest('/projects/user');
  },

  async getProjectsByToken(tokenId: string) {
    return this.makeRequest(`/projects/token/${tokenId}`);
  },

  async deleteProject(projectId: number) {
    return this.makeRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
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

  async configureAutoSync(projectUid: string, enabled: boolean, interval: string) {
    return this.makeRequest(`/projects/${projectUid}/auto-sync`, {
      method: 'PUT',
      body: JSON.stringify({ enabled, interval }),
    });
  },

  async getAutoSyncStatus() {
    return this.makeRequest('/projects/auto-sync/status');
  },

  // Kobo API
  async fetchKoboProjects(tokenData: any) {
    return this.makeRequest('/kobo/projects', {
      method: 'POST',
      body: JSON.stringify(tokenData),
    });
  }
};

interface Project {
  uid: string
  name: string
  owner__username: string
  date_created: string
  deployment__active: boolean
  submissions: any[]
  total_submissions: number
  available_columns: string[]
  selected_columns: string[]
  data_url: string
  error?: string
  saved?: boolean
  auto_sync_enabled?: boolean
  auto_sync_interval?: string
  next_sync_time?: string
}

interface TokenData {
  id: string
  name: string
  token: string
  token_preview: string
  created_at: string
  projects: Project[]
  totalProjects: number
  totalSubmissions: number
  timestamp: string
  loading?: boolean
  error?: string
}

interface SavedToken {
  id: number
  name: string
  token_preview: string
  created_at: string
}

interface SavedProject {
  id: number
  token_id: number
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
  auto_sync_enabled: boolean
  auto_sync_interval?: string
  next_sync_time?: string
}

interface SyncStatus {
  [key: string]: {
    loading: boolean
    success?: boolean
    error?: string
  }
}

export default function CollectedDataPage() {
  const { user, isLoading } = useProtectedRoute()
  const [newToken, setNewToken] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [savedTokens, setSavedTokens] = useState<SavedToken[]>([])
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [showSavedProjects, setShowSavedProjects] = useState(true)
  const [showFetchedProjects, setShowFetchedProjects] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({})
  const [autoSyncConfig, setAutoSyncConfig] = useState<Record<string, {enabled: boolean, interval: string}>>({})
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Load saved tokens and projects on component mount
  useEffect(() => {
    loadSavedData()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const loadSavedData = async () => {
    try {
      const [tokensResponse, projectsResponse] = await Promise.all([
        api.getTokens(),
        api.getUserProjects()
      ])

      if (tokensResponse.success) {
        setSavedTokens(tokensResponse.tokens)
      }

      if (projectsResponse.success) {
        setSavedProjects(projectsResponse.projects)
        
        // Initialize auto-sync config
        const config: Record<string, {enabled: boolean, interval: string}> = {}
        projectsResponse.projects.forEach((project: SavedProject) => {
          config[project.project_uid] = {
            enabled: project.auto_sync_enabled || false,
            interval: project.auto_sync_interval || '01:00:00'
          }
        })
        setAutoSyncConfig(config)
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
      showNotification('error', 'Failed to load saved data')
    }
  }

  const refreshSidebar = () => {
    window.dispatchEvent(new CustomEvent('refreshSidebar'));
  };

  const toggleProjectExpansion = (projectUid: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectUid)) {
      newExpanded.delete(projectUid)
    } else {
      newExpanded.add(projectUid)
    }
    setExpandedProjects(newExpanded)
  }

  const toggleColumn = async (projectUid: string, column: string, tokenId?: string) => {
    if (tokenId) {
      // Update in local state for fetched projects
      setTokens(prev =>
        prev.map(token => ({
          ...token,
          projects: token.projects.map(project =>
            project.uid === projectUid
              ? {
                  ...project,
                  selected_columns: project.selected_columns.includes(column)
                    ? project.selected_columns.filter(col => col !== column)
                    : [...project.selected_columns, column],
                }
              : project
          ),
        }))
      )
    } else {
      // Update in database for saved projects
      try {
        const project = savedProjects.find(p => p.project_uid === projectUid)
        if (project) {
          const newSelectedColumns = project.selected_columns.includes(column)
            ? project.selected_columns.filter(col => col !== column)
            : [...project.selected_columns, column]

          await api.updateProjectColumns(projectUid, newSelectedColumns)
          
          // Update local state
          setSavedProjects(prev =>
            prev.map(p =>
              p.project_uid === projectUid
                ? { ...p, selected_columns: newSelectedColumns }
                : p
            )
          )
          showNotification('success', 'Columns updated successfully')
        }
      } catch (error) {
        console.error('Error updating columns:', error)
        showNotification('error', 'Failed to update columns')
      }
    }
  }

  const selectAllColumns = async (projectUid: string, availableColumns: string[], tokenId?: string) => {
    if (tokenId) {
      setTokens(prev =>
        prev.map(token => ({
          ...token,
          projects: token.projects.map(project =>
            project.uid === projectUid ? { ...project, selected_columns: [...availableColumns] } : project
          ),
        }))
      )
    } else {
      try {
        await api.updateProjectColumns(projectUid, availableColumns)
        setSavedProjects(prev =>
          prev.map(p =>
            p.project_uid === projectUid
              ? { ...p, selected_columns: availableColumns }
              : p
          )
        )
        showNotification('success', 'All columns selected')
      } catch (error) {
        console.error('Error selecting all columns:', error)
        showNotification('error', 'Failed to select all columns')
      }
    }
  }

  const clearAllColumns = async (projectUid: string, tokenId?: string) => {
    if (tokenId) {
      setTokens(prev =>
        prev.map(token => ({
          ...token,
          projects: token.projects.map(project =>
            project.uid === projectUid ? { ...project, selected_columns: [] } : project
          ),
        }))
      )
    } else {
      try {
        await api.updateProjectColumns(projectUid, [])
        setSavedProjects(prev =>
          prev.map(p =>
            p.project_uid === projectUid
              ? { ...p, selected_columns: [] }
              : p
          )
        )
        showNotification('success', 'All columns cleared')
      } catch (error) {
        console.error('Error clearing columns:', error)
        showNotification('error', 'Failed to clear columns')
      }
    }
  }

  const syncProject = async (projectUid: string, projectName: string) => {
    setSyncStatus(prev => ({
      ...prev,
      [projectUid]: { loading: true }
    }))

    try {
      const response = await api.syncProject(projectUid)
      
      if (response.success) {
        setSyncStatus(prev => ({
          ...prev,
          [projectUid]: { loading: false, success: true }
        }))
        
        // Reload saved projects to get updated data
        await loadSavedData()
        refreshSidebar()
        
        showNotification('success', `"${projectName}" synced successfully! ${response.total_submissions} submissions loaded.`)
        
        // Clear success status after 3 seconds
        setTimeout(() => {
          setSyncStatus(prev => ({
            ...prev,
            [projectUid]: { loading: false, success: false }
          }))
        }, 3000)
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error syncing project:', error)
      setSyncStatus(prev => ({
        ...prev,
        [projectUid]: { loading: false, error: error.message }
      }))
      showNotification('error', `Failed to sync "${projectName}": ${error.message}`)
    }
  }

  const configureAutoSync = async (projectUid: string, enabled: boolean, interval: string) => {
    try {
      const response = await api.configureAutoSync(projectUid, enabled, interval)
      
      if (response.success) {
        setAutoSyncConfig(prev => ({
          ...prev,
          [projectUid]: { enabled, interval }
        }))
        
        // Update local state
        setSavedProjects(prev =>
          prev.map(p =>
            p.project_uid === projectUid
              ? { 
                  ...p, 
                  auto_sync_enabled: enabled,
                  auto_sync_interval: interval,
                  next_sync_time: enabled ? new Date(Date.now() + getIntervalMs(interval)).toISOString() : undefined
                }
              : p
          )
        )
        
        showNotification('success', response.message)
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error configuring auto-sync:', error)
      showNotification('error', `Failed to configure auto-sync: ${error.message}`)
    }
  }

  const getIntervalMs = (interval: string): number => {
    const [hours, minutes, seconds] = interval.split(':').map(Number)
    return (hours * 3600 + minutes * 60 + seconds) * 1000
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

  const addProjectToDashboard = async (project: Project, tokenId: string) => {
    try {
      // Ensure columns are properly formatted arrays
      const safeAvailableColumns = Array.isArray(project.available_columns) 
        ? project.available_columns 
        : [];

      const safeSelectedColumns = Array.isArray(project.selected_columns) 
        ? project.selected_columns 
        : safeAvailableColumns;

      const projectData = {
        token_id: parseInt(tokenId),
        uid: project.uid,
        name: project.name,
        owner__username: project.owner__username,
        date_created: project.date_created,
        deployment__active: project.deployment__active,
        submissions: project.submissions || [],
        available_columns: safeAvailableColumns,
        selected_columns: safeSelectedColumns,
        data_url: project.data_url
      }

      console.log('Saving project to database:', {
        name: project.name,
        available_columns: safeAvailableColumns.length,
        selected_columns: safeSelectedColumns.length
      });

      const response = await api.saveProject(projectData)

      if (response.success) {
        // Update local state to mark project as saved
        setTokens(prev =>
          prev.map(token =>
            token.id === tokenId
              ? {
                  ...token,
                  projects: token.projects.map(p =>
                    p.uid === project.uid ? { ...p, saved: true } : p
                  ),
                }
              : token
          )
        )

        // Reload saved projects and refresh sidebar
        await loadSavedData()
        refreshSidebar()
        
        showNotification('success', `Project "${project.name}" saved to dashboard!`)
      } else {
        showNotification('error', `Error: ${response.error}`)
      }
    } catch (error: any) {
      console.error('Error saving project:', error)
      showNotification('error', `Error saving project: ${error.message}`)
    }
  }

  const addToken = async () => {
    if (!newToken.trim()) {
      showNotification('error', "Please enter an API token")
      return
    }

    setLoading(true)

    try {
      // Fetch projects from Kobo
      const response = await api.fetchKoboProjects({
        token: newToken.trim(),
        tokenName: tokenName || `Token ${tokens.length + 1}`
      })

      if (response.success) {
        // Check if this is a duplicate token message
        if (response.message && response.message.includes('already registered')) {
          showNotification('success', response.message)
        } else {
          showNotification('success', response.message || 'Token added successfully')
        }

        // Add to tokens state (fetched projects)
        const newTokenData: TokenData = {
          id: response.tokenId.toString(),
          name: response.tokenName,
          token: newToken.trim(),
          token_preview: response.tokenPreview,
          created_at: new Date().toISOString(),
          projects: response.projects,
          totalProjects: response.totalProjects,
          totalSubmissions: response.totalSubmissions,
          timestamp: response.timestamp
        }

        setTokens(prev => [...prev, newTokenData])
        
        // Reload saved tokens
        await loadSavedData()
        
        setNewToken("")
        setTokenName("")
      } else {
        showNotification('error', `Error: ${response.error}`)
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      showNotification('error', `Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const removeToken = async (tokenId: string) => {
    try {
      const response = await api.deleteToken(tokenId)
      if (response.success) {
        setTokens(prev => prev.filter(t => t.id !== tokenId))
        await loadSavedData()
        showNotification('success', 'Token removed successfully')
      } else {
        showNotification('error', `Error: ${response.error}`)
      }
    } catch (error: any) {
      console.error('Error deleting token:', error)
      showNotification('error', `Error: ${error.message}`)
    }
  }

  const deleteSavedProject = async (projectId: number, projectName: string) => {
    try {
      const response = await api.deleteProject(projectId)
      if (response.success) {
        setSavedProjects(prev => prev.filter(p => p.id !== projectId))
        refreshSidebar()
        showNotification('success', `Project "${projectName}" deleted successfully`)
      } else {
        showNotification('error', `Error: ${response.error}`)
      }
    } catch (error: any) {
      console.error('Error deleting project:', error)
      showNotification('error', `Error: ${error.message}`)
    }
  }

  const refreshToken = async (tokenId: string, token: string) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, loading: true } : t))

    try {
      const response = await api.fetchKoboProjects({
        token: token,
        tokenName: `Token ${tokenId}`
      })

      if (response.success) {
        setTokens(prev =>
          prev.map(t =>
            t.id === tokenId
              ? {
                  ...t,
                  projects: response.projects,
                  totalProjects: response.totalProjects,
                  totalSubmissions: response.totalSubmissions,
                  timestamp: response.timestamp,
                  loading: false,
                  error: undefined,
                }
              : t
          )
        )
        showNotification('success', 'Token refreshed successfully')
      } else {
        setTokens(prev =>
          prev.map(t =>
            t.id === tokenId
              ? {
                  ...t,
                  loading: false,
                  error: response.error,
                }
              : t
          )
        )
        showNotification('error', `Error: ${response.error}`)
      }
    } catch (err: any) {
      console.error('Refresh error:', err)
      setTokens(prev =>
        prev.map(t =>
          t.id === tokenId
            ? {
                ...t,
                loading: false,
                error: err.message,
              }
            : t
        )
      )
      showNotification('error', `Error: ${err.message}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addToken()
    }
  }

  const totalFetchedProjects = tokens.reduce((sum, token) => sum + token.totalProjects, 0)
  const totalFetchedSubmissions = tokens.reduce((sum, token) => sum + token.totalSubmissions, 0)
  const totalSavedProjects = savedProjects.length
  const totalSavedSubmissions = savedProjects.reduce((sum, project) => sum + project.total_submissions, 0)

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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Notification */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-md",
          notification.type === 'success' 
            ? "bg-green-50 border-green-200 text-green-800"
            : notification.type === 'error'
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
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

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Kobo Data Collection</h1>
              <p className="text-muted-foreground">Manage and view data collected from Kobo Toolbox forms</p>
            </div>
          </div>
        </div>

        {/* Add Token Form */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">Add Kobo API Token</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="token-name" className="block text-sm font-medium text-muted-foreground mb-2">
                Token Name (optional)
              </Label>
              <Input
                id="token-name"
                type="text"
                placeholder="My Organization"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="api-token" className="block text-sm font-medium text-muted-foreground mb-2">
                API Token *
              </Label>
              <Input
                id="api-token"
                type="password"
                placeholder="Paste your Kobo API token here"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <Button onClick={addToken} disabled={loading || !newToken.trim()} className="px-6 h-[42px]">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Token
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {(tokens.length > 0 || savedProjects.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{savedTokens.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Saved Tokens</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{totalSavedProjects}</div>
              <div className="text-sm text-muted-foreground mt-1">Saved Projects</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{totalFetchedProjects}</div>
              <div className="text-sm text-muted-foreground mt-1">Fetched Projects</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{totalSavedSubmissions + totalFetchedSubmissions}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Submissions</div>
            </div>
          </div>
        )}

        {/* Saved Projects Section */}
        {savedProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Saved Projects</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedProjects(!showSavedProjects)}
                className="flex items-center gap-2"
              >
                {showSavedProjects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showSavedProjects ? "Hide" : "Show"} Saved Projects ({savedProjects.length})
              </Button>
            </div>
            
            {showSavedProjects && (
              <div className="space-y-4">
                {savedProjects.map((project) => {
                  const projectSyncStatus = syncStatus[project.project_uid]
                  const isSyncing = projectSyncStatus?.loading
                  const syncSuccess = projectSyncStatus?.success
                  
                  return (
                    <div key={project.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="bg-muted/50 px-6 py-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={project.deployment_active ? "default" : "secondary"}>
                              {project.deployment_active ? "Active" : "Inactive"}
                            </Badge>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{project.project_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Token: {project.token_name} • Submissions: {project.total_submissions} • 
                                Last Sync: {project.last_sync ? new Date(project.last_sync).toLocaleString() : 'Never'}
                                {project.auto_sync_enabled && project.next_sync_time && (
                                  <span className="ml-2 text-blue-600">
                                    • Next sync in: {formatTimeUntilSync(project.next_sync_time)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => syncProject(project.project_uid, project.project_name)}
                              disabled={isSyncing}
                              variant={syncSuccess ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                syncSuccess && "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              {isSyncing ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : syncSuccess ? (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                              )}
                              {isSyncing ? "Syncing..." : syncSuccess ? "Synced!" : "Sync"}
                            </Button>

                            {/* Auto-Sync Configuration Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
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
                                      checked={autoSyncConfig[project.project_uid]?.enabled || false}
                                      onCheckedChange={(enabled) => 
                                        configureAutoSync(
                                          project.project_uid, 
                                          enabled, 
                                          autoSyncConfig[project.project_uid]?.interval || '01:00:00'
                                        )
                                      }
                                    />
                                  </div>
                                  {autoSyncConfig[project.project_uid]?.enabled && (
                                    <div className="space-y-2">
                                      <Label htmlFor="sync-interval">Sync Interval</Label>
                                      <Select
                                        value={autoSyncConfig[project.project_uid]?.interval || '01:00:00'}
                                        onValueChange={(interval) => 
                                          configureAutoSync(project.project_uid, true, interval)
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
                                    onClick={() => configureAutoSync(project.project_uid, false, '00:00:00')}
                                    disabled={!project.auto_sync_enabled}
                                  >
                                    Disable Auto-Sync
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              onClick={() => toggleProjectExpansion(project.project_uid)}
                              variant="outline"
                              size="sm"
                            >
                              {expandedProjects.has(project.project_uid) ? (
                                <ChevronDown className="mr-2 h-4 w-4" />
                              ) : (
                                <ChevronRight className="mr-2 h-4 w-4" />
                              )}
                              {expandedProjects.has(project.project_uid) ? "Collapse" : "Expand"}
                            </Button>
                            <Button 
                              onClick={() => deleteSavedProject(project.id, project.project_name)} 
                              variant="destructive" 
                              size="sm"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content for Saved Projects */}
                      {expandedProjects.has(project.project_uid) && (
                        <div className="p-6 space-y-6">
                          {/* Column Selection */}
                          {project.available_columns.length > 0 && (
                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                              <div className="flex items-center justify-between mb-4">
                                <h6 className="font-semibold text-foreground flex items-center gap-2">
                                  <CheckSquare className="h-4 w-4" />
                                  Select Columns to Display
                                </h6>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => selectAllColumns(project.project_uid, project.available_columns)} 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Select All
                                  </Button>
                                  <Button 
                                    onClick={() => clearAllColumns(project.project_uid)} 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Clear All
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto scrollbar-thin p-2">
                                {project.available_columns.map((column) => (
                                  <label
                                    key={column}
                                    className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors group"
                                  >
                                    <div className="relative flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={project.selected_columns.includes(column)}
                                        onChange={() => toggleColumn(project.project_uid, column)}
                                        className="w-4 h-4 text-primary rounded border-input focus:ring-2 focus:ring-ring"
                                      />
                                    </div>
                                    <span className="text-sm text-foreground truncate flex-1" title={column}>
                                      {column}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              <div className="text-sm text-muted-foreground mt-3 p-2 bg-background rounded border border-border">
                                {project.selected_columns.length} of {project.available_columns.length} columns selected
                              </div>
                            </div>
                          )}

                          {/* Project Information */}
                          <div className="text-center py-8 bg-muted/20 rounded-lg border border-border">
                            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-foreground font-semibold">{project.project_name}</p>
                            <p className="text-muted-foreground text-sm mt-1">
                              Submissions: {project.total_submissions} • 
                              Use the sync feature to update data
                            </p>
                            <div className="flex gap-2 justify-center mt-4">
                              <Button 
                                onClick={() => syncProject(project.project_uid, project.project_name)}
                                disabled={isSyncing}
                                variant={syncSuccess ? "default" : "outline"}
                                className={cn(
                                  syncSuccess && "bg-green-600 hover:bg-green-700"
                                )}
                              >
                                {isSyncing ? (
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : syncSuccess ? (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                {isSyncing ? "Syncing..." : syncSuccess ? "Synced!" : "Sync Data"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Fetched Projects Section */}
        {tokens.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Fetched Projects</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFetchedProjects(!showFetchedProjects)}
                className="flex items-center gap-2"
              >
                {showFetchedProjects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showFetchedProjects ? "Hide" : "Show"} Fetched Projects ({tokens.length})
              </Button>
            </div>

            {showFetchedProjects && (
              <div className="space-y-6">
                {tokens.map((tokenData) => (
                  <div key={tokenData.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    {/* Token Header */}
                    <div className="bg-muted/50 px-6 py-4 border-b border-border">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Key className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{tokenData.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tokenData.token_preview} • {tokenData.totalSubmissions} submissions • Updated:{" "}
                              {new Date(tokenData.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => refreshToken(tokenData.id, tokenData.token)}
                            disabled={tokenData.loading}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className={cn("mr-2 h-4 w-4", tokenData.loading && "animate-spin")} />
                            {tokenData.loading ? "Refreshing..." : "Refresh"}
                          </Button>
                          <Button onClick={() => removeToken(tokenData.id)} variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Token Content */}
                    <div className="p-6">
                      {tokenData.loading && (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-4">Loading projects and data...</p>
                        </div>
                      )}

                      {tokenData.error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <div className="text-destructive font-semibold">Error:</div>
                          <div className="text-destructive/80 mt-1">{tokenData.error}</div>
                        </div>
                      )}

                      {!tokenData.loading && tokenData.projects.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-base font-semibold text-foreground">
                            {tokenData.totalProjects} Project{tokenData.totalProjects !== 1 ? "s" : ""}
                          </h4>

                          {tokenData.projects.map((project) => (
                            <div key={project.uid} className="border border-border rounded-lg overflow-hidden bg-card">
                              <div
                                className="bg-muted/30 p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleProjectExpansion(project.uid)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    {expandedProjects.has(project.uid) ? (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                                    )}
                                    <Badge
                                      variant={project.deployment__active ? "default" : "secondary"}
                                      className="shrink-0"
                                    >
                                      {project.deployment__active ? "Active" : "Inactive"}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-foreground text-base truncate">{project.name}</h5>
                                      <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <span>Owner: {project.owner__username}</span>
                                        <span>Created: {new Date(project.date_created).toLocaleDateString()}</span>
                                        <span>Submissions: {project.total_submissions}</span>
                                        <span>Columns: {project.available_columns.length}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addProjectToDashboard(project, tokenData.id)
                                    }}
                                    size="sm"
                                    className="ml-4 shrink-0"
                                    disabled={project.saved}
                                  >
                                    {project.saved ? (
                                      <Save className="mr-2 h-4 w-4" />
                                    ) : (
                                      <Plus className="mr-2 h-4 w-4" />
                                    )}
                                    {project.saved ? "Saved" : "Save Project"}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded Content for Fetched Projects */}
                              {expandedProjects.has(project.uid) && (
                                <div className="p-6 space-y-6">
                                  {/* Column Selection */}
                                  {project.available_columns.length > 0 && (
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                      <div className="flex items-center justify-between mb-4">
                                        <h6 className="font-semibold text-foreground flex items-center gap-2">
                                          <CheckSquare className="h-4 w-4" />
                                          Select Columns to Display
                                        </h6>
                                        <div className="flex gap-2">
                                          <Button 
                                            onClick={() => selectAllColumns(project.uid, project.available_columns, tokenData.id)} 
                                            variant="outline" 
                                            size="sm"
                                          >
                                            Select All
                                          </Button>
                                          <Button 
                                            onClick={() => clearAllColumns(project.uid, tokenData.id)} 
                                            variant="outline" 
                                            size="sm"
                                          >
                                            Clear All
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto scrollbar-thin p-2">
                                        {project.available_columns.map((column) => (
                                          <label
                                            key={column}
                                            className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors group"
                                          >
                                            <div className="relative flex items-center">
                                              <input
                                                type="checkbox"
                                                checked={project.selected_columns.includes(column)}
                                                onChange={() => toggleColumn(project.uid, column, tokenData.id)}
                                                className="w-4 h-4 text-primary rounded border-input focus:ring-2 focus:ring-ring"
                                              />
                                            </div>
                                            <span className="text-sm text-foreground truncate flex-1" title={column}>
                                              {column}
                                            </span>
                                          </label>
                                        ))}
                                      </div>

                                      <div className="text-sm text-muted-foreground mt-3 p-2 bg-background rounded border border-border">
                                        {project.selected_columns.length} of {project.available_columns.length} columns selected
                                      </div>
                                    </div>
                                  )}

                                  {/* Data Table */}
                                  {project.submissions.length > 0 && project.selected_columns.length > 0 && (
                                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                                      <div className="bg-muted/50 px-4 py-3 border-b border-border">
                                        <div className="flex items-center justify-between">
                                          <h6 className="font-semibold text-foreground flex items-center gap-2">
                                            <Database className="h-4 w-4" />
                                            Collected Data ({project.submissions.length} submissions)
                                          </h6>
                                          <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
                                        <table className="w-full">
                                          <thead className="bg-muted/30 sticky top-0 z-10">
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
                                                    title={String(submission[column] || "")}
                                                  >
                                                    {submission[column] !== undefined && submission[column] !== null
                                                      ? String(submission[column])
                                                      : "-"}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {project.submissions.length === 0 && (
                                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                      <p className="text-foreground font-semibold">No submissions collected yet</p>
                                      <p className="text-muted-foreground text-sm mt-1">
                                        Data will appear here once submissions are received
                                      </p>
                                    </div>
                                  )}

                                  {project.selected_columns.length === 0 && project.submissions.length > 0 && (
                                    <div className="text-center py-12 bg-accent/10 rounded-lg border border-accent/20">
                                      <CheckSquare className="h-12 w-12 text-accent-foreground mx-auto mb-3" />
                                      <p className="text-accent-foreground font-semibold">Select columns to view data</p>
                                      <p className="text-accent-foreground/80 text-sm mt-1">
                                        Choose which columns you want to display from the available columns above
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {!tokenData.loading && tokenData.projects.length === 0 && (
                        <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-foreground font-semibold">No projects found</p>
                          <p className="text-muted-foreground text-sm mt-1">
                            This token doesn't have access to any projects or there was an error fetching them
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {tokens.length === 0 && savedProjects.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto mb-6">
                <Database className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Data Collected Yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your Kobo Toolbox API token to start collecting and managing form data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}