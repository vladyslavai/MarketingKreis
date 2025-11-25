"use client"

import useSWR from "swr"
import { type Activity } from "@/components/circle/radial-circle"
import { authFetch } from "@/lib/api"
import { sync } from "@/lib/sync"
import * as React from "react"

const fetcher = async (url: string) => {
	const res = await authFetch(url)
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	try {
		return await res.json()
	} catch {
		return []
	}
}

export function useActivities() {
    const { data, error, isLoading, mutate } = useSWR("/activities", fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false,
    })

    // Local cache to persist the exact chosen category names per activity id.
    const CAT_STORAGE_KEY = 'mk_activity_categories'
    const loadCategoryMap = (): Record<string, string> => {
        if (typeof window === 'undefined') return {}
        try { return JSON.parse(localStorage.getItem(CAT_STORAGE_KEY) || '{}') } catch { return {} }
    }
    const saveCategoryMap = (map: Record<string, string>) => {
        if (typeof window === 'undefined') return
        try { localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(map)) } catch {}
    }
    const setActivityCategory = (id: string, category?: string) => {
        if (!id || !category) return
        const map = loadCategoryMap()
        map[id] = category
        saveCategoryMap(map)
    }
    const removeActivityCategory = (id: string) => {
        const map = loadCategoryMap()
        if (map[id]) { delete map[id]; saveCategoryMap(map) }
    }

    // Merge categories from cache to ensure rendering on the selected ring
    const activities: Activity[] = (() => {
        const list: any[] = Array.isArray(data) ? (data as any[]) : []
        const cats = loadCategoryMap()
        return list.map((a) => ({ ...a, category: cats[String(a.id)] || a.category })) as Activity[]
    })()

    const addActivity = React.useCallback(async (activity: Omit<Activity, "id">) => {
        const res = await authFetch("/activities", { method: "POST", body: JSON.stringify(activity) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const created = await res.json().catch(() => null)
        // Persist chosen category even if backend normalizes it
        if (created?.id && (activity as any).category) setActivityCategory(String(created.id), String((activity as any).category))
        await mutate()
        sync.emit('activities:changed')
        return created
    }, [mutate])

    const updateActivity = React.useCallback(async (activityId: string, updates: Partial<Activity>) => {
        const res = await authFetch(`/activities/${activityId}`, { method: "PUT", body: JSON.stringify(updates) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const updated = await res.json().catch(() => null)
        if (updates.category) setActivityCategory(String(activityId), String(updates.category))
        await mutate()
        sync.emit('activities:changed')
        return updated
    }, [mutate])

    const deleteActivity = React.useCallback(async (activityId: string) => {
        const res = await authFetch(`/activities/${activityId}`, { method: "DELETE" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        removeActivityCategory(String(activityId))
        await mutate()
        sync.emit('activities:changed')
    }, [mutate])

    const moveActivity = React.useCallback(async (activityId: string, newDate: Date) => {
        return updateActivity(activityId, { start: newDate })
    }, [updateActivity])

    if (typeof window !== 'undefined') {
        sync.on('global:refresh', () => mutate())
        sync.on('activities:changed', () => mutate())
    }

    return {
        activities,
        loading: isLoading,
        error: error ? (error as Error).message : null,
        addActivity,
        updateActivity,
        deleteActivity,
        moveActivity,
        refetch: async () => { await mutate(); sync.emit('activities:changed') },
    }
}

// Mock данные по умолчанию
const defaultMockActivities: Activity[] = [
  {
    id: '1',
    title: 'Frühlingskampagne',
    category: 'VERKAUFSFOERDERUNG',
    status: 'ACTIVE',
    weight: 80,
    budgetCHF: 25000,
    expectedLeads: 150,
    start: new Date(2024, 2, 15), // March 15, 2024
    end: new Date(2024, 4, 15), // May 15, 2024
    ownerId: 'user1',
    owner: { name: 'Max Mustermann' },
    notes: 'Fokus auf neue Produktlinie',
  },
  {
    id: '2',
    title: 'Brand Awareness Q2',
    category: 'IMAGE',
    status: 'PLANNED',
    weight: 60,
    budgetCHF: 40000,
    expectedLeads: 80,
    start: new Date(2024, 3, 1), // April 1, 2024
    end: new Date(2024, 5, 30), // June 30, 2024
    ownerId: 'user2',
    owner: { name: 'Anna Weber' },
  },
  {
    id: '3',
    title: 'Recruiting Drive',
    category: 'EMPLOYER_BRANDING',
    status: 'ACTIVE',
    weight: 70,
    budgetCHF: 15000,
    expectedLeads: 50,
    start: new Date(2024, 1, 1), // February 1, 2024
    end: new Date(2024, 7, 31), // August 31, 2024
    ownerId: 'user1',
    owner: { name: 'Max Mustermann' },
  },
  {
    id: '4',
    title: 'Newsletter Campaign',
    category: 'KUNDENPFLEGE',
    status: 'PLANNED',
    weight: 30,
    budgetCHF: 8000,
    expectedLeads: 25,
    start: new Date(2024, 3, 15), // April 15, 2024
    ownerId: 'user3',
    owner: { name: 'Sophie Schmidt' },
  },
  {
    id: '5',
    title: 'Sommerkampagne Vorbereitung',
    category: 'VERKAUFSFOERDERUNG',
    status: 'PLANNED',
    weight: 90,
    budgetCHF: 35000,
    expectedLeads: 200,
    start: new Date(2024, 5, 1), // June 1, 2024
    ownerId: 'user2',
    owner: { name: 'Anna Weber' },
  },
  {
    id: '6',
    title: 'Webinar Series',
    category: 'IMAGE',
    status: 'PLANNED',
    weight: 65,
    budgetCHF: 12000,
    expectedLeads: 75,
    start: new Date(2024, 4, 10), // May 10, 2024
    ownerId: 'user3',
    owner: { name: 'Sophie Schmidt' },
  },
]

// Функция для загрузки активностей из localStorage
const loadActivitiesFromStorage = (): Activity[] => {
  if (typeof window === 'undefined') return defaultMockActivities
  
  try {
    const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Преобразуем даты из строк обратно в Date объекты
      return parsed.map((activity: any) => ({
        ...activity,
        start: activity.start ? new Date(activity.start) : undefined,
        end: activity.end ? new Date(activity.end) : undefined,
      }))
    }
  } catch (error) {
    console.warn('Не удалось загрузить активности из localStorage:', error)
  }
  
  return defaultMockActivities
}

// Функция для сохранения активностей в localStorage
const saveActivitiesToStorage = (activities: Activity[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities))
  } catch (error) {
    console.warn('Не удалось сохранить активности в localStorage:', error)
  }
}

// BELOW: legacy localStorage-based mock hook and helpers were removed to avoid
// duplicate definitions and ensure a single API-driven source of truth.
