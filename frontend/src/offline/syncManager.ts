// Banda Digital Ecosystem - Offline Sync Manager

import { offlineDB, SyncQueueItem } from './db'
import { authService } from '../services/auth'

export type { SyncQueueItem }

export type SyncEventListener = (event: {
  type: 'queued' | 'sync_start' | 'sync_item_success' | 'sync_item_failed' | 'sync_complete'
  item?: SyncQueueItem
  pendingCount: number
  error?: string
}) => void

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function extractApiPrefix(endpoint: string): string {
  const match = endpoint.match(/^(.*\/api\/v1)/)
  if (match) return match[1]
  return import.meta.env.VITE_API_BASE_URL || '/api/v1'
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint.replace(/\/farmers\/farms(?=$|\?)/, '/farms')
}

function serializeErrorMessage(errBody: any, status: number, statusText: string): string {
  if (errBody && errBody.detail !== undefined && errBody.detail !== null) {
    if (typeof errBody.detail === 'string') return errBody.detail
    if (Array.isArray(errBody.detail)) {
      const msgs = errBody.detail
        .map((e: any) => {
          if (typeof e === 'string') return e
          const field = Array.isArray(e?.loc) ? e.loc.slice(1).join('.') : ''
          return field && e?.msg ? `${field}: ${e.msg}` : e?.msg || JSON.stringify(e)
        })
        .filter(Boolean)
      if (msgs.length > 0) return msgs.join('; ')
    }
    return JSON.stringify(errBody.detail)
  }
  return `HTTP ${status} ${statusText}`
}

async function fetchFirstId(apiPrefix: string, resourcePath: string, token: string | null): Promise<string | null> {
  try {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${apiPrefix}${resourcePath}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    return items[0]?.id || null
  } catch {
    return null
  }
}

async function healQueuedPayload(
  type: SyncQueueItem['type'],
  endpoint: string,
  rawPayload: Record<string, unknown>,
  token: string | null
): Promise<{ endpoint: string; payload: Record<string, unknown> }> {
  const fixedEndpoint = normalizeEndpoint(endpoint)
  const payload: Record<string, unknown> = { ...rawPayload }
  const apiPrefix = extractApiPrefix(fixedEndpoint)

  if (type === 'resident_create') {
    if (!payload.village) {
      payload.village = 'Banda Neira'
    }
  } else if (type === 'farm_create') {
    const curFarmerId = String(payload.farmer_id || '')
    if (!UUID_REGEX.test(curFarmerId)) {
      const validFarmerId = await fetchFirstId(apiPrefix, '/farmers?limit=1', token)
      if (validFarmerId) {
        payload.farmer_id = validFarmerId
      }
    }
  } else if (type === 'harvest_create') {
    const curFarmerId = String(payload.farmer_id || '')
    if (!UUID_REGEX.test(curFarmerId)) {
      const validFarmerId = await fetchFirstId(apiPrefix, '/farmers?limit=1', token)
      if (validFarmerId) {
        payload.farmer_id = validFarmerId
      }
    }
    const curFarmId = String(payload.farm_id || '')
    if (!UUID_REGEX.test(curFarmId)) {
      const validFarmId = await fetchFirstId(apiPrefix, '/farms?limit=1', token)
      if (validFarmId) {
        payload.farm_id = validFarmId
      }
    }
  }

  return { endpoint: fixedEndpoint, payload }
}

