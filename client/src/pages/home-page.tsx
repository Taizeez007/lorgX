import { Suspense, lazy } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Loader2 } from "lucide-react";

// Lazy-loaded components
const SidebarLeft = lazy(() => import("@/components/layout/sidebar-left"));
const SidebarRight = lazy(() => import("@/components/layout/sidebar-right"));
const HeroBanner = lazy(() => import("@/components/home/hero-banner"));
const PostCard = lazy(() => import("@/components/home/post-card"));
const LiveEvents = lazy(() => import("@/components/home/live-events"));
const UpcomingEvents = lazy(() => import("@/components/home/upcoming-events"));
const DiscoverPlaces = lazy(() => import("@/components/home/discover-places"));

// Loading placeholders for different sections
const SectionLoading = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
            <Suspense fallback={<SectionLoading />}>
              <SidebarLeft />
            </Suspense>
            
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <Suspense fallback={<SectionLoading />}>
                <HeroBanner />
              </Suspense>
              
              {/* Feed Section */}
              <div className="space-y-6">
                {isPostsLoading ? (
                  <SectionLoading />
                ) : posts && posts.length > 0 ? (
                  <Suspense fallback={<SectionLoading />}>
                    {posts.slice(0, 2).map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </Suspense>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <p className="text-gray-600">No posts yet. Start connecting with others to see their posts!</p>
                  </div>
                )}
                
                <Suspense fallback={<SectionLoading />}>
                  <LiveEvents />
                </Suspense>
                
                <Suspense fallback={<SectionLoading />}>
                  <UpcomingEvents />
                </Suspense>
                
                <Suspense fallback={<SectionLoading />}>
                  <DiscoverPlaces />
                </Suspense>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <Suspense fallback={<SectionLoading />}>
              <SidebarRight />
            </Suspense>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
