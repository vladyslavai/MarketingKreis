export const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api"

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase}${path.startsWith('/') ? path : '/' + path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    credentials: 'include',
    cache: 'no-store',
  })
  if (!res.ok) {
    let msg = res.statusText
    try { const j = await res.json(); msg = j?.detail || j?.error || msg } catch {}
    throw new Error(msg)
  }
  try { return await res.json() as T } catch { return undefined as unknown as T }
}

export const authFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const res = await fetch(`${apiBase}${path.startsWith('/') ? path : '/' + path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    credentials: 'include',
    cache: 'no-store',
  })
  return res
}

export const companiesAPI = {
  getAll: () => request<any[]>(`/crm/companies`),
  getById: (id: string) => request<any>(`/crm/companies/${id}`),
  create: (data: any) => request(`/crm/companies`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/crm/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/crm/companies/${id}`, { method: 'DELETE' }),
}

export const contactsAPI = {
  getAll: () => request<any[]>(`/crm/contacts`),
}

export const dealsAPI = {
  getAll: () => request<any[]>(`/crm/deals`),
}

export const crmAPI = {
  getStats: () => request<any>(`/crm/stats`),
}

// User Categories persisted in backend
export type UserCategory = {
  id?: number
  name: string
  color: string
  position?: number
}

export const userCategoriesAPI = {
  get: () => request<UserCategory[]>(`/user/categories`),
  put: (categories: UserCategory[]) =>
    request<UserCategory[]>(`/user/categories`, {
      method: "PUT",
      body: JSON.stringify({ categories }),
    }),
}


