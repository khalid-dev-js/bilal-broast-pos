const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bilal-broast-backend.vercel.app/api'

export type ApiResponse<T> = { success: boolean; message?: string; data: T; errors?: Array<{ field?: string; message: string }> }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const requestUrl = typeof window === 'undefined' ? `${API_BASE_URL}${path}` : `/api/backend${path}`
  const response = await fetch(requestUrl, {
    ...options,
    credentials: 'include',
    headers: isFormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
  })
  const payload = await response.json().catch(() => ({})) as ApiResponse<T> & { message?: string }
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed with status ${response.status}`) as Error & { status?: number; errors?: ApiResponse<T>['errors'] }
    error.status = response.status
    error.errors = payload.errors
    throw error
  }
  return payload.data ?? payload as unknown as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', ...(body === undefined ? {} : { body: JSON.stringify(body) }) }),
}

export { API_BASE_URL }
