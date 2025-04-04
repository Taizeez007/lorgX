
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bookmark, Calendar, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SidebarLeft from "@/components/layout/sidebar-left";
import SidebarRight from "@/components/layout/sidebar-right";
import { OfflineEventCard } from "@/components/events/OfflineEventCard";
import { SavedPlaceCard } from "@/components/events/SavedPlaceCard";
import { useAuth } from "@/hooks/use-auth";

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState("events");
  const { isAuthenticated, user } = useAuth();

  // Fetch saved events
  const { 
    data: savedEvents, 
    isLoading: isEventsLoading,
    isError: isEventsError
  } = useQuery({
    queryKey: ["/api/user/saved-events"],
    enabled: isAuthenticated && activeTab === "events",
  });

  // Fetch saved places
  const { 
    data: savedPlaces, 
    isLoading: isPlacesLoading,
    isError: isPlacesError
  } = useQuery({
    queryKey: ["/api/user/saved-places"],
    enabled: isAuthenticated && activeTab === "places",
  });

  // Check if user is loading or if there's an error
  const isLoading = activeTab === "events" ? isEventsLoading : isPlacesLoading;
  const isError = activeTab === "events" ? isEventsError : isPlacesError;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            {/* Left Sidebar */}
            <SidebarLeft />
            
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Bookmark className="h-6 w-6 text-primary mr-2" />
                  <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
                </div>
                
                {/* Tabs to switch between saved events and places */}
                <Tabs defaultValue="events" onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="places">Places</TabsTrigger>
                  </TabsList>
                  
                  {/* Saved Events Tab */}
                  <TabsContent value="events">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isError ? (
                      <div className="text-center py-12">
                        <p className="text-red-500">Error loading saved events</p>
                      </div>
                    ) : !savedEvents || savedEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No saved events</h3>
                        <p className="mt-1 text-gray-600">
                          You haven't saved any events yet. Browse events and save them for later.
                        </p>
                        <Button asChild className="mt-4 bg-primary">
                          <a href="/events">Browse Events</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedEvents.map((event) => (
                          <OfflineEventCard key={event.id} event={event} showSaveButton={true} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Saved Places Tab */}
                  <TabsContent value="places">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isError ? (
                      <div className="text-center py-12">
                        <p className="text-red-500">Error loading saved places</p>
                      </div>
                    ) : !savedPlaces || savedPlaces.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No saved places</h3>
                        <p className="mt-1 text-gray-600">
                          You haven't saved any event places yet. Browse places and save them for later.
                        </p>
                        <Button asChild className="mt-4 bg-primary">
                          <a href="/events?filter=places">Browse Places</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedPlaces.map((place) => (
                          <SavedPlaceCard key={place.id} place={place} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <SidebarRight />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
