import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar, MapPin, Bookmark } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function UpcomingEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<number[]>([]);
  
  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ["/api/events/upcoming"],
    enabled: !!user,
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  const toggleBookmark = (eventId: number) => {
    if (bookmarkedEvents.includes(eventId)) {
      setBookmarkedEvents(bookmarkedEvents.filter(id => id !== eventId));
      toast({ title: "Event removed from bookmarks" });
    } else {
      setBookmarkedEvents([...bookmarkedEvents, eventId]);
      toast({ title: "Event added to bookmarks" });
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
          <Link href="/events">
            <a className="text-primary text-sm font-medium">View All</a>
          </Link>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
        <Link href="/events">
          <a className="text-primary text-sm font-medium">View All</a>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingEvents && upcomingEvents.length > 0 ? (
          upcomingEvents.slice(0, 2).map((event: any) => (
            <div key={event.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
              <div className="h-48 md:h-auto md:w-1/3 bg-gray-200">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex-1">
                <div className="flex justify-between">
                  <span className="text-sm text-white bg-primary px-2 py-0.5 rounded">
                    {event.categoryName || "Event"}
                  </span>
                  <button 
                    className={`text-gray-600 hover:text-primary ${bookmarkedEvents.includes(event.id) ? 'text-primary' : ''}`}
                    onClick={() => toggleBookmark(event.id)}
                  >
                    <Bookmark className={`h-5 w-5 ${bookmarkedEvents.includes(event.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 mt-2">{event.title}</h3>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.address || "Location not specified"}</span>
                </div>
                <div className="mt-3 flex items-center">
                  <span className="text-gray-900 font-bold">
                    {event.isFree ? "Free" : event.price || "$49.99"}
                  </span>
                  <Link href={`/events/${event.id}`}>
                    <Button className="ml-auto text-sm bg-primary hover:bg-red-600 text-white px-3 py-1 rounded">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-4 text-center text-gray-600">
            No upcoming events found
          </div>
        )}
      </div>
    </div>
  );
}
