
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
