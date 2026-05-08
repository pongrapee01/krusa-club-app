import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase/client'

type Primitive = string | number | boolean | null
type QueryValue = Primitive | Primitive[]

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  query?: Record<string, QueryValue | undefined>
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function buildUrl(path: string, query?: ApiRequestOptions['query']) {
  const base = (env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${normalizedPath}`)
  if (!query) return url.toString()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item))
      }
      continue
    }
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    return session.access_token
  }

  const { data, error } = await supabase.auth.refreshSession()
  if (error) return null
  return data.session?.access_token ?? null
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

async function rawRequest(options: ApiRequestOptions, token: string | null) {
  const headers = new Headers(options.headers)
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(options.path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  const payload = await parseResponse(response)
  return { response, payload }
}

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const token = await getAccessToken()
  let { response, payload } = await rawRequest(options, token)

  // token หมดอายุหรือ session เปลี่ยนระหว่าง request ลอง refresh แล้ว retry 1 ครั้ง
  if (response.status === 401) {
    const { data, error } = await supabase.auth.refreshSession()
    const refreshedToken = error ? null : data.session?.access_token ?? null
    const retry = await rawRequest(options, refreshedToken)
    response = retry.response
    payload = retry.payload
  }

  if (!response.ok) {
    throw new ApiError(
      `API request failed (${response.status})`,
      response.status,
      payload,
    )
  }

  return payload as T
}

export const apiClient = {
  get: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, 'method' | 'path' | 'body'>,
  ) => apiRequest<T>({ method: 'GET', path, ...options }),

  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, 'method' | 'path' | 'body'>,
  ) => apiRequest<TResponse>({ method: 'POST', path, body, ...options }),

  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, 'method' | 'path' | 'body'>,
  ) => apiRequest<TResponse>({ method: 'PUT', path, body, ...options }),

  patch: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, 'method' | 'path' | 'body'>,
  ) => apiRequest<TResponse>({ method: 'PATCH', path, body, ...options }),

  delete: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, 'method' | 'path' | 'body'>,
  ) => apiRequest<T>({ method: 'DELETE', path, ...options }),
}
