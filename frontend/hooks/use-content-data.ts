
"use client"

import { useState, useEffect } from 'react'
import { crmApi } from '@/lib/crm-api'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface ContentTask {
  id: string
  title: string
  channel: string
  format?: string
  deadline?: Date
  status: TaskStatus
  priority: TaskPriority
  notes?: string
  assets?: string[]
  owner?: {
    id: string
    name: string
    avatar?: string
  }
  activityId?: string
  activity?: {
    title: string
  }
  createdAt?: Date
  updatedAt?: Date
}

export function useContentData() {
  const [tasks, setTasks] = useState<ContentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContentData() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching content data...')
        
        // Получаем deals и создаем content tasks на их основе
        const deals = await crmApi.getDeals()
        const companies = await crmApi.getCompanies()
        
        console.log('Deals:', deals)
        console.log('Companies:', companies)
        
        // Маппинг deals в content tasks
        const contentTasks: ContentTask[] = deals.map((deal: any, index) => {
          try {
            const company = companies.find(c => c.id === deal.company_id)
            
            // Определяем канал на основе отрасли
            const channelMap: Record<string, string> = {
              'Technology': 'Website',
              'Healthcare': 'Email',
              'Finance': 'Social Media',
              'Retail': 'Blog'
            }
            
            // Определяем формат на основе канала
            const formatMap: Record<string, string> = {
              'Website': 'Landing Page',
              'Email': 'HTML Template',
              'Social Media': 'Instagram Posts',
              'Blog': 'Blog Posts'
            }
            
            const channel = channelMap[company?.industry || 'Technology'] || 'Website'
            const format = formatMap[channel] || 'Landing Page'
            
            // Определяем статус на основе статуса deal
            const statusMap: Record<string, TaskStatus> = {
              'lead': 'TODO',
              'qualified': 'IN_PROGRESS',
              'proposal': 'REVIEW',
              'negotiation': 'APPROVED',
              'won': 'PUBLISHED',
              'lost': 'ARCHIVED'
            }
            
            // Определяем приоритет на основе вероятности
            const getPriority = (probability: number): TaskPriority => {
              if (probability >= 80) return 'URGENT'
              if (probability >= 60) return 'HIGH'
              if (probability >= 30) return 'MEDIUM'
              return 'LOW'
            }
            
            return {
              id: deal.id?.toString() || `deal-${index}`,
              title: `${deal.title || 'Untitled Deal'} - Content Erstellung`,
              channel,
              format,
              deadline: deal.expected_close_date ? new Date(deal.expected_close_date) : undefined,
              status: statusMap[deal.stage] || 'TODO',
              priority: getPriority(deal.probability || 0),
              notes: deal.notes || `Content-Erstellung für ${company?.name || 'Kunde'}`,
              assets: [],
              owner: deal.owner ? {
                id: deal.owner,
                name: deal.owner,
                avatar: undefined
              } : undefined,
              activityId: deal.id?.toString() || `deal-${index}`,
              activity: {
                title: company?.name || 'Kundenauftrag'
              },
              createdAt: deal.created_at ? new Date(deal.created_at) : new Date(),
              updatedAt: deal.updated_at ? new Date(deal.updated_at) : new Date()
            }
          } catch (dealError) {
            console.error('Error processing deal:', deal, dealError)
            return {
              id: `error-${index}`,
              title: 'Error Processing Deal',
              channel: 'Website',
              format: 'Landing Page',
              status: 'TODO' as TaskStatus,
              priority: 'LOW' as TaskPriority,
              notes: 'Error processing this deal',
              assets: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        })
        
        // Füge einige zusätzliche Content-spezifische Tasks hinzu
        const additionalTasks: ContentTask[] = [
          {
            id: 'content-1',
            title: 'Monatlicher Newsletter',
            channel: 'Email',
            format: 'HTML Template',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In einer Woche
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            notes: 'Newsletter für alle Kunden mit neuen Features',
            assets: ['newsletter-template.html'],
            owner: {
              id: 'content-1',
              name: 'Sophie Schmidt',
              avatar: undefined
            },
            activity: {
              title: 'Regelmäßiger Content'
            },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'content-2',
            title: 'Social Media Kampagne Q2',
            channel: 'Social Media',
            format: 'Instagram Posts',
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In zwei Wochen
            status: 'REVIEW',
            priority: 'MEDIUM',
            notes: '10 Posts für LinkedIn und Instagram',
            assets: ['campaign-brief.pdf'],
            owner: {
              id: 'content-2',
              name: 'Max Mustermann',
              avatar: undefined
            },
            activity: {
              title: 'Q2 Marketing'
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
        
        console.log('Content tasks created:', contentTasks)
        setTasks([...contentTasks, ...additionalTasks])
        setError(null)
      } catch (err) {
        console.error('Error fetching content data:', err)
        setTasks([])
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchContentData()
  }, [])

  const addTask = (newTask: Omit<ContentTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: ContentTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTasks(prev => [...prev, task])
    return task
  }

  const updateTask = (taskId: string, updates: Partial<ContentTask>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  return { 
    tasks, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask,
    refetch: () => window.location.reload() 
  }
}
