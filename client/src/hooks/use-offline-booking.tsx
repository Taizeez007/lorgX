import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  addItem, 
  getAllItems, 
  isOnline,
  deleteItem
} from '@/lib/offline-storage';

// Interface for the hook's return value
interface OfflineBookingHook {
  pendingBookings: any[];
  pendingPayments: any[];
  hasPendingData: boolean;
  isSyncing: boolean;
  syncAllPendingData: () => Promise<void>;
  isOnline: boolean;
}

export function useOfflineBooking(): OfflineBookingHook {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const { toast } = useToast();

  // Load pending data from IndexedDB
  const loadPendingData = useCallback(async () => {
    try {
      const bookings = await getAllItems("bookings");
      const payments = await getAllItems("offline-payments");
      
      setPendingBookings(bookings || []);
      setPendingPayments(payments || []);
    } catch (error) {
      console.error('Error loading pending offline data:', error);
    }
  }, []);

  // Register service worker for background sync
  const registerSyncEvents = useCallback(async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Register background sync for bookings and payments
        registration.sync.register('sync-bookings');
        registration.sync.register('sync-payments');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }, []);

  // Sync all pending data manually
  const syncAllPendingData = async () => {
    if (!isOnline()) {
      toast({
        title: 'You are offline',
        description: 'Please connect to the internet to sync your data',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);

    try {
      // Process pending bookings
      for (const booking of pendingBookings) {
        try {
          // Send booking to server
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(booking),
          });

          if (response.ok) {
            // Remove from IndexedDB if successful
            await deleteItem("bookings", booking.id);
          }
        } catch (error) {
          console.error('Error syncing booking:', error);
        }
      }

      // Process pending payments
      for (const payment of pendingPayments) {
        try {
          // Send payment to server
          const response = await fetch('/api/payments/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payment),
          });

          if (response.ok) {
            // Remove from IndexedDB if successful
            await deleteItem("offline-payments", payment.id);
          }
        } catch (error) {
          console.error('Error syncing payment:', error);
        }
      }

      // Reload pending data
      await loadPendingData();

      toast({
        title: 'Sync Complete',
        description: 'Your bookings and payments have been synchronized',
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to synchronize your data. Please try again later.',
        variant: 'destructive',
      });
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save a booking locally when offline
  const saveOfflineBooking = async (bookingData: any) => {
    try {
      await addItem("bookings", {
        ...bookingData,
        id: `offline-booking-${Date.now()}`,
        createdAt: new Date(),
        status: 'pending',
        synced: false
      });
      
      toast({
        title: 'Booking Saved Offline',
        description: 'Your booking will be processed once you are back online',
      });
      
      await loadPendingData();
    } catch (error) {
      console.error('Error saving offline booking:', error);
      toast({
        title: 'Error Saving Booking',
        description: 'Failed to save your booking offline',
        variant: 'destructive',
      });
    }
  };

  // Save payment information locally when offline
  const saveOfflinePayment = async (paymentData: any) => {
    try {
      await addItem("offline-payments", {
        ...paymentData,
        id: `offline-payment-${Date.now()}`,
        createdAt: new Date(),
        processed: false
      });
      
      toast({
        title: 'Payment Saved Offline',
        description: 'Your payment will be processed once you are back online',
      });
      
      await loadPendingData();
    } catch (error) {
      console.error('Error saving offline payment:', error);
      toast({
        title: 'Error Saving Payment',
        description: 'Failed to save your payment offline',
        variant: 'destructive',
      });
    }
  };

  // Check network status and load pending data on mount
  useEffect(() => {
    loadPendingData();
    registerSyncEvents();
    
    // Add event listeners for online/offline status
    const handleOnline = () => {
      setNetworkStatus(true);
      // Optionally auto-sync when going online
      // syncAllPendingData();
    };
    
    const handleOffline = () => {
      setNetworkStatus(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingData, registerSyncEvents]);

  return {
    pendingBookings,
    pendingPayments,
    hasPendingData: pendingBookings.length > 0 || pendingPayments.length > 0,
    isSyncing,
    syncAllPendingData,
    isOnline: networkStatus
  };
}