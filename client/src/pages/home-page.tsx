import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SidebarLeft from "@/components/layout/sidebar-left";
import SidebarRight from "@/components/layout/sidebar-right";
import HeroBanner from "@/components/home/hero-banner";
import PostCard from "@/components/home/post-card";
import LiveEvents from "@/components/home/live-events";
import UpcomingEvents from "@/components/home/upcoming-events";
import DiscoverPlaces from "@/components/home/discover-places";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            {/* Left Sidebar */}
            <SidebarLeft />
            
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <HeroBanner />
              
              {/* Feed Section */}
              <div className="space-y-6">
                {isPostsLoading ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : posts && posts.length > 0 ? (
                  posts.slice(0, 2).map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <p className="text-gray-600">No posts yet. Start connecting with others to see their posts!</p>
                  </div>
                )}
                
                <LiveEvents />
                <UpcomingEvents />
                <DiscoverPlaces />
              </div>
            </div>
            
            {/* Right Sidebar */}
            <SidebarRight />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
