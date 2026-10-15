/* Thin API client for the JAVID REAL ESTATE backend. */

const BASE = '/api'

function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.append(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function parse(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body, raw } = {}) {
  const init = { method, credentials: 'include', headers: {} }
  if (body instanceof FormData) {
    init.body = body
  } else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const response = await fetch(BASE + path, init)
  const data = await parse(response)

  if (!response.ok) {
    const detail = data && (data.detail || data.message)
    const error = new Error(
      typeof detail === 'string' && detail
        ? detail
        : 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.'
    )
    error.status = response.status
    error.payload = data
    throw error
  }

  return raw ? { data, response } : data
}

export const api = {
  getSettings: () => request('/settings'),
  getCategories: () => request('/categories'),
  getProperties: (params) => request(`/properties${buildQuery(params)}`),
  getProperty: (slug) => request(`/properties/${encodeURIComponent(slug)}`),
  createInquiry: (body) => request('/inquiries', { method: 'POST', body }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  admin: {
    stats: () => request('/admin/stats'),
    listProperties: (params) => request(`/admin/properties${buildQuery(params)}`),
    getProperty: (id) => request(`/admin/properties/${id}`),
    createProperty: (body) => request('/admin/properties', { method: 'POST', body }),
    updateProperty: (id, body) =>
      request(`/admin/properties/${id}`, { method: 'PUT', body }),
    deleteProperty: (id) =>
      request(`/admin/properties/${id}`, { method: 'DELETE' }),
    uploadImage: (file) => {
      const form = new FormData()
      form.append('file', file)
      return request('/admin/uploads', { method: 'POST', body: form })
    },
    listInquiries: (params) => request(`/admin/inquiries${buildQuery(params)}`),
    updateInquiry: (id, status) =>
      request(`/admin/inquiries/${id}`, { method: 'PATCH', body: { status } }),
    deleteInquiry: (id) =>
      request(`/admin/inquiries/${id}`, { method: 'DELETE' }),
    getSettings: () => request('/admin/settings'),
    updateSettings: (body) => request('/admin/settings', { method: 'PUT', body }),
    changePassword: (currentPassword, newPassword) =>
      request('/admin/password', {
        method: 'POST',
        body: { current_password: currentPassword, new_password: newPassword },
      }),
  },
}
