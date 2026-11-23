/**
 * Shared API Base URL Resolver
 * Guarantees that in production (e.g. bandanaira.cloud) all requests use the current domain (/api/v1)
 * while in local development (localhost) it can fall back to VITE_API_BASE_URL or port 8005.
 */
export const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.')
    
    if (isLocal) {
      const envUrl = import.meta.env?.VITE_API_BASE_URL
      if (envUrl && envUrl.startsWith('http')) return envUrl
      return `http://${window.location.hostname}:8005/api/v1`
    }
    // On production domain (bandanaira.cloud, etc.), ALWAYS use relative origin
    return `${window.location.origin}/api/v1`
  }
  return import.meta.env?.VITE_API_BASE_URL || '/api/v1'
}
