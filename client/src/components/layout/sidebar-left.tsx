import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Music, Utensils, GraduationCap, Briefcase, Palette, Activity, Globe, Plus, Users, MessageSquare, UserPlus, Bookmark } from "lucide-react";

interface Connection {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: string;
  connectionType: string;
  user?: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
}

interface Community {
  id: number;
  name: string;
  bannerImage?: string;
  memberCount: number;
}

export default function SidebarLeft() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch connection requests
  const { data: connectionRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["/api/connections/requests"],
    enabled: !!user,
  });

  // Fetch user communities
  const { data: userCommunities, isLoading: isCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities/user"],
    enabled: !!user,
  });

  // Icons for each category
  const categoryIcons: Record<string, JSX.Element> = {
    "Music": <Music className="w-5 h-5 mr-2" />,
    "Food & Dining": <Utensils className="w-5 h-5 mr-2" />,
    "Education": <GraduationCap className="w-5 h-5 mr-2" />,
    "Business": <Briefcase className="w-5 h-5 mr-2" />,
    "Arts": <Palette className="w-5 h-5 mr-2" />,
    "Sports": <Activity className="w-5 h-5 mr-2" />,
    "Travel": <Globe className="w-5 h-5 mr-2" />,
  };

  return (
    <div className="hidden md:block w-56 lg:w-64 shrink-0">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="space-y-1.5">
          <Link href="/">
            <Button
              variant={location === '/' ? "default" : "ghost"}
              className={`w-full justify-start ${location === '/' ? 'bg-primary' : ''}`}
            >
              Home
            </Button>
          </Link>
          <Link href="/profile">
            <Button
              variant={location === '/profile' ? "default" : "ghost"}
              className={`w-full justify-start ${location === '/profile' ? 'bg-primary' : ''}`}
            >
              My Profile
            </Button>
          </Link>
          <Link href="/events">
            <Button
              variant={location === '/events' ? "default" : "ghost"}
              className={`w-full justify-start ${location === '/events' ? 'bg-primary' : ''}`}
            >
              Events
            </Button>
          </Link>
          <Link href="/community">
            <Button
              variant={location.includes('/community') ? "default" : "ghost"}
              className={`w-full justify-start ${location.includes('/community') ? 'bg-primary' : ''}`}
            >
              Community
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              variant={location === '/chat' ? "default" : "ghost"}
              className={`w-full justify-start ${location === '/chat' ? 'bg-primary' : ''}`}
            >
              Messages
            </Button>
          </Link>
          <Link href="/saved">
            <Button
              variant={location === '/saved' ? "default" : "ghost"}
              className={`w-full justify-start ${location === '/saved' ? 'bg-primary' : ''}`}
            >
              Saved Items
            </Button>
          </Link>
        </div>
      </div>

      {user && (
        <>
          {/* Connection Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Connection Requests</h3>
            {isRequestsLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : connectionRequests && connectionRequests.length > 0 ? (
              <div className="space-y-3">
                {connectionRequests.map((request: Connection) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        {request.user?.profileImage ? (
                          <img 
                            src={request.user.profileImage} 
                            alt={request.user.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-primary">{request.user?.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{request.user?.fullName}</p>
                        <p className="text-xs text-gray-500">{request.connectionType}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                        <UserPlus className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No pending requests</p>
            )}
          </div>

          {/* My Communities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">My Communities</h3>
              <Link href="/community/create">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isCommunitiesLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : userCommunities && userCommunities.length > 0 ? (
              <div className="space-y-3">
                {userCommunities.map((community: Community) => (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                      <div className="flex items-center w-full">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                          {community.bannerImage ? (
                            <img 
                              src={community.bannerImage} 
                              alt={community.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{community.name}</p>
                          <p className="text-xs text-gray-500">{community.memberCount} members</p>
                        </div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">You haven't joined any communities yet</p>
                <Link href="/community">
                  <Button size="sm" className="bg-primary text-xs">Find Communities</Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}