// Constants for IndexedDB
const DB_NAME = "lorgx_offline_db";
const DB_VERSION = 1;

// Store names
export const EVENT_CACHE_STORE = "event_cache";
export const BOOKINGS_STORE = "bookings";
export const AUTH_STORE = "auth_data";
export const OFFLINE_PAYMENTS_STORE = "offline_payments";

// Define the database schema
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
  [OFFLINE_PAYMENTS_STORE]: {
    key: string;
    value: any;
  };
}

// Open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Error opening IndexedDB");
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    // Create object stores when the database is first created
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(EVENT_CACHE_STORE)) {
        db.createObjectStore(EVENT_CACHE_STORE, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(BOOKINGS_STORE)) {
        db.createObjectStore(BOOKINGS_STORE, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(OFFLINE_PAYMENTS_STORE)) {
        db.createObjectStore(OFFLINE_PAYMENTS_STORE, { keyPath: "id" });
      }
    };
  });
};

/**
 * Add an item to a store
 * @param storeName The name of the store
 * @param item The item to add
 * @returns A promise that resolves to the added item
 */
export const addItem = async <T>(storeName: keyof DBSchema, item: T): Promise<T> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = () => {
      console.error(`Error adding item to ${storeName}`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Get all items from a store
 * @param storeName The name of the store
 * @returns A promise that resolves to an array of items
 */
export const getAllItems = async <T>(storeName: keyof DBSchema): Promise<T[]> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error(`Error getting items from ${storeName}`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Get an item from a store by key
 * @param storeName The name of the store
 * @param key The key to look up
 * @returns A promise that resolves to the item or null if not found
 */
export const getItem = async <T>(storeName: keyof DBSchema, key: string | number): Promise<T | null> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      console.error(`Error getting item from ${storeName}`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Update an item in a store
 * @param storeName The name of the store
 * @param item The item to update
 * @returns A promise that resolves to the updated item
 */
export const updateItem = async <T>(storeName: keyof DBSchema, item: T): Promise<T> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = () => {
      console.error(`Error updating item in ${storeName}`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Delete an item from a store
 * @param storeName The name of the store
 * @param key The key to delete
 */
export const deleteItem = async (storeName: keyof DBSchema, key: string | number): Promise<void> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error deleting item from ${storeName}`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Save auth data for offline use
 * @param userData User data to be cached
 */
export const saveAuthData = async (userData: any): Promise<void> => {
  try {
    await addItem(AUTH_STORE, {
      id: "current_user",
      value: userData,
      timestamp: Date.now()
    });
    console.log("User data cached for offline use");
  } catch (error) {
    console.error("Failed to cache user data:", error);
  }
};

/**
 * Get cached auth data
 * @returns Cached user data or null if not found
 */
export const getAuthData = async (): Promise<any | null> => {
  try {
    const cachedData = await getItem(AUTH_STORE, "current_user");
    return cachedData ? cachedData.value : null;
  } catch (error) {
    console.error("Failed to retrieve cached user data:", error);
    return null;
  }
};

/**
 * Clear cached auth data
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await deleteItem(AUTH_STORE, "current_user");
    console.log("Cached user data cleared");
  } catch (error) {
    console.error("Failed to clear cached user data:", error);
  }
};

/**
 * Save a booking for offline processing
 * @param bookingData The booking data to save
 */
export const saveOfflineBooking = async (bookingData: any): Promise<void> => {
  try {
    await addItem(BOOKINGS_STORE, {
      ...bookingData,
      id: `offline-booking-${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
      synced: false
    });
    
    // Try to register background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      registration.sync.register('sync-bookings');
    }
    
    console.log("Booking saved for offline processing");
  } catch (error) {
    console.error("Failed to save offline booking:", error);
  }
};

/**
 * Save payment information for offline processing
 * @param paymentData The payment data to save
 */
export const saveOfflinePayment = async (paymentData: any): Promise<void> => {
  try {
    await addItem(OFFLINE_PAYMENTS_STORE, {
      ...paymentData,
      id: `offline-payment-${Date.now()}`,
      createdAt: new Date(),
      processed: false
    });
    
    // Try to register background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      registration.sync.register('sync-payments');
    }
    
    console.log("Payment saved for offline processing");
  } catch (error) {
    console.error("Failed to save offline payment:", error);
  }
};

/**
 * Check if there are any pending bookings
 * @returns True if there are pending bookings
 */
export const hasPendingBookings = async (): Promise<boolean> => {
  try {
    const bookings = await getAllItems(BOOKINGS_STORE);
    return bookings && bookings.length > 0;
  } catch (error) {
    console.error("Failed to check for pending bookings:", error);
    return false;
  }
};

/**
 * Cache events for offline browsing
 * @param events Array of events to cache
 */
export const cacheEvents = async (events: any[]): Promise<void> => {
  try {
    // Clear existing cache first to prevent duplicates
    const db = await openDB();
    const transaction = db.transaction(EVENT_CACHE_STORE, "readwrite");
    const store = transaction.objectStore(EVENT_CACHE_STORE);
    
    // Clear all events
    store.clear();
    
    // Add all events
    for (const event of events) {
      store.add({
        ...event,
        cachedAt: new Date()
      });
    }
    
    transaction.oncomplete = () => {
      console.log(`Cached ${events.length} events for offline browsing`);
      db.close();
    };
    
    transaction.onerror = () => {
      console.error("Failed to cache events:", transaction.error);
      db.close();
    };
  } catch (error) {
    console.error("Failed to cache events:", error);
  }
};

/**
 * Get cached events for offline browsing
 * @returns Array of cached events
 */
export const getCachedEvents = async (): Promise<any[]> => {
  try {
    return await getAllItems(EVENT_CACHE_STORE);
  } catch (error) {
    console.error("Failed to retrieve cached events:", error);
    return [];
  }
};

/**
 * Get cached events filtered by category
 * @param categoryId The category ID to filter by
 * @returns Array of cached events in the specified category
 */
export const getCachedEventsByCategory = async (categoryId: number): Promise<any[]> => {
  try {
    const events = await getAllItems(EVENT_CACHE_STORE);
    return events.filter(event => event.categoryId === categoryId);
  } catch (error) {
    console.error("Failed to retrieve cached events by category:", error);
    return [];
  }
};

/**
 * Check if the device is currently online
 * @returns True if the device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};