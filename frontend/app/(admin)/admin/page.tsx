'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type UsersStats = {
  total: number
  verified: number
  unverified: number
  newLast7d: number
  roles: Record<string, number>
  latest: Array<{
    id: number
    email: string
    role: string
    isVerified: boolean
    createdAt: string | null
  }>
}

type StatsResponse = {
  users: UsersStats
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsResponse | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' })
        if (res.status === 401 || res.status === 403) {
          router.replace('/unauthorized')
          return
        }
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const data = (await res.json()) as StatsResponse
        setStats(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin stats')
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    )
  }

  const users = stats?.users

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold">Admin Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Kpi title="Users" value={users?.total ?? 0} />
        <Kpi title="Verified" value={users?.verified ?? 0} />
        <Kpi title="Unverified" value={users?.unverified ?? 0} />
        <Kpi title="New (7d)" value={users?.newLast7d ?? 0} />
      </div>

      {/* Roles breakdown */}
      <section className="bg-white rounded-lg border p-4 dark:bg-neutral-900">
        <h2 className="text-lg font-medium mb-3">Roles</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(users?.roles ?? {}).map(([role, count]) => (
            <span
              key={role}
              className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-sm"
            >
              <span className="font-medium mr-2">{role}</span>
              <span className="text-neutral-500">{count}</span>
            </span>
          ))}
          {Object.keys(users?.roles ?? {}).length === 0 && (
            <div className="text-sm text-neutral-500">No data</div>
          )}
        </div>
      </section>

      {/* Latest users */}
      <section className="bg-white rounded-lg border p-4 dark:bg-neutral-900">
        <h2 className="text-lg font-medium mb-3">Latest Signups</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Verified</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users?.latest?.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 break-all">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">
                    {u.isVerified ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-neutral-500">No</span>
                    )}
                  </td>
                  <td className="py-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {(!users?.latest || users.latest.length === 0) && (
                <tr>
                  <td className="py-3 text-neutral-500" colSpan={4}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border p-4 text-center dark:bg-neutral-900">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}


