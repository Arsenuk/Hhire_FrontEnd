const fallbackApiOrigin = 'http://localhost:3000'
const envApiOrigin = import.meta.env.VITE_API_ORIGIN?.trim()

export const API_ORIGIN = (envApiOrigin || fallbackApiOrigin).replace(/\/+$/, '')
export const API_BASE_URL = `${API_ORIGIN}/api`
