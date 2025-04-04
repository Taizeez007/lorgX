
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

export function useSavedItems() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch saved events
  const { 
    data: savedEvents = [],
    isLoading: isLoadingSavedEvents,
    isError: isSavedEventsError,
    refetch: refetchSavedEvents
  } = useQuery({
    queryKey: ['/api/user/saved-events'],
    enabled: isAuthenticated,
  });
  
  // Fetch saved places
  const { 
    data: savedPlaces = [],
    isLoading: isLoadingSavedPlaces,
    isError: isSavedPlacesError,
    refetch: refetchSavedPlaces
  } = useQuery({
    queryKey: ['/api/user/saved-places'],
    enabled: isAuthenticated,
  });

  // Save event mutation
  const saveEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/save`);
      if (!response.ok) {
        throw new Error('Failed to save event');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event added to saved items',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save event',
        variant: 'destructive',
      });
    },
  });

  // Unsave event mutation
  const unsaveEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}/save`);
      if (!response.ok) {
        throw new Error('Failed to unsave event');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event removed from saved items',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unsave event',
        variant: 'destructive',
      });
    },
  });

  // Save place mutation
  const savePlaceMutation = useMutation({
    mutationFn: async (placeId: number) => {
      const response = await apiRequest('POST', `/api/places/${placeId}/save`);
      if (!response.ok) {
        throw new Error('Failed to save place');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Place added to saved items',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-places'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save place',
        variant: 'destructive',
      });
    },
  });

  // Unsave place mutation
  const unsavePlaceMutation = useMutation({
    mutationFn: async (placeId: number) => {
      const response = await apiRequest('DELETE', `/api/places/${placeId}/save`);
      if (!response.ok) {
        throw new Error('Failed to unsave place');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Place removed from saved items',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-places'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unsave place',
        variant: 'destructive',
      });
    },
  });
  
  // Helper function to check if an event is saved
  const isEventSaved = (eventId: number): boolean => {
    return savedEvents.some(event => event.id === eventId);
  };
  
  // Helper function to check if a place is saved
  const isPlaceSaved = (placeId: number): boolean => {
    return savedPlaces.some(place => place.id === placeId);
  };
  
  // Toggle save/unsave event
  const toggleSaveEvent = (eventId: number) => {
    if (isEventSaved(eventId)) {
      unsaveEventMutation.mutate(eventId);
    } else {
      saveEventMutation.mutate(eventId);
    }
  };
  
  // Toggle save/unsave place
  const toggleSavePlace = (placeId: number) => {
    if (isPlaceSaved(placeId)) {
      unsavePlaceMutation.mutate(placeId);
    } else {
      savePlaceMutation.mutate(placeId);
    }
  };

  return {
    savedEvents,
    savedPlaces,
    isLoadingSavedEvents,
    isLoadingSavedPlaces,
    isSavedEventsError,
    isSavedPlacesError,
    saveEvent: saveEventMutation.mutate,
    unsaveEvent: unsaveEventMutation.mutate,
    savePlace: savePlaceMutation.mutate,
    unsavePlace: unsavePlaceMutation.mutate,
    isEventSaved,
    isPlaceSaved,
    toggleSaveEvent,
    toggleSavePlace,
    refetchSavedEvents,
    refetchSavedPlaces
  };
}
