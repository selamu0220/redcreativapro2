'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Eye, 
  MousePointer,
  Target,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { KeywordOpportunity, OpportunityFilters } from '../../../types/seo-tres-reyes'
import { SEOProject } from '../../../types/seo'

interface OpportunityStats {
  totalOpportunities: number
  avgPosition: number
  totalImpressions: number
  totalClicks: number
  avgCTR: number
  potentialTrafficIncrease: number
}

export default function OpportunitiesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  // State management
  const [projects, setProjects] = useState<SEOProject[]>([])
  const [selectedProject, setSelectedProject] = useState<SEOProject | null>(null)
  const [opportunities, setOpportunities] = useState<KeywordOpportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<KeywordOpportunity[]>([])
  const [stats, setStats] = useState<OpportunityStats>({
    totalOpportunities: 0,
    avgPosition: 0,
    totalImpressions: 0,
    totalClicks: 0,
    avgCTR: 0,
    potentialTrafficIncrease: 0
  })
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'priority' | 'position' | 'impressions' | 'ctr'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Filters
  const [filters, setFilters] = useState<OpportunityFilters>({
    position_min: 5,
    position_max: 15,
    search_volume_min: 100,
    ctr_min: 0.01,
    ctr_max: 1.0
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadOpportunities()
    }
  }, [selectedProject])

  useEffect(() => {
    applyFiltersAndSort()
  }, [opportunities, searchTerm, filters, sortBy, sortOrder])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      if (!supabase) {
        console.warn('Supabase not configured')
        router.push('/auth')
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Load projects
      const projectsResponse = await fetch(`/api/seo/projects?userId=${user.id}`)
      const projectsData = await projectsResponse.json()
      
      if (projectsData.projects && projectsData.projects.length > 0) {
        setProjects(projectsData.projects)
        setSelectedProject(projectsData.projects[0])
      } else {
        toast.error('No SEO projects found. Please create a project first.')
        router.push('/seo-dashboard')
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const loadOpportunities = async () => {
    if (!selectedProject) return

    try {
      setRefreshing(true)
      
      const queryParams = new URLSearchParams({
        projectId: selectedProject.id,
        minPosition: filters.position_min?.toString() || '5',
        maxPosition: filters.position_max?.toString() || '15',
        minImpressions: filters.search_volume_min?.toString() || '100',
        limit: '100'
      })

      const response = await fetch(`/api/seo/opportunities?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setOpportunities(result.data.opportunities)
        calculateStats(result.data.opportunities)
      } else {
        toast.error('Failed to load opportunities')
      }

    } catch (error) {
      console.error('Error loading opportunities:', error)
      toast.error('Error loading opportunities')
    } finally {
      setRefreshing(false)
    }
  }

  const calculateStats = (opportunityList: KeywordOpportunity[]) => {
    if (opportunityList.length === 0) {
      setStats({
        totalOpportunities: 0,
        avgPosition: 0,
        totalImpressions: 0,
        totalClicks: 0,
        avgCTR: 0,
        potentialTrafficIncrease: 0
      })
      return
    }

    const totalOpportunities = opportunityList.length
    const avgPosition = opportunityList.reduce((sum, opp) => sum + opp.current_position, 0) / totalOpportunities
    const totalImpressions = opportunityList.reduce((sum, opp) => sum + opp.impressions, 0)
    const totalClicks = opportunityList.reduce((sum, opp) => sum + opp.clicks, 0)
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const potentialTrafficIncrease = opportunityList.reduce((sum, opp) => sum + opp.potential_ctr_increase, 0)

    setStats({
      totalOpportunities,
      avgPosition: Math.round(avgPosition * 10) / 10,
      totalImpressions,
      totalClicks,
      avgCTR: Math.round(avgCTR * 100) / 100,
      potentialTrafficIncrease: Math.round(potentialTrafficIncrease)
    })
  }

  const applyFiltersAndSort = () => {
    let filtered = opportunities.filter(opp => {
      const matchesSearch = searchTerm === '' || 
        opp.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.url.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilters = 
        opp.current_position >= (filters.position_min || 1) &&
        opp.current_position <= (filters.position_max || 100) &&
        opp.impressions >= (filters.search_volume_min || 0) &&
        opp.ctr >= (filters.ctr_min || 0) &&
        opp.ctr <= (filters.ctr_max || 1)

      return matchesSearch && matchesFilters
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'priority':
          aValue = a.priority_score
          bValue = b.priority_score
          break
        case 'position':
          aValue = a.current_position
          bValue = b.current_position
          break
        case 'impressions':
          aValue = a.impressions
          bValue = b.impressions
          break
        case 'ctr':
          aValue = a.clicks / a.impressions
          bValue = b.clicks / b.impressions
          break
        default:
          aValue = a.priority_score
          bValue = b.priority_score
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    setFilteredOpportunities(filtered)
    setCurrentPage(1)
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const exportOpportunities = () => {
    const csvContent = [
      ['Keyword', 'URL', 'Position', 'Impressions', 'Clicks', 'CTR', 'Priority', 'Potential Increase'].join(','),
      ...filteredOpportunities.map(opp => [
        `"${opp.keyword}"`,
        `"${opp.url}"`,
        opp.current_position,
        opp.impressions,
        opp.clicks,
        ((opp.clicks / opp.impressions) * 100).toFixed(2) + '%',
        opp.priority_score,
        opp.potential_ctr_increase.toFixed(0)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-opportunities-${selectedProject?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Opportunities exported successfully!')
  }

  // Pagination
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOpportunities = filteredOpportunities.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Detector de Keywords 5-15
            </h1>
            <p className="text-muted-foreground">
              Encuentra oportunidades de optimización para keywords que rankean entre las posiciones 5-15
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Project Selector */}
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === e.target.value)
                setSelectedProject(project || null)
              }}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <button
              onClick={loadOpportunities}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOpportunities}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Position</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgPosition}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalImpressions.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgCTR}%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential +Traffic</p>
                <p className="text-2xl font-bold text-foreground">+{stats.potentialTrafficIncrease}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search keywords or URLs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground w-80"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={exportOpportunities}
                className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={filters.position_min || 5}
                    onChange={(e) => setFilters({...filters, position_min: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={filters.position_max || 15}
                    onChange={(e) => setFilters({...filters, position_max: parseInt(e.target.value) || 100})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min Impressions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.search_volume_min || 100}
                    onChange={(e) => setFilters({...filters, search_volume_min: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min CTR
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={filters.ctr_min || 0.01}
                    onChange={(e) => setFilters({...filters, ctr_min: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opportunities Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('priority')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Priority</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Keyword
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('position')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Position</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('impressions')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Impressions</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Clicks
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('ctr')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>CTR</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Potential +Traffic
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentOpportunities.map((opportunity) => {
                  const ctr = opportunity.impressions > 0 ? (opportunity.clicks / opportunity.impressions) * 100 : 0
                  
                  return (
                    <tr key={opportunity.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            opportunity.priority_score >= 8 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : opportunity.priority_score >= 6
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {opportunity.priority_score}/10
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {opportunity.keyword}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opportunity.current_position <= 10
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          #{opportunity.current_position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {opportunity.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {opportunity.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {ctr.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-medium">
                          +{Math.round(opportunity.potential_ctr_increase)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={opportunity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm"
                        >
                          <span className="truncate max-w-xs">
                            {opportunity.url.replace(/^https?:\/\//, '')}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/seo-dashboard/optimizer?keyword=${encodeURIComponent(opportunity.keyword)}&url=${encodeURIComponent(opportunity.url)}`)}
                          className="flex items-center space-x-1 px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Optimize</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOpportunities.length)} of {filteredOpportunities.length} opportunities
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && !refreshing && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No opportunities found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(v => v !== undefined) 
                ? 'Try adjusting your search or filters'
                : 'No keywords found in the 5-15 position range'
              }
            </p>
            {searchTerm || Object.values(filters).some(v => v !== undefined) ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilters({
                    position_min: 5,
                    position_max: 15,
                    search_volume_min: 100,
                    ctr_min: 0.01,
                    ctr_max: 1.0
                  })
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={loadOpportunities}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Refresh Data
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}