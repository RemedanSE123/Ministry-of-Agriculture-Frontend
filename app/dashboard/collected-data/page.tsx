"use client"

import type React from "react"

import { useProtectedRoute } from "@/hooks/useProtectedRoute"
import { useState } from "react"
import { Database, Plus, RefreshCw, Trash2, ChevronDown, ChevronRight, Key, CheckSquare, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
}

interface TokenData {
  id: string
  name: string
  token: string
  tokenPreview: string
  projects: Project[]
  totalProjects: number
  totalSubmissions: number
  timestamp: string
  loading?: boolean
  error?: string
}

export default function CollectedDataPage() {
  const { user, isLoading } = useProtectedRoute()
  const [newToken, setNewToken] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProjectExpansion = (projectUid: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectUid)) {
      newExpanded.delete(projectUid)
    } else {
      newExpanded.add(projectUid)
    }
    setExpandedProjects(newExpanded)
  }

  const getBackendUrl = () => {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:5000"
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  }

  const toggleColumn = (projectUid: string, column: string) => {
    setTokens((prev) =>
      prev.map((token) => ({
        ...token,
        projects: token.projects.map((project) =>
          project.uid === projectUid
            ? {
                ...project,
                selected_columns: project.selected_columns.includes(column)
                  ? project.selected_columns.filter((col) => col !== column)
                  : [...project.selected_columns, column],
              }
            : project,
        ),
      })),
    )
  }

  const selectAllColumns = (projectUid: string) => {
    setTokens((prev) =>
      prev.map((token) => ({
        ...token,
        projects: token.projects.map((project) =>
          project.uid === projectUid ? { ...project, selected_columns: [...project.available_columns] } : project,
        ),
      })),
    )
  }

  const clearAllColumns = (projectUid: string) => {
    setTokens((prev) =>
      prev.map((token) => ({
        ...token,
        projects: token.projects.map((project) =>
          project.uid === projectUid ? { ...project, selected_columns: [] } : project,
        ),
      })),
    )
  }

  const addProjectToDashboard = (project: Project) => {
    // Store project in localStorage or send to backend
    const savedProjects = JSON.parse(localStorage.getItem("dashboardProjects") || "[]")
    const projectExists = savedProjects.some((p: Project) => p.uid === project.uid)

    if (!projectExists) {
      savedProjects.push(project)
      localStorage.setItem("dashboardProjects", JSON.stringify(savedProjects))
      alert(`Project "${project.name}" added to dashboard!`)
    } else {
      alert(`Project "${project.name}" is already in dashboard.`)
    }
  }

  const addToken = async () => {
    if (!newToken.trim()) {
      alert("Please enter an API token")
      return
    }

    const tokenId = Date.now().toString()
    const tokenPreview = newToken.substring(0, 8) + "..."

    const newTokenData: TokenData = {
      id: tokenId,
      name: tokenName || `Token ${tokens.length + 1}`,
      token: newToken.trim(),
      tokenPreview,
      projects: [],
      totalProjects: 0,
      totalSubmissions: 0,
      timestamp: new Date().toISOString(),
      loading: true,
    }

    setTokens((prev) => [...prev, newTokenData])
    setNewToken("")
    setTokenName("")

    try {
      const res = await fetch(`${getBackendUrl()}/api/kobo/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: newToken.trim(),
          tokenName: tokenName || `Token ${tokens.length + 1}`,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch projects")
      }

      setTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                projects: data.projects,
                totalProjects: data.totalProjects,
                totalSubmissions: data.totalSubmissions,
                timestamp: data.timestamp,
                loading: false,
                error: undefined,
              }
            : t,
        ),
      )
    } catch (err: any) {
      console.error("Fetch error:", err)
      setTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                loading: false,
                error: err.message || "Failed to fetch projects",
              }
            : t,
        ),
      )
    }
  }

  const removeToken = (tokenId: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
  }

  const refreshToken = async (tokenId: string) => {
    const tokenData = tokens.find((t) => t.id === tokenId)
    if (!tokenData) return

    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, loading: true } : t)))

    try {
      const response = await fetch(`${getBackendUrl()}/api/kobo/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenData.token,
          tokenName: tokenData.name,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch projects")
      }

      setTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                projects: data.projects,
                totalProjects: data.totalProjects,
                totalSubmissions: data.totalSubmissions,
                timestamp: data.timestamp,
                loading: false,
                error: undefined,
              }
            : t,
        ),
      )
    } catch (err: any) {
      console.error("Refresh error:", err)
      setTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                loading: false,
                error: err.message || "Failed to refresh projects",
              }
            : t,
        ),
      )
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addToken()
    }
  }

  const totalProjects = tokens.reduce((sum, token) => sum + token.totalProjects, 0)
  const totalSubmissions = tokens.reduce((sum, token) => sum + token.totalSubmissions, 0)

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
      <div className="max-w-7xl mx-auto space-y-8">
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

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">Add Kobo API Token</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Token Name (optional)</label>
              <input
                type="text"
                placeholder="My Organization"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">API Token *</label>
              <input
                type="password"
                placeholder="Paste your Kobo API token here"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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

        {tokens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{tokens.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Tokens</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{totalProjects}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Projects</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{totalSubmissions}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Submissions</div>
            </div>
          </div>
        )}

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
                        {tokenData.tokenPreview} • {tokenData.totalSubmissions} submissions • Updated:{" "}
                        {new Date(tokenData.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => refreshToken(tokenData.id)}
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
                                addProjectToDashboard(project)
                              }}
                              size="sm"
                              className="ml-4 shrink-0"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Project
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedProjects.has(project.uid) && (
                          <div className="p-6 space-y-6">
                            {project.available_columns.length > 0 && (
                              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                <div className="flex items-center justify-between mb-4">
                                  <h6 className="font-semibold text-foreground flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" />
                                    Select Columns to Display
                                  </h6>
                                  <div className="flex gap-2">
                                    <Button onClick={() => selectAllColumns(project.uid)} variant="outline" size="sm">
                                      Select All
                                    </Button>
                                    <Button onClick={() => clearAllColumns(project.uid)} variant="outline" size="sm">
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
                                          onChange={() => toggleColumn(project.uid, column)}
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
                                  {project.selected_columns.length} of {project.available_columns.length} columns
                                  selected
                                </div>
                              </div>
                            )}

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
                                <p className="text-accent-foreground font-semibold">
                                  Please select at least one column to display data
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!tokenData.loading && tokenData.projects.length === 0 && !tokenData.error && (
                  <div className="text-center py-16 bg-muted/20 rounded-xl border border-border">
                    <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-foreground mb-2">No Projects Found</h4>
                    <p className="text-muted-foreground">
                      This token doesn't have any projects or you don't have access
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
            <Key className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">No tokens added yet</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Add your first Kobo API token to start exploring your projects and data
            </p>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
}
