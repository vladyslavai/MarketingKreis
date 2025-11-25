"use client"

import useSWR from 'swr'
import { authFetch } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface Activity {
  id: string
  title: string
  category: 'VERKAUFSFOERDERUNG' | 'IMAGE' | 'EMPLOYER_BRANDING' | 'KUNDENPFLEGE'
  status: 'ACTIVE' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'
  weight?: number
  budgetCHF?: number
  expectedLeads?: number
  start?: string | Date
  end?: string | Date
  ownerId?: string
  owner?: { name: string }
  notes?: string
  created_at?: string
  updated_at?: string
}

const fetcher = async (url: string) => {
  const res = await authFetch(url)
  if (!res.ok) return []
  try { return await res.json() } catch { return [] }
}

export function useActivitiesApi() {
  const { data, error, isLoading, mutate } = useSWR('/activities', fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const createActivity = async (activity: Omit<Activity, 'id'>) => {
    const res = await authFetch('/activities', { method: 'POST', body: JSON.stringify(activity) })
    const newActivity = await res.json().catch(() => null)
    mutate()
    return newActivity as Activity | null
  }

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const res = await authFetch(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
    const updated = await res.json().catch(() => null)
    mutate()
    return updated as Activity | null
  }

  const deleteActivity = async (id: string) => {
    await authFetch(`/activities/${id}`, { method: 'DELETE' })
    mutate()
  }

  return {
    activities: data || [],
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    refresh: mutate,
  }
}



