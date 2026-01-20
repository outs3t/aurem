import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'aurem-crm-offline';
const DB_VERSION = 1;

type StoreName = 'customers' | 'products' | 'contracts' | 'quotes' | 'tasks' | 'pending_sync';

interface PendingSync {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

// Open IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores for offline data
      const stores: StoreName[] = ['customers', 'products', 'contracts', 'quotes', 'tasks', 'pending_sync'];
      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

// Generic CRUD operations
async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putInStore<T extends { id: string }>(storeName: StoreName, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName: StoreName, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Add pending sync operation
async function addPendingSync(table: string, operation: 'insert' | 'update' | 'delete', data: any): Promise<void> {
  const pendingItem: PendingSync = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    table,
    operation,
    data,
    timestamp: Date.now()
  };
  await putInStore('pending_sync', pendingItem);
}

// Get pending sync operations
async function getPendingSync(): Promise<PendingSync[]> {
  return getAllFromStore<PendingSync>('pending_sync');
}

// Clear pending sync
async function clearPendingSync(): Promise<void> {
  await clearStore('pending_sync');
}

// Hook for offline storage with sync
export function useOfflineStorage<T extends { id: string }>(storeName: StoreName) {
  const [data, setData] = useState<T[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from IndexedDB
  const loadFromLocal = useCallback(async () => {
    try {
      const localData = await getAllFromStore<T>(storeName);
      setData(localData);
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
    }
  }, [storeName]);

  // Save data to IndexedDB
  const saveToLocal = useCallback(async (items: T[]) => {
    try {
      await clearStore(storeName);
      for (const item of items) {
        await putInStore(storeName, item);
      }
      setData(items);
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }, [storeName]);

  // Add item (with pending sync if offline)
  const addItem = useCallback(async (item: T, syncToCloud: boolean = true) => {
    await putInStore(storeName, item);
    
    if (!isOnline && syncToCloud) {
      await addPendingSync(storeName, 'insert', item);
      const pending = await getPendingSync();
      setPendingCount(pending.length);
    }
    
    await loadFromLocal();
  }, [storeName, isOnline, loadFromLocal]);

  // Update item
  const updateItem = useCallback(async (item: T, syncToCloud: boolean = true) => {
    await putInStore(storeName, item);
    
    if (!isOnline && syncToCloud) {
      await addPendingSync(storeName, 'update', item);
      const pending = await getPendingSync();
      setPendingCount(pending.length);
    }
    
    await loadFromLocal();
  }, [storeName, isOnline, loadFromLocal]);

  // Delete item
  const deleteItem = useCallback(async (id: string, syncToCloud: boolean = true) => {
    await deleteFromStore(storeName, id);
    
    if (!isOnline && syncToCloud) {
      await addPendingSync(storeName, 'delete', { id });
      const pending = await getPendingSync();
      setPendingCount(pending.length);
    }
    
    await loadFromLocal();
  }, [storeName, isOnline, loadFromLocal]);

  // Load pending count on mount
  useEffect(() => {
    loadFromLocal();
    getPendingSync().then(pending => setPendingCount(pending.length));
  }, [loadFromLocal]);

  return {
    data,
    isOnline,
    pendingCount,
    loadFromLocal,
    saveToLocal,
    addItem,
    updateItem,
    deleteItem,
    getPendingSync,
    clearPendingSync
  };
}

export { openDB, getAllFromStore, putInStore, deleteFromStore, clearStore, addPendingSync, getPendingSync, clearPendingSync };
export type { PendingSync };
