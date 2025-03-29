import { useState } from "react";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SidebarLeft from "@/components/layout/sidebar-left";
import SidebarRight from "@/components/layout/sidebar-right";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter as FilterIcon,
  Loader2,
  CalendarDays,
  Tag 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventsPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Fetch all events
  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: activeTab === "all",
  });
  
  // Fetch upcoming events
  const { data: upcomingEvents, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ["/api/events/upcoming"],
    enabled: activeTab === "upcoming",
  });
  
  // Fetch live events
  const { data: liveEvents, isLoading: isLiveLoading } = useQuery({
    queryKey: ["/api/events/live"],
    enabled: activeTab === "live",
  });
  
  // Fetch categories for filtering
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Determine which events to show based on active tab
  const getEventsToShow = () => {
    if (activeTab === "upcoming") return upcomingEvents;
    if (activeTab === "live") return liveEvents;
    return events;
  };
  
  // Filter events based on search term and category
  const filteredEvents = getEventsToShow()?.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter ? event.categoryId === parseInt(categoryFilter) : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Determine loading state based on active tab
  const isLoading = activeTab === "upcoming" 
    ? isUpcomingLoading 
    : activeTab === "live" 
      ? isLiveLoading 
      : isEventsLoading;
  
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-600">
                      Discover and book events that match your interests
                    </p>
                  </div>
                  
                  <Link href="/create-event">
                    <Button className="bg-primary">Create Event</Button>
                  </Link>
                </div>
                
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search events..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="w-full sm:w-48">
                      <Select
                        value={categoryFilter || ""}
                        onValueChange={(value) => setCategoryFilter(value || null)}
                      >
                        <SelectTrigger>
                          <div className="flex items-center">
                            <FilterIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by category" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Tabs */}
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="live">Live Now</TabsTrigger>
                  </TabsList>
                  
                  {/* All Events */}
                  <TabsContent value="all">
                    <EventsList 
                      events={filteredEvents} 
                      isLoading={isLoading} 
                      formatDate={formatDate}
                      formatTime={formatTime}
                      categories={categories}
                    />
                  </TabsContent>
                  
                  {/* Upcoming Events */}
                  <TabsContent value="upcoming">
                    <EventsList 
                      events={filteredEvents} 
                      isLoading={isLoading} 
                      formatDate={formatDate}
                      formatTime={formatTime}
                      categories={categories}
                    />
                  </TabsContent>
                  
                  {/* Live Events */}
                  <TabsContent value="live">
                    <EventsList 
                      events={filteredEvents} 
                      isLoading={isLoading} 
                      formatDate={formatDate}
                      formatTime={formatTime}
                      categories={categories}
                      isLive={true}
                    />
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

interface EventsListProps {
  events: any[];
  isLoading: boolean;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  categories: any[];
  isLive?: boolean;
}

function EventsList({ events, isLoading, formatDate, formatTime, categories, isLive }: EventsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
        <p className="mt-1 text-gray-600">Try adjusting your search or filter to find events.</p>
        <Link href="/create-event">
          <Button className="mt-4 bg-primary">Create an Event</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: any) => {
        const category = categories?.find((c: any) => c.id === event.categoryId);
        
        return (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-40 bg-gray-200">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-primary/30" />
                </div>
              )}
              
              {isLive && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 text-white border-0 px-2 py-1 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1"></span>
                    Live
                  </Badge>
                </div>
              )}
              
              {event.isVirtual && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-primary text-white border-0">Virtual</Badge>
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {!event.isPublic && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    Private
                  </Badge>
                )}
              </div>
              
              {category && (
                <div className="flex items-center mt-1">
                  <Tag className="h-3.5 w-3.5 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pb-2 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDays className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>{formatTime(event.startDate)}</span>
                {event.endDate && (
                  <span> - {formatTime(event.endDate)}</span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">
                  {event.isVirtual 
                    ? 'Online Event' 
                    : event.address || 'Location not specified'}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1.5 text-gray-500" />
                <span>{event.attendeeCount || 0} attending</span>
              </div>
              
              {event.isFree ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">Free</Badge>
              ) : event.price ? (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  ${event.price.toFixed(2)}
                </Badge>
              ) : null}
            </CardContent>
            
            <CardFooter>
              <Link href={`/events/${event.id}`}>
                <Button className="bg-primary">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