class SyncManager {
  private isSyncing = false
  private listeners: Set<SyncEventListener> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[Banda PWA] Jaringan terhubung kembali, memproses antrean offline...')
        this.processSync()
      })
    }
  }

  public subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(event: {
    type: 'queued' | 'sync_start' | 'sync_item_success' | 'sync_item_failed' | 'sync_complete'
    item?: SyncQueueItem
    pendingCount: number
    error?: string
  }) {
    this.listeners.forEach((cb) => {
      try {
        cb(event)
      } catch (err) {
        console.error('[Banda PWA] Listener error:', err)
      }
    })
  }

  /**
   * Menambahkan aksi ke antrean offline
   */
  public async enqueue(
    type: SyncQueueItem['type'],
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH',
    payload: Record<string, unknown>,
    description?: string
  ): Promise<SyncQueueItem> {
    const cleanEndpoint = normalizeEndpoint(endpoint)
    const item = await offlineDB.addToQueue({
      type,
      endpoint: cleanEndpoint,
      method,
      payload,
      description: description || `Aksi ${type} (${new Date().toLocaleTimeString('id-ID')})`,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    })

    const pending = await this.getPendingCount()
    this.notify({ type: 'queued', item, pendingCount: pending })
    return item
  }

  private async getUnsyncedItems(): Promise<SyncQueueItem[]> {
    const all = await offlineDB.getQueue()
    return all.filter(
      (item) => item.status === 'pending' || item.status === 'failed' || item.status === 'syncing'
    )
  }

  /**
   * Menghitung jumlah item yang belum disinkronkan (pending, syncing, atau failed siap retry)
   */
  public async getPendingCount(): Promise<number> {
    try {
      const items = await this.getUnsyncedItems()
      return items.length
    } catch {
      return 0
    }
  }

  /**
   * Mengambil semua item antrean
   */
  public async getAllQueue(): Promise<SyncQueueItem[]> {
    return offlineDB.getQueue()
  }

  private async postWithAuth(
    endpoint: string,
    method: SyncQueueItem['method'],
    payload: Record<string, unknown>,
    customHeaders: Record<string, string> | undefined,
    token: string | null
  ): Promise<{ response: Response; token: string | null }> {
    let activeToken = token
    const doFetch = (tk: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customHeaders || {}),
      }
      if (tk) {
        headers['Authorization'] = `Bearer ${tk}`
      }
      return fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      })
    }

    let response = await doFetch(activeToken)
    if (response.status === 401) {
      const refreshed = await authService.ensureValidToken(true)
      if (refreshed) {
        activeToken = refreshed
        response = await doFetch(activeToken)
      }
    }
    return { response, token: activeToken }
  }

  /**
   * Memproses antrean sinkronisasi (termasuk retry item yang sebelumnya gagal)
   */
  public async processSync(): Promise<{ success: number; failed: number; total: number }> {
    if (this.isSyncing) {
      console.log('[Banda PWA] Proses sinkronisasi sedang berjalan, lewati pemicu ganda.')
      const pendingCount = await this.getPendingCount()
      return { success: 0, failed: 0, total: pendingCount }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[Banda PWA] Masih offline, tidak dapat memproses antrean.')
      const pendingCount = await this.getPendingCount()
      return { success: 0, failed: 0, total: pendingCount }
    }

    this.isSyncing = true
    let successCount = 0
    let failedCount = 0

    try {
      const pendingItems = await this.getUnsyncedItems()
      this.notify({ type: 'sync_start', pendingCount: pendingItems.length })

      let token = await authService.ensureValidToken()

      for (const item of pendingItems) {
        if (!item.id) continue

        await offlineDB.updateQueueItem(item.id, { status: 'syncing' })

        try {
          const healed = await healQueuedPayload(item.type, item.endpoint, item.payload, token)
          const endpoint = healed.endpoint
          let payload = healed.payload

          let { response, token: nextToken } = await this.postWithAuth(
            endpoint,
            item.method,
            payload,
            item.headers,
            token
          )
          token = nextToken

          // Tangani 409 Conflict secara otomatis agar antrean tidak macet
          if (response.status === 409) {
            if (item.type === 'resident_create') {
              await offlineDB.deleteQueueItem(item.id)
              successCount++
              const currentPending = await this.getPendingCount()
              this.notify({ type: 'sync_item_success', item, pendingCount: currentPending })
              continue
            }
            if (item.type === 'farm_create' || item.type === 'harvest_create') {
              const suffix = String(Date.now()).slice(-4)
              if (item.type === 'farm_create' && payload.farm_code) {
                payload = { ...payload, farm_code: `${payload.farm_code}-${suffix}` }
              } else if (item.type === 'harvest_create' && payload.harvest_code) {
                payload = { ...payload, harvest_code: `${payload.harvest_code}-${suffix}` }
              }
              const retryRes = await this.postWithAuth(endpoint, item.method, payload, item.headers, token)
              response = retryRes.response
              token = retryRes.token
            }
          }

          if (response.ok) {
            await offlineDB.deleteQueueItem(item.id)
            successCount++
            const currentPending = await this.getPendingCount()
            this.notify({ type: 'sync_item_success', item, pendingCount: currentPending })
          } else {
            const errBody = await response.json().catch(() => ({}))
            const errorMsg = serializeErrorMessage(errBody, response.status, response.statusText)
            const newRetryCount = (item.retryCount || 0) + 1

            await offlineDB.updateQueueItem(item.id, {
              endpoint,
              payload,
              status: 'failed',
              error: errorMsg,
              retryCount: newRetryCount,
            })

            failedCount++
            const currentPending = await this.getPendingCount()
            this.notify({ type: 'sync_item_failed', item, pendingCount: currentPending, error: errorMsg })
          }
        } catch (networkErr: unknown) {
          const msg = networkErr instanceof Error ? networkErr.message : 'Network error'
          await offlineDB.updateQueueItem(item.id, {
            status: 'pending',
            error: `Jaringan terputus: ${msg}`,
          })
          failedCount++
          break
        }
      }

      const finalPending = await this.getPendingCount()
      this.notify({ type: 'sync_complete', pendingCount: finalPending })
      return { success: successCount, failed: failedCount, total: pendingItems.length }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Menghapus item tertentu dari antrean (misal item gagal yang dibatalkan user)
   */
  public async removeItem(id: number): Promise<void> {
    await offlineDB.deleteQueueItem(id)
    const pending = await this.getPendingCount()
    this.notify({ type: 'queued', pendingCount: pending })
  }

  /**
   * Mengosongkan seluruh antrean
   */
  public async clearAll(): Promise<void> {
    await offlineDB.clearQueue()
    this.notify({ type: 'queued', pendingCount: 0 })
  }
}

export const syncManager = new SyncManager()
