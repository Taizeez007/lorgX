import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Wifi, WifiOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useOfflineBooking } from '@/hooks/use-offline-booking';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useOfflineAuth } from '@/hooks/use-offline-auth';

interface OfflineEventCardProps {
  event: any;
  isOffline?: boolean;
}

export function OfflineEventCard({ event, isOffline = false }: OfflineEventCardProps) {
  const { bookingMutation } = useOfflineBooking();
  const { user } = useAuth();
  const { cachedUser, offlineMode } = useOfflineAuth();
  const { toast } = useToast();
  
  const activeUser = user || cachedUser;
  const isUserOffline = offlineMode && !user;

  const handleBookEvent = () => {
    if (!activeUser) {
      toast({
        title: "Authentication required",
        description: isUserOffline 
          ? "You're currently offline. Please log in when you're back online."
          : "Please log in to book events.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      eventId: event.id,
      userId: activeUser.id,
      status: 'pending',
      numberOfTickets: 1,
      paymentStatus: event.isFree ? 'free' : 'pending',
    };

    bookingMutation.mutate(bookingData);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      {event.imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
          {isOffline && (
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-100">
              <WifiOff size={14} /> Cached
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {event.categoryName && (
            <Badge variant="secondary">{event.categoryName}</Badge>
          )}
          {event.isFree ? (
            <Badge variant="default" className="bg-green-600">Free</Badge>
          ) : (
            <Badge variant="default" className="bg-blue-600">
              {event.price ? `$${event.price}` : 'Paid'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description || "No description available."}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          <span>{formatDate(new Date(event.startDate))}</span>
        </div>
        {event.startTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>{event.startTime} - {event.endTime || 'TBD'}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span className="truncate">{event.address || event.location || 'Online'}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={handleBookEvent} 
          className="w-full"
          disabled={bookingMutation.isPending}
        >
          {bookingMutation.isPending ? 'Processing...' : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}