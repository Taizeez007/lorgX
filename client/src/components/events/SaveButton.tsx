
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSavedItems } from '@/hooks/use-saved-items';
import { useToast } from '@/hooks/use-toast';

interface SaveButtonProps {
  itemId: number;
  itemType: 'event' | 'place';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SaveButton({ 
  itemId, 
  itemType, 
  variant = 'ghost', 
  size = 'icon',
  className = ''
}: SaveButtonProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isEventSaved, isPlaceSaved, toggleSaveEvent, toggleSavePlace } = useSavedItems();
  const { toast } = useToast();
  
  const isSaved = itemType === 'event' 
    ? isEventSaved(itemId) 
    : isPlaceSaved(itemId);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to save this item',
      });
      openAuthModal?.();
      return;
    }
    
    if (itemType === 'event') {
      toggleSaveEvent(itemId);
    } else {
      toggleSavePlace(itemId);
    }
  };
  
  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      title={isSaved ? 'Remove from saved items' : 'Save for later'}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
    </Button>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface SaveButtonProps {
  id: number;
  isEvent?: boolean;
  isSavedInitially?: boolean;
  showBackground?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function SaveButton({
  id,
  isEvent = true,
  isSavedInitially = false,
  showBackground = false,
  size = "icon",
  variant = "ghost"
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Base endpoint depending on if it's an event or place
  const endpoint = isEvent ? `/api/events/${id}/save` : `/api/places/${id}/save`;
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to save ${isEvent ? 'event' : 'place'}`);
        return res.json();
      });
    },
    onSuccess: () => {
      setIsSaved(true);
      // Invalidate saved items query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [isEvent ? "/api/user/saved-events" : "/api/user/saved-places"] 
      });
    },
  });
  
  // Unsave mutation
  const unsaveMutation = useMutation({
    mutationFn: () => {
      return fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to unsave ${isEvent ? 'event' : 'place'}`);
        return res.json();
      });
    },
    onSuccess: () => {
      setIsSaved(false);
      // Invalidate saved items query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [isEvent ? "/api/user/saved-events" : "/api/user/saved-places"] 
      });
    },
  });

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = "/auth";
      return;
    }
    
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  // Determine button class based on saved state and background option
  const buttonClass = showBackground 
    ? "bg-white/80 hover:bg-white" 
    : "";

  return (
    <Button
      onClick={handleToggleSave}
      variant={variant}
      size={size}
      className={buttonClass}
      title={isSaved ? `Unsave this ${isEvent ? 'event' : 'place'}` : `Save this ${isEvent ? 'event' : 'place'}`}
      disabled={saveMutation.isPending || unsaveMutation.isPending}
    >
      <Bookmark className={`h-5 w-5 ${isSaved ? "fill-primary" : ""}`} />
    </Button>
  );
}
