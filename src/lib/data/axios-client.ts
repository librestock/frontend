import axios, { type AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Redirect to login on unauthorized responses, unless already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export async function getAxiosInstance<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await axiosInstance.request<T>(config)
  return response.data
}

export async function apiGet<T>(
  url: string,
  params?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await axiosInstance.get<T>(url, { params, signal })
  return response.data
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.post<T>(url, data)
  return response.data
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.put<T>(url, data)
  return response.data
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.patch<T>(url, data)
  return response.data
}

export async function apiDelete<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.delete<T>(url, { data })
  return response.data
}
