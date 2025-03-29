import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { MoreHorizontal, Heart, MessageSquare, Share2, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: {
    id: number;
    content?: string;
    imageUrl?: string;
    userId: number;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    user?: {
      id: number;
      fullName: string;
      username: string;
      profileImage?: string;
    }
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const { user } = useAuth();
  const { toast } = useToast();

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now.getTime() - postDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}mins ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      if (isLiked) {
        await apiRequest("POST", `/api/posts/${post.id}/unlike`, {});
        return "unliked";
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`, {});
        return "liked";
      }
    },
    onSuccess: (action) => {
      if (action === "liked") {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      }
      
      // Invalidate posts cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to like post",
        variant: "destructive",
      });
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
            {post.user?.profileImage ? (
              <img 
                src={post.user.profileImage} 
                alt={post.user.fullName} 
                className="h-10 w-10 rounded-full object-cover" 
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {post.user?.fullName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 font-medium">{post.user?.fullName}</h3>
            <p className="text-sm text-gray-600">{getTimeAgo(post.createdAt)}</p>
          </div>
          <button 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => toast({ title: "Options menu", description: "This feature is coming soon" })}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt="Post content" 
          className="w-full object-cover h-64" 
        />
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <button 
              className={`text-gray-600 hover:text-primary flex items-center space-x-1 ${isLiked ? 'text-primary' : ''}`}
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button 
              className="text-gray-600 hover:text-primary flex items-center space-x-1"
              onClick={() => toast({ title: "Comments", description: "This feature is coming soon" })}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{post.commentCount}</span>
            </button>
            <button 
              className="text-gray-600 hover:text-primary"
              onClick={() => toast({ title: "Share", description: "This feature is coming soon" })}
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <button 
            className={`hover:text-primary ${isBookmarked ? 'text-primary' : 'text-gray-600'}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {post.content && (
          <p className="text-gray-900">{post.content}</p>
        )}
      </div>
    </div>
  );
}
