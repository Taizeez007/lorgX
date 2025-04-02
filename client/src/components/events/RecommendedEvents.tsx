import { usePreferences } from "@/hooks/use-preferences";
import { Event } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Heart, Users, BookmarkPlus } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "wouter";

export function RecommendedEvents() {
  const { recommendedEvents, recommendedEventsLoading } = usePreferences();
  const [visibleEvents, setVisibleEvents] = useState(4);
  
  const loadMore = () => {
    setVisibleEvents(prev => prev + 4);
  };
  
  // If loading, show skeleton
  if (recommendedEventsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Recommended Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If no recommended events
  if (!recommendedEvents || recommendedEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Recommended Events</h2>
        </div>
        <Card className="p-8 text-center">
          <CardTitle className="mb-2">No recommended events yet</CardTitle>
          <CardDescription>
            Update your preferences or interact with events to get personalized recommendations
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Recommended Events</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendedEvents.slice(0, visibleEvents).map((event: Event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="cursor-pointer overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
              <div 
                className="aspect-video w-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${event.imageUrl || '/placeholder-event.jpg'})` }}
              />
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(event.startDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(event.startDate), "h:mm a")}
                    </span>
                  </div>
                  
                  {event.address && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="line-clamp-1">{event.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{event.attendeeCount || 0} attending</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {event.isVirtual && <Badge variant="secondary">Virtual</Badge>}
                    {event.price && parseFloat(String(event.price)) > 0 ? (
                      <Badge>{typeof event.price === 'string' ? event.price : `$${event.price}`}</Badge>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button size="sm" variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>{event.likeCount || 0}</span>
                </Button>
                <Button size="sm" variant="outline">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  <span>Save</span>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {recommendedEvents.length > visibleEvents && (
        <div className="flex justify-center mt-6">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}