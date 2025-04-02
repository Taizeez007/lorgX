import React from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, WifiOff, Download } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface OfflineEventCardProps {
  event: any;
  isOffline?: boolean;
}

export function OfflineEventCard({ event, isOffline = false }: OfflineEventCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative">
        {isOffline && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 z-10 bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1"
          >
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        )}
        
        {event.imageUrl ? (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-blue-400" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          {event.isFree ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Free</Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              ${event.price?.toFixed(2) || '9.99'}
            </Badge>
          )}
        </div>
        
        {event.categoryName && (
          <Badge variant="outline" className="mt-1 w-fit">
            {event.categoryName}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="pb-3 flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <span>{formatDate(new Date(event.startDate))}</span>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <span>{formatTime(new Date(event.startDate))}</span>
          </div>
          
          {event.address && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <span className="line-clamp-1">{event.address}</span>
            </div>
          )}
          
          {event.attendeeCount !== undefined && (
            <div className="flex items-start">
              <Users className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <span>
                {event.attendeeCount} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
                {event.maxAttendees && ` / ${event.maxAttendees}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full flex gap-2">
          <Button asChild className="w-full">
            <Link to={`/events/${event.id}`}>
              View Details
            </Link>
          </Button>
          
          {isOffline && (
            <Button variant="outline" size="icon" title="Sync this event">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}