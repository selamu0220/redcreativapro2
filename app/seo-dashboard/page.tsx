'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MousePointer, 
  DollarSign, 
  BarChart3,
  PenTool,
  Activity,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Globe,
  Target,
  Zap,
  Settings,
  FileText,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { SEOProject, TrafficData, RankingData, KeywordData, GeneratedContent } from '../../types/seo'
import KeywordResearchTool from '@/components/seo/KeywordResearchTool'
import ContentGenerationTool from '@/components/seo/ContentGenerationTool'
import AnalyticsDashboard from '@/components/seo/AnalyticsDashboard'
import SchemaMarkup from '@/components/seo/SchemaMarkup'
import TechnicalSEO from '@/components/seo/TechnicalSEO'
import MetaOptimizer from '@/components/seo/MetaOptimizer'
import { toast } from 'sonner'

interface DashboardStats {
  totalProjects: number
  totalKeywords: number
  avgPosition: number
  totalTraffic: number
  totalClicks: number
  conversionRate: number
}

export default function SEODashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [projects, setProjects] = useState<SEOProject[]>([])
  const [selectedProject, setSelectedProject] = useState<SEOProject | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalKeywords: 0,
    avgPosition: 0,
    totalTraffic: 0,
    totalClicks: 0,
    conversionRate: 0
  })
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [rankingData, setRankingData] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'content' | 'backlinks' | 'analytics' | 'technical' | 'meta' | 'tres-reyes'>('overview')
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [projectKeywords, setProjectKeywords] = useState<string[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      setProjectKeywords(selectedProject.target_keywords || [])
    }
  }, [selectedProject])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Load projects
      const projectsResponse = await fetch(`/api/seo/projects?userId=${user.id}`)
      const projectsData = await projectsResponse.json()
      
      if (projectsData.projects) {
        setProjects(projectsData.projects)
        if (projectsData.projects.length > 0 && !selectedProject) {
          setSelectedProject(projectsData.projects[0])
          await loadProjectData(projectsData.projects[0].id)
        }
      }

      // Calculate dashboard stats
      calculateStats(projectsData.projects || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Error loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadProjectData = async (projectId: string) => {
    try {
      // Load traffic data
      const trafficResponse = await fetch(`/api/seo/analytics?projectId=${projectId}&metric=traffic&dateRange=30`)
      const trafficResult = await trafficResponse.json()
      if (trafficResult.success) {
        setTrafficData(trafficResult.data)
      }

      // Load ranking data
      const rankingResponse = await fetch(`/api/seo/analytics?projectId=${projectId}&metric=rankings&dateRange=30`)
      const rankingResult = await rankingResponse.json()
      if (rankingResult.success) {
        setRankingData(rankingResult.data)
      }

    } catch (error) {
      console.error('Error loading project data:', error)
    }
  }

  const calculateStats = (projectList: SEOProject[]) => {
    const totalProjects = projectList.length
    const totalKeywords = projectList.reduce((sum, project) => sum + (project.target_keywords?.length || 0), 0)
    
    // Mock calculations for demo
    const avgPosition = 15.5
    const totalTraffic = 12450
    const totalClicks = 8920
    const conversionRate = 3.2

    setStats({
      totalProjects,
      totalKeywords,
      avgPosition,
      totalTraffic,
      totalClicks,
      conversionRate
    })
  }

  const handleCreateProject = async (projectData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/seo/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          userId: user.id
        })
      })

      const result = await response.json()
      if (result.project) {
        await loadDashboardData()
        setShowCreateProject(false)
        toast.success('SEO project created successfully!')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create SEO project')
    }
  }

  const handleKeywordsUpdate = (keywords: KeywordData[]) => {
    const keywordStrings = keywords.map(k => k.keyword)
    setProjectKeywords(keywordStrings)
    
    // Update project keywords in the selected project
    if (selectedProject) {
      setSelectedProject({
        ...selectedProject,
        target_keywords: keywordStrings
      })
    }
  }

  const handleContentGenerated = (content: GeneratedContent) => {
    // Handle content generation completion
    toast.success('Content generated and saved!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SEO Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SEO Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and optimize your SEO strategy
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateProject(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
              <button className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === e.target.value)
                setSelectedProject(project || null)
                if (project) loadProjectData(project.id)
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.domain})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keywords</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalKeywords}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Position</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgPosition}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Traffic</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTraffic.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clicks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.conversionRate}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'keywords', label: 'Keywords', icon: Search },
              { id: 'content', label: 'Content', icon: PenTool },
              { id: 'tres-reyes', label: 'Tres Reyes SEO', icon: Zap },
              { id: 'backlinks', label: 'Backlinks', icon: LinkIcon },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'technical', label: 'Technical SEO', icon: Settings },
              { id: 'meta', label: 'Meta Optimizer', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Project Overview
                </h3>
                
                {selectedProject ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Project Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedProject.name}</p>
                        <p><span className="font-medium">Domain:</span> {selectedProject.domain}</p>
                        <p><span className="font-medium">Location:</span> {selectedProject.target_location || 'Not specified'}</p>
                        <p><span className="font-medium">Business Type:</span> {selectedProject.business_type || 'Not specified'}</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedProject.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {selectedProject.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Target Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.target_keywords?.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        )) || <p className="text-gray-500 text-sm">No keywords configured</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No projects yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first SEO project to get started
                    </p>
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Create Project
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keywords' && selectedProject && (
              <KeywordResearchTool 
                projectId={selectedProject.id}
                onKeywordsUpdate={handleKeywordsUpdate}
              />
            )}

            {activeTab === 'keywords' && !selectedProject && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Keyword Research Tool
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a project to start keyword research
                </p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}

            {activeTab === 'content' && selectedProject && (
              <ContentGenerationTool 
                projectId={selectedProject.id}
                keywords={projectKeywords}
                onContentGenerated={handleContentGenerated}
              />
            )}

            {activeTab === 'content' && !selectedProject && (
              <div className="text-center py-12">
                <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Content Generation Tool
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a project to start content generation
                </p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}

            {activeTab === 'backlinks' && (
              <div className="text-center py-12">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Backlink Analysis
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedProject ? 
                    `Analyze backlinks for ${selectedProject.domain}` : 
                    'Select a project to analyze backlinks'
                  }
                </p>
                {!selectedProject && (
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Your First Project
                  </button>
                )}
              </div>
            )}

            {activeTab === 'analytics' && selectedProject && (
              <AnalyticsDashboard projectId={selectedProject.id} />
            )}

            {activeTab === 'analytics' && !selectedProject && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  SEO Analytics
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a project to view analytics
                </p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}

            {activeTab === 'technical' && selectedProject && (
              <TechnicalSEO url={selectedProject.domain} />
            )}

            {activeTab === 'technical' && !selectedProject && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Technical SEO
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a project to analyze technical SEO
                </p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}

            {activeTab === 'meta' && selectedProject && (
               <div className="space-y-8">
                 <MetaOptimizer 
                   targetKeywords={projectKeywords}
                   onSave={(metaData) => {
                     toast.success('Meta tags saved successfully!')
                   }}
                 />
                 <SchemaMarkup
                    organization={{
                      name: selectedProject.name,
                      url: selectedProject.domain,
                      description: `SEO project for ${selectedProject.name}`
                    }}
                  />
               </div>
             )}

             {activeTab === 'meta' && !selectedProject && (
               <div className="text-center py-12">
                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                   Meta Optimizer
                 </h3>
                 <p className="text-gray-500 mb-4">
                   Select a project to optimize meta tags
                 </p>
                 <button
                   onClick={() => setShowCreateProject(true)}
                   className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                 >
                   Create Your First Project
                 </button>
               </div>
             )}

             {activeTab === 'tres-reyes' && (
               <div className="space-y-6">
                 <div className="text-center">
                   <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                     Sistema SEO "Tres Reyes"
                   </h3>
                   <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                     Optimiza páginas que rankean entre posiciones 5-15 para multiplicar tu CTR hasta 7x. 
                     Estrategia enfocada en optimizar title tag, H1 y primera frase para maximizar el tráfico orgánico.
                   </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                     <div className="flex items-center mb-4">
                       <Search className="w-8 h-8 text-blue-600 mr-3" />
                       <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                         Detector de Oportunidades
                       </h4>
                     </div>
                     <p className="text-blue-700 dark:text-blue-200 mb-4 text-sm">
                       Identifica keywords que rankean entre posiciones 5-15 usando Google Search Console API.
                     </p>
                     <Link href="/seo-dashboard/opportunities">
                       <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                         Detectar Oportunidades
                       </button>
                     </Link>
                   </div>

                   <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                     <div className="flex items-center mb-4">
                       <Target className="w-8 h-8 text-green-600 mr-3" />
                       <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                         Optimizador Tres Reyes
                       </h4>
                     </div>
                     <p className="text-green-700 dark:text-green-200 mb-4 text-sm">
                       Editor en tiempo real para optimizar title tag, H1 y primera frase con preview SERP.
                     </p>
                     <Link href="/seo-dashboard/optimizer">
                       <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                         Optimizar Contenido
                       </button>
                     </Link>
                   </div>

                   <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                     <div className="flex items-center mb-4">
                       <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                       <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                         Analizador de Intención
                       </h4>
                     </div>
                     <p className="text-purple-700 dark:text-purple-200 mb-4 text-sm">
                       Verifica search intent, compara con competencia top 3 y detecta huecos semánticos NLP.
                     </p>
                     <Link href="/seo-dashboard/intent-analyzer">
                       <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                         Analizar Intent
                       </button>
                     </Link>
                   </div>
                 </div>

                 <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                       <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                       <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                         Monitor de Resultados
                       </h4>
                     </div>
                     <Link href="/seo-dashboard/results">
                       <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                         Ver Resultados
                       </button>
                     </Link>
                   </div>
                   <p className="text-orange-700 dark:text-orange-200 text-sm">
                     Dashboard de seguimiento con gráficos de evolución de rankings, CTR y tráfico orgánico. 
                     Monitorea el impacto de tus optimizaciones en tiempo real.
                   </p>
                 </div>

                 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                   <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                     ¿Por qué funciona la estrategia "Tres Reyes"?
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <div>
                       <h5 className="font-medium text-gray-900 dark:text-white mb-2">📈 Multiplicador de CTR</h5>
                       <p className="text-gray-600 dark:text-gray-400">
                         Pasar de posición 10 a 5 puede aumentar tu CTR hasta 7 veces, generando más tráfico sin crear contenido nuevo.
                       </p>
                     </div>
                     <div>
                       <h5 className="font-medium text-gray-900 dark:text-white mb-2">🎯 Enfoque Estratégico</h5>
                       <p className="text-gray-600 dark:text-gray-400">
                         Se enfoca en los "Tres Reyes" del SEO: Title Tag, H1 y primera frase, los elementos más importantes para el algoritmo.
                       </p>
                     </div>
                     <div>
                       <h5 className="font-medium text-gray-900 dark:text-white mb-2">⚡ ROI Inmediato</h5>
                       <p className="text-gray-600 dark:text-gray-400">
                         Optimiza contenido existente que ya rankea, generando resultados más rápidos que crear contenido desde cero.
                       </p>
                     </div>
                     <div>
                       <h5 className="font-medium text-gray-900 dark:text-white mb-2">🔍 Search Intent</h5>
                       <p className="text-gray-600 dark:text-gray-400">
                         Analiza la intención de búsqueda para asegurar que tu contenido coincida con lo que buscan los usuarios.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  )
}

// Create Project Modal Component
interface CreateProjectModalProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

function CreateProjectModal({ onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    targetLocation: '',
    businessType: '',
    targetKeywords: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const keywords = formData.targetKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    onSubmit({
      name: formData.name,
      domain: formData.domain,
      target_location: formData.targetLocation,
      business_type: formData.businessType,
      target_keywords: keywords,
      status: 'active'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Create New SEO Project
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="My SEO Project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domain *
              </label>
              <input
                type="text"
                required
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Location
              </label>
              <input
                type="text"
                value={formData.targetLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, targetLocation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="New York, USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Type
              </label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Marketing Agency"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Keywords (comma separated)
              </label>
              <textarea
                value={formData.targetKeywords}
                onChange={(e) => setFormData(prev => ({ ...prev, targetKeywords: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="digital marketing, SEO, web design"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}