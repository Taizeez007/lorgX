import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Users } from "lucide-react";

export default function LiveEvents() {
  const { user } = useAuth();
  
  const { data: liveEvents, isLoading } = useQuery({
    queryKey: ["/api/events/live"],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Live Events</h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Live Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveEvents && liveEvents.length > 0 ? (
          liveEvents.map((event: any) => (
            <div key={event.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              <div className="h-48 bg-gray-200 relative">
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
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded px-2 py-1">
                  Live
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date() > new Date(event.startDate) 
                    ? `Started ${Math.floor((new Date().getTime() - new Date(event.startDate).getTime()) / (1000 * 60))} minutes ago`
                    : `Going live in ${Math.floor((new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60))} minutes`
                  }
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.attendeeCount || 0} watching</span>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button className="mt-auto w-full bg-primary hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm">
                    Join Stream
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-4 text-center text-gray-600">
            No live events at the moment
          </div>
        )}
      </div>
    </div>
  );
}
