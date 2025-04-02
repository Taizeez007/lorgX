import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Heart, MapPin, Clock, Users, Bookmark, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  address: string | null;
  isVirtual: boolean;
  isHybrid: boolean;
  isFree: boolean;
  price: number | null;
  attendeeCount: number;
  imageUrl: string | null;
  categoryId: number | null;
}

interface SearchResultsProps {
  events: Event[];
  isLoading: boolean;
  onLikeEvent?: (eventId: number) => void;
  onSaveEvent?: (eventId: number) => void;
}

export function SearchResults({ events, isLoading, onLikeEvent, onSaveEvent }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
            <CardFooter>
              <div className="h-9 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search filters to find more events.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden flex flex-col">
          {event.imageUrl ? (
            <div 
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.imageUrl})` }}
            ></div>
          ) : (
            <div className="h-48 bg-muted flex items-center justify-center">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              <div className="flex gap-1">
                {onLikeEvent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onLikeEvent(event.id)}
                    className="h-8 w-8"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                )}
                {onSaveEvent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSaveEvent(event.id)}
                    className="h-8 w-8"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.isFree ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Free
                </Badge>
              ) : event.price ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  ${event.price}
                </Badge>
              ) : null}
              
              {event.isVirtual && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Virtual
                </Badge>
              )}
              
              {event.isHybrid && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Hybrid
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1">
            <CardDescription className="line-clamp-3 mb-4">
              {event.description || "No description available"}
            </CardDescription>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {new Date(event.startDate).toLocaleDateString()} • {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
                </span>
              </div>
              
              {event.address && !event.isVirtual && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="line-clamp-1">{event.address}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{event.attendeeCount} attendees</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Link href={`/events/${event.id}`}>
              <Button className="w-full">
                View Details
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}