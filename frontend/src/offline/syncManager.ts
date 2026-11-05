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
    const item = await offlineDB.addToQueue({
      type,
      endpoint,
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

  /**
   * Menghitung jumlah item yang belum disinkronkan
   */
  public async getPendingCount(): Promise<number> {
    try {
      const items = await offlineDB.getQueue('pending')
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

  /**
   * Memproses antrean sinkronisasi
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
      const pendingItems = await offlineDB.getQueue('pending')
      this.notify({ type: 'sync_start', pendingCount: pendingItems.length })

      const token = authService.getAccessToken()

      for (const item of pendingItems) {
        if (!item.id) continue

        await offlineDB.updateQueueItem(item.id, { status: 'syncing' })

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(item.headers || {}),
          }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const response = await fetch(item.endpoint, {
            method: item.method,
            headers,
            body: JSON.stringify(item.payload),
          })

          if (response.ok) {
            // Berhasil disinkronkan ke backend
            await offlineDB.deleteQueueItem(item.id)
            successCount++
            const currentPending = await this.getPendingCount()
            this.notify({ type: 'sync_item_success', item, pendingCount: currentPending })
          } else {
            // Gagal dari backend (e.g. 400, 422, 500)
            const errBody = await response.json().catch(() => ({}))
            const errorMsg = errBody.detail || `HTTP ${response.status} ${response.statusText}`
            const newRetryCount = (item.retryCount || 0) + 1

            await offlineDB.updateQueueItem(item.id, {
              status: newRetryCount >= 3 ? 'failed' : 'pending',
              error: errorMsg,
              retryCount: newRetryCount,
            })

            failedCount++
            const currentPending = await this.getPendingCount()
            this.notify({ type: 'sync_item_failed', item, pendingCount: currentPending, error: errorMsg })
          }
        } catch (networkErr: unknown) {
          // Kesalahan koneksi jaringan saat mencoba fetch
          const msg = networkErr instanceof Error ? networkErr.message : 'Network error'
          await offlineDB.updateQueueItem(item.id, {
            status: 'pending',
            error: `Jaringan terputus: ${msg}`,
          })
          failedCount++
          break // Hentikan batch jika koneksi putus kembali
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
