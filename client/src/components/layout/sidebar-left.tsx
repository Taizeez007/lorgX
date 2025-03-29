import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Music, Utensils, GraduationCap, Briefcase, Palette, Running, Globe, Plus, Users, MessageSquare, UserPlus } from "lucide-react";

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
  memberCount: number;
  imageUrl?: string;
}

export default function SidebarLeft() {
  const [location] = useLocation();
  const { user } = useAuth();

  const categoryIcons = {
    "Music": <Music className="w-5 h-5 mr-2" />,
    "Food & Drink": <Utensils className="w-5 h-5 mr-2" />,
    "Education": <GraduationCap className="w-5 h-5 mr-2" />,
    "Business": <Briefcase className="w-5 h-5 mr-2" />,
    "Arts": <Palette className="w-5 h-5 mr-2" />,
    "Sports": <Running className="w-5 h-5 mr-2" />,
    "Travel": <Globe className="w-5 h-5 mr-2" />
  };

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });

  const { data: connections, isLoading: isConnectionsLoading } = useQuery({
    queryKey: ["/api/connections"],
    enabled: !!user,
  });

  const { data: communities, isLoading: isCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities/user"],
    enabled: !!user,
  });

  return (
    <div className="w-full md:w-64 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <Link href="/profile">
          <Button className="w-full bg-primary hover:bg-red-600 text-white">
            Profile
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">Categories</h3>
        <ul className="space-y-2">
          {categories ? (
            <>
              {categories.map((category: any) => (
                <li key={category.id}>
                  <Link href={`/events?category=${category.id}`}>
                    <a className="flex items-center text-gray-600 hover:text-primary">
                      {categoryIcons[category.name as keyof typeof categoryIcons] || <div className="w-5 mr-2" />}
                      {category.name}
                    </a>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/events">
                  <a className="flex items-center text-primary font-medium">
                    <Plus className="w-5 h-5 mr-2" /> View All
                  </a>
                </Link>
              </li>
            </>
          ) : (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">My Connections</h3>
        <ul className="space-y-3">
          {isConnectionsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : connections && connections.length > 0 ? (
            <>
              {connections.slice(0, 3).map((connection: Connection) => (
                <li key={connection.id} className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {connection.user?.profileImage ? (
                      <img 
                        src={connection.user.profileImage} 
                        alt={connection.user.fullName} 
                        className="h-8 w-8 rounded-full object-cover" 
                      />
                    ) : (
                      <Users className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {connection.user?.fullName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {connection.connectionType}
                    </p>
                  </div>
                  <Link href={`/chat?user=${connection.user?.id}`}>
                    <a className="text-primary hover:text-red-700">
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  </Link>
                </li>
              ))}
            </>
          ) : (
            <p className="text-sm text-gray-600">No connections yet</p>
          )}
          <li>
            <Link href="/profile?tab=connections">
              <a className="text-sm text-primary font-medium flex items-center">
                <UserPlus className="h-4 w-4 mr-2" /> Manage Connections
              </a>
            </Link>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">My Communities</h3>
        <ul className="space-y-3">
          {isCommunitiesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : communities && communities.length > 0 ? (
            <>
              {communities.slice(0, 3).map((community: Community) => (
                <li key={community.id} className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {community.imageUrl ? (
                      <img 
                        src={community.imageUrl} 
                        alt={community.name} 
                        className="h-8 w-8 rounded-full object-cover" 
                      />
                    ) : (
                      <Users className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {community.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {community.memberCount} members
                    </p>
                  </div>
                </li>
              ))}
            </>
          ) : (
            <p className="text-sm text-gray-600">No communities yet</p>
          )}
          <li>
            <Link href="/community?action=create">
              <a className="text-sm text-primary font-medium flex items-center">
                <Plus className="h-4 w-4 mr-2" /> Create Community
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
