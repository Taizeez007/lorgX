
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
import { MapPin, Building, Users, Bookmark } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SavedPlaceCardProps {
  place: any;
}

export function SavedPlaceCard({ place }: SavedPlaceCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation for unsaving a place
  const unsavePlaceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/places/${place.id}/save`);
      if (!response.ok) {
        throw new Error('Failed to unsave place');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Place removed from saved places',
      });
      // Invalidate saved places query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-places'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove place from saved places',
        variant: 'destructive',
      });
    },
  });

  const handleUnsave = () => {
    unsavePlaceMutation.mutate();
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative">
        {place.imageUrls && place.imageUrls.length > 0 ? (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={place.imageUrls[0]} 
              alt={place.name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
            <Building className="h-12 w-12 text-blue-400" />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8 rounded-full"
          onClick={handleUnsave}
        >
          <Bookmark className="h-4 w-4 fill-current text-primary" />
        </Button>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{place.name}</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            {place.placeType || 'Venue'}
          </Badge>
        </div>
        
        {place.categoryName && (
          <Badge variant="outline" className="mt-1 w-fit">
            {place.categoryName}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="pb-3 flex-grow">
        <div className="space-y-2 text-sm">
          {place.address && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <span className="line-clamp-2">{place.address}</span>
            </div>
          )}
          
          {place.capacity && (
            <div className="flex items-start">
              <Users className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <span>Capacity: {place.capacity}</span>
            </div>
          )}
          
          {place.basePrice !== undefined && (
            <div className="flex items-start">
              <span className="font-medium">
                {place.basePrice === 0 ? "Free" : `$${place.basePrice.toFixed(2)}`}
                {place.bookingType === 'subscription' && place.bookingRate && 
                  ` / ${place.bookingRate}`
                }
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={`/events/places/${place.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SavedPlaceCardProps {
  place: any;
}

export function SavedPlaceCard({ place }: SavedPlaceCardProps) {
  const [isSaved, setIsSaved] = useState(true);
  const queryClient = useQueryClient();

  // Unsave place mutation
  const unsaveMutation = useMutation({
    mutationFn: () => {
      return fetch(`/api/places/${place.id}/save`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to unsave place");
        return res.json();
      });
    },
    onSuccess: () => {
      setIsSaved(false);
      // Invalidate saved places query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-places"] });
    },
  });

  const handleUnsave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveMutation.mutate();
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-40">
        {place.imageUrls && place.imageUrls.length > 0 ? (
          <img
            src={place.imageUrls[0]}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : place.imageUrl ? (
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-gray-400" />
          </div>
        )}
        
        <Button
          onClick={handleUnsave}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? "fill-primary" : ""}`} />
        </Button>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{place.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center space-x-1 text-sm">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">
            {place.rating || "4.5"} 
            <span className="text-gray-500 text-xs ml-1">
              ({place.reviewCount || 0} reviews)
            </span>
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {place.description || "No description available."}
        </p>
        
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="line-clamp-1">{place.address}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/events/places/${place.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
