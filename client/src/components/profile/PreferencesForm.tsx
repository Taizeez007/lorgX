import { useState, useEffect } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, Plus } from "lucide-react";

export function PreferencesForm() {
  const { preferences, addCategoryPreference, removeCategoryPreference, addLocationPreference, removeLocationPreference } = usePreferences();
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch all categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      return await res.json();
    },
  });

  // Get current location
  useEffect(() => {
    if (useCurrentLocation) {
      setLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setLocationName("My Current Location");
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUseCurrentLocation(false);
          setLocationLoading(false);
        }
      );
    }
  }, [useCurrentLocation]);

  // Add location
  const handleAddLocation = () => {
    if (locationName && latitude && longitude) {
      addLocationPreference({
        name: locationName,
        latitude,
        longitude
      });
      
      // Reset fields
      setLocationName("");
      setLatitude("");
      setLongitude("");
      setUseCurrentLocation(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your event recommendations based on your interests and locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Categories</h3>
              
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories?.map((category: Category) => {
                    const isSelected = preferences?.categories?.includes(category.id);
                    
                    return (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addCategoryPreference(category.id);
                            } else {
                              removeCategoryPreference(category.id);
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="locations">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferred Locations</h3>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationName">Location Name</Label>
                  <Input
                    id="locationName"
                    placeholder="e.g., My Neighborhood, Downtown"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    disabled={locationLoading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      placeholder="e.g., 40.7128"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      disabled={locationLoading || useCurrentLocation}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      placeholder="e.g., -74.0060"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      disabled={locationLoading || useCurrentLocation}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-current-location"
                    checked={useCurrentLocation}
                    onCheckedChange={(checked) => setUseCurrentLocation(!!checked)}
                    disabled={locationLoading}
                  />
                  <Label htmlFor="use-current-location" className="cursor-pointer">
                    Use my current location
                  </Label>
                  {locationLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </div>
                
                <Button
                  type="button"
                  onClick={handleAddLocation}
                  disabled={!locationName || !latitude || !longitude || locationLoading}
                  className="w-full md:w-auto mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-medium">Saved Locations</h4>
                
                {!preferences?.locations || preferences.locations.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">
                    No saved locations yet. Add locations to get events nearby.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {preferences.locations.map((location: any) => (
                      <div
                        key={location.name}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{location.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {location.latitude}, {location.longitude}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocationPreference(location.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}