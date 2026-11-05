// Banda Digital Ecosystem - Native IndexedDB Client (Zero external dependencies)

export interface SyncQueueItem {
  id?: number
  type: 'harvest_create' | 'event_create' | 'resident_create' | 'farm_create' | 'custom'
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH'
  payload: Record<string, unknown>
  headers?: Record<string, string>
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  error?: string
  retryCount: number
  createdAt: string
  description?: string
}

export interface CachedDataRecord {
  key: string
  data: unknown
  updatedAt: string
}

const DB_NAME = 'BandaDigitalOfflineDB'
const DB_VERSION = 1
const QUEUE_STORE = 'sync_queue'
const CACHE_STORE = 'cached_data'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung pada browser ini.'))
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Store 1: Offline Sync Queue
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = db.createObjectStore(QUEUE_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        queueStore.createIndex('status', 'status', { unique: false })
        queueStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Store 2: Offline Cache for offline browsing
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, {
          keyPath: 'key',
        })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const offlineDB = {
  /**
   * Menambahkan item ke antrean sinkronisasi offline
   */
  async addToQueue(
    item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount' | 'status'> & {
      retryCount?: number
      status?: 'pending' | 'syncing' | 'synced' | 'failed'
      createdAt?: string
    }
  ): Promise<SyncQueueItem> {
    const db = await openDB()
    const fullItem: Omit<SyncQueueItem, 'id'> = {
      ...item,
      status: item.status || 'pending',
      retryCount: item.retryCount || 0,
      createdAt: item.createdAt || new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite')
      const store = tx.objectStore(QUEUE_STORE)
      const request = store.add(fullItem)

      request.onsuccess = () => {
        const assignedId = request.result as number
        resolve({ ...fullItem, id: assignedId })
      }
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Mengambil semua item dalam antrean sinkronisasi
   */
  async getQueue(filterStatus?: 'pending' | 'syncing' | 'synced' | 'failed'): Promise<SyncQueueItem[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly')
      const store = tx.objectStore(QUEUE_STORE)

      let request: IDBRequest<SyncQueueItem[]>
      if (filterStatus) {
        const index = store.index('status')
        request = index.getAll(filterStatus)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Mengubah status atau data item dalam antrean
   */
  async updateQueueItem(id: number, patch: Partial<SyncQueueItem>): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite')
      const store = tx.objectStore(QUEUE_STORE)
      const getReq = store.get(id)

      getReq.onsuccess = () => {
        const current = getReq.result
        if (!current) {
          return reject(new Error(`Item dengan ID ${id} tidak ditemukan di antrean offline.`))
        }
        const updated = { ...current, ...patch }
        const putReq = store.put(updated)
        putReq.onsuccess = () => resolve()
        putReq.onerror = () => reject(putReq.error)
      }
      getReq.onerror = () => reject(getReq.error)
    })
  },

  /**
   * Menghapus item dari antrean setelah sukses disinkronkan
   */
  async deleteQueueItem(id: number): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite')
      const store = tx.objectStore(QUEUE_STORE)
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Mengosongkan seluruh antrean (misal saat reset)
   */
  async clearQueue(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite')
      const store = tx.objectStore(QUEUE_STORE)
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Menyimpan data cache untuk akses offline
   */
  async cacheData(key: string, data: unknown): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE, 'readwrite')
      const store = tx.objectStore(CACHE_STORE)
      const record: CachedDataRecord = {
        key,
        data,
        updatedAt: new Date().toISOString(),
      }
      const request = store.put(record)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Mengambil data cache
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE, 'readonly')
      const store = tx.objectStore(CACHE_STORE)
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result as CachedDataRecord | undefined
        resolve(result ? (result.data as T) : null)
      }
      request.onerror = () => reject(request.error)
    })
  },
}
