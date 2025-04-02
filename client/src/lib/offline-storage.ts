// Utility to handle offline data storage and background sync for the LorgX PWA

const DB_NAME = 'lorgx-offline-db';
const DB_VERSION = 1;
const BOOKINGS_STORE = 'pending-bookings';
const AUTH_STORE = 'auth-data';
const EVENT_CACHE_STORE = 'event-cache';

interface DBSchema {
  [BOOKINGS_STORE]: {
    key: string;
    value: any;
  };
  [AUTH_STORE]: {
    key: string;
    value: any;
  };
  [EVENT_CACHE_STORE]: {
    key: string;
    value: any;
  };
}

// Open database connection
const openDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(BOOKINGS_STORE)) {
        db.createObjectStore(BOOKINGS_STORE, { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(EVENT_CACHE_STORE)) {
        const eventStore = db.createObjectStore(EVENT_CACHE_STORE, { keyPath: 'id' });
        eventStore.createIndex('categoryId', 'categoryId', { unique: false });
        eventStore.createIndex('date', 'startDate', { unique: false });
      }
    };
  });
};

// Generic function to add an item to any store
export const addItem = async <T>(storeName: keyof DBSchema, item: T): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = (event) => {
      console.error(`Error adding item to ${storeName}:`, event);
      reject(`Error adding item to ${storeName}`);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Generic function to get all items from a store
export const getAllItems = async <T>(storeName: keyof DBSchema): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = (event) => {
      console.error(`Error getting items from ${storeName}:`, event);
      reject(`Error getting items from ${storeName}`);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Generic function to get a single item from a store
export const getItem = async <T>(storeName: keyof DBSchema, key: string | number): Promise<T | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result as T || null);
    };

    request.onerror = (event) => {
      console.error(`Error getting item from ${storeName}:`, event);
      reject(`Error getting item from ${storeName}`);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Generic function to update an item in a store
export const updateItem = async <T>(storeName: keyof DBSchema, item: T): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = (event) => {
      console.error(`Error updating item in ${storeName}:`, event);
      reject(`Error updating item in ${storeName}`);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Generic function to delete an item from a store
export const deleteItem = async (storeName: keyof DBSchema, key: string | number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error deleting item from ${storeName}:`, event);
      reject(`Error deleting item from ${storeName}`);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Function to save authentication data
export const saveAuthData = async (userData: any): Promise<void> => {
  await updateItem(AUTH_STORE, { key: 'currentUser', value: userData });
};

// Function to get authentication data
export const getAuthData = async (): Promise<any | null> => {
  try {
    const data = await getItem(AUTH_STORE, 'currentUser');
    return data ? data.value : null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Function to clear authentication data (logout)
export const clearAuthData = async (): Promise<void> => {
  try {
    await deleteItem(AUTH_STORE, 'currentUser');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Function to save a booking for offline processing
export const saveOfflineBooking = async (bookingData: any): Promise<void> => {
  try {
    await addItem(BOOKINGS_STORE, {
      ...bookingData,
      createdAt: new Date(),
      status: 'pending',
      isSynced: false
    });
    
    // Request background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-bookings');
    }
  } catch (error) {
    console.error('Error saving offline booking:', error);
  }
};

// Function to check if there are pending offline bookings
export const hasPendingBookings = async (): Promise<boolean> => {
  try {
    const bookings = await getAllItems(BOOKINGS_STORE);
    return bookings.length > 0;
  } catch (error) {
    console.error('Error checking pending bookings:', error);
    return false;
  }
};

// Function to cache events for offline viewing
export const cacheEvents = async (events: any[]): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(EVENT_CACHE_STORE, 'readwrite');
    const store = transaction.objectStore(EVENT_CACHE_STORE);
    
    // Clear old cache
    store.clear();
    
    // Add new events to cache
    for (const event of events) {
      store.add({
        ...event,
        cachedAt: new Date()
      });
    }
    
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject();
      };
    });
  } catch (error) {
    console.error('Error caching events:', error);
  }
};

// Function to get cached events
export const getCachedEvents = async (): Promise<any[]> => {
  try {
    return await getAllItems(EVENT_CACHE_STORE);
  } catch (error) {
    console.error('Error getting cached events:', error);
    return [];
  }
};

// Function to get cached events by category
export const getCachedEventsByCategory = async (categoryId: number): Promise<any[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENT_CACHE_STORE, 'readonly');
      const store = transaction.objectStore(EVENT_CACHE_STORE);
      const index = store.index('categoryId');
      const request = index.getAll(categoryId);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting events by category:', event);
        reject([]);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error getting cached events by category:', error);
    return [];
  }
};

// Check if we're online
export const isOnline = (): boolean => {
  return navigator.onLine;
};