import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  saveOfflineBooking, 
  hasPendingBookings, 
  isOnline 
} from '@/lib/offline-storage';

export function useOfflineBooking() {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasPending, setHasPending] = useState(false);
  const queryClient = useQueryClient();

  // Check for pending bookings
  const checkPendingBookings = useCallback(async () => {
    const pending = await hasPendingBookings();
    setHasPending(pending);
    return pending;
  }, []);

  // On mount and when online status changes
  useState(() => {
    checkPendingBookings();

    const handleOnline = () => {
      setIsOffline(false);
      // When coming back online, trigger background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => {
            registration.sync.register('sync-bookings');
          })
          .catch(err => console.error('Background sync registration failed:', err));
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkPendingBookings]);

  // Mutation for creating a booking that works offline
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (!isOnline()) {
        // If offline, save booking for later syncing
        await saveOfflineBooking(bookingData);
        throw new Error('OFFLINE_BOOKING');
      } else {
        // If online, proceed with API request
        const res = await apiRequest('POST', '/api/booking', bookingData);
        return await res.json();
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      toast({
        title: "Booking successful",
        description: "Your event has been booked successfully.",
      });
    },
    onError: (error: Error) => {
      if (error.message === 'OFFLINE_BOOKING') {
        // This is an expected "error" when offline
        setHasPending(true);
        toast({
          title: "Offline booking saved",
          description: "Your booking will be processed when you're back online.",
        });
      } else {
        toast({
          title: "Booking failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Explicitly attempt to sync pending bookings
  const syncPendingBookings = useCallback(async () => {
    if (!isOnline()) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to sync your bookings.",
        variant: "destructive",
      });
      return;
    }

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-bookings');
        toast({
          title: "Sync initiated",
          description: "Your pending bookings are being processed.",
        });
        // Re-check after a moment to see if sync was successful
        setTimeout(checkPendingBookings, 2000);
      } catch (err) {
        console.error('Error initiating sync:', err);
        toast({
          title: "Sync failed",
          description: "Could not sync your bookings. Please try again later.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Sync not supported",
        description: "Your browser doesn't support background synchronization.",
        variant: "destructive",
      });
    }
  }, [isOffline, toast, checkPendingBookings]);

  return {
    bookingMutation,
    isOffline,
    hasPending,
    syncPendingBookings,
    checkPendingBookings,
  };
}