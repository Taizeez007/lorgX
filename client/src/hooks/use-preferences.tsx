import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function usePreferences() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch user preferences
  const {
    data: preferences,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      if (!user) return {};
      
      const res = await apiRequest("GET", "/api/user/preferences");
      if (!res.ok) {
        throw new Error("Failed to fetch preferences");
      }
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      const res = await apiRequest("PUT", "/api/user/preferences", newPreferences);
      if (!res.ok) {
        throw new Error("Failed to update preferences");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/recommended"] });
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Fetch recommended events
  const {
    data: recommendedEvents,
    isLoading: recommendedEventsLoading,
    error: recommendedEventsError,
  } = useQuery({
    queryKey: ["/api/events/recommended"],
    queryFn: async () => {
      if (!user) return [];
      
      const res = await apiRequest("GET", "/api/events/recommended");
      if (!res.ok) {
        throw new Error("Failed to fetch recommended events");
      }
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Helper function to update specific preferences
  const updatePreference = (key: string, value: any) => {
    const currentPreferences = preferences || {};
    updatePreferencesMutation.mutate({
      ...currentPreferences,
      [key]: value,
    });
  };
  
  // Helper function to add a category preference
  const addCategoryPreference = (categoryId: number) => {
    const currentPreferences = preferences || {};
    const currentCategories = currentPreferences.categories || [];
    
    if (!currentCategories.includes(categoryId)) {
      updatePreferencesMutation.mutate({
        ...currentPreferences,
        categories: [...currentCategories, categoryId],
      });
    }
  };
  
  // Helper function to remove a category preference
  const removeCategoryPreference = (categoryId: number) => {
    const currentPreferences = preferences || {};
    const currentCategories = currentPreferences.categories || [];
    
    updatePreferencesMutation.mutate({
      ...currentPreferences,
      categories: currentCategories.filter((id: number) => id !== categoryId),
    });
  };
  
  // Helper function to add a location preference
  const addLocationPreference = (location: { latitude: string; longitude: string; name: string }) => {
    const currentPreferences = preferences || {};
    const currentLocations = currentPreferences.locations || [];
    
    // Check if location already exists by coordinates
    const exists = currentLocations.some(
      (loc: any) => loc.latitude === location.latitude && loc.longitude === location.longitude
    );
    
    if (!exists) {
      updatePreferencesMutation.mutate({
        ...currentPreferences,
        locations: [...currentLocations, location],
      });
    }
  };
  
  // Helper function to remove a location preference
  const removeLocationPreference = (locationName: string) => {
    const currentPreferences = preferences || {};
    const currentLocations = currentPreferences.locations || [];
    
    updatePreferencesMutation.mutate({
      ...currentPreferences,
      locations: currentLocations.filter((loc: any) => loc.name !== locationName),
    });
  };
  
  return {
    preferences: preferences || {},
    preferencesLoading,
    preferencesError,
    updatePreferences: updatePreferencesMutation.mutate,
    updatePreferencesMutation,
    updatePreference,
    addCategoryPreference,
    removeCategoryPreference,
    addLocationPreference,
    removeLocationPreference,
    recommendedEvents: recommendedEvents || [],
    recommendedEventsLoading,
    recommendedEventsError,
  };
}