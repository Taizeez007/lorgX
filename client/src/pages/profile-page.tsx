import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SidebarLeft from "@/components/layout/sidebar-left";
import SidebarRight from "@/components/layout/sidebar-right";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarDays, 
  User, 
  Users, 
  MessageSquare, 
  Heart, 
  Edit, 
  UserPlus,
  UserMinus,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Link as LinkIcon,
  Loader2,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { EducationHistorySection } from "@/components/profile/education-history-section";
import { WorkHistorySection } from "@/components/profile/work-history-section";
import { AddEducationForm } from "@/components/profile/add-education-form";
import { AddWorkForm } from "@/components/profile/add-work-form";

export default function ProfilePage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.search || "");
  const userId = searchParams.get("id");
  const [, navigate] = useLocation();
  
  const [activeTab, setActiveTab] = useState("posts");
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Determine if this is the current user's profile
  const isOwnProfile = !userId || (user && userId === user.id.toString());
  
  // Fetch profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/users", userId || (user ? user.id : '')],
    queryFn: async () => {
      // If own profile, use current user data
      if (isOwnProfile && user) {
        return user;
      }
      
      // Otherwise fetch the user profile
      try {
        const res = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        return await res.json();
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    },
    enabled: !!userId || !!user,
  });
  
  // Fetch profile posts
  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["/api/posts/user", userId || (user ? user.id : '')],
    enabled: !!userId || !!user,
  });
  
  // Fetch profile events
  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["/api/events/user", userId || (user ? user.id : '')],
    enabled: (!!userId || !!user) && activeTab === "events",
  });
  
  // Fetch connections
  const { data: connections, isLoading: isConnectionsLoading } = useQuery({
    queryKey: ["/api/connections", userId || (user ? user.id : '')],
    enabled: (!!userId || !!user) && activeTab === "connections",
  });
  
  // Fetch education and work history
  const { isLoading: isEducationLoading } = useQuery({
    queryKey: ["/api/education-history", userId || (user ? user.id : '')],
    enabled: (!!userId || !!user) && activeTab === "background",
  });
  
  const { isLoading: isWorkLoading } = useQuery({
    queryKey: ["/api/work-history", userId || (user ? user.id : '')],
    enabled: (!!userId || !!user) && activeTab === "background",
  });
  
  // Fetch followers/following
  const { data: followers, isLoading: isFollowersLoading } = useQuery({
    queryKey: ["/api/followers", userId || (user ? user.id : '')],
    enabled: (!!userId || !!user) && activeTab === "network",
  });
  
  const { data: following, isLoading: isFollowingLoading } = useQuery({
    queryKey: ["/api/following", userId || (user ? user.id : '')],
    enabled: (!!userId || !!user) && activeTab === "network",
  });
  
  // Check if the current user is following the profile
  const isFollowing = following?.some((follow: any) => follow.followedId === parseInt(userId || '0')) || false;
  
  // Connection status with the profile
  const connectionStatus = connections?.find(
    (conn: any) => 
      conn.requesterId === parseInt(userId || '0') || 
      conn.addresseeId === parseInt(userId || '0')
  )?.status || null;
  
  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/follow", {
        followedId: parseInt(userId || '0')
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `You're now following ${profileData?.fullName}`,
        description: "You'll see their updates in your feed"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/following'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Follow failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      // This would need a specific endpoint/id
      const res = await apiRequest("DELETE", `/api/follow/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Unfollowed ${profileData?.fullName}`,
        description: "You won't see their updates in your feed"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/following'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Unfollow failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/connections", {
        addresseeId: parseInt(userId || '0'),
        type: 'friend'
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection request sent",
        description: `Request sent to ${profileData?.fullName}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection request failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please sign in to view profiles</h2>
            <Link href="/auth">
              <Button className="bg-primary">Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (isProfileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist</p>
            <Link href="/">
              <Button className="bg-primary">Go Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
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
              {/* Profile Header */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-primary/30 to-primary/20"></div>
                <div className="px-6 py-4 sm:px-8 relative">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="-mt-16 flex justify-center">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        {profileData.profileImage ? (
                          <AvatarImage src={profileData.profileImage} alt={profileData.fullName} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                            {profileData.fullName.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="mt-2 sm:mt-0 flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h1>
                          <p className="text-gray-600">@{profileData.username}</p>
                        </div>
                        
                        <div className="mt-4 sm:mt-0 flex gap-2">
                          {isOwnProfile ? (
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-1"
                              onClick={() => navigate("/profile/edit")}
                            >
                              <Edit className="h-4 w-4" /> Edit Profile
                            </Button>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                className="flex items-center gap-1"
                                onClick={() => navigate(`/chat?user=${profileData.id}`)}
                              >
                                <MessageSquare className="h-4 w-4" /> Message
                              </Button>
                              
                              {connectionStatus === 'accepted' ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                                  Connected
                                </Badge>
                              ) : connectionStatus === 'pending' ? (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">
                                  Pending
                                </Badge>
                              ) : (
                                <Button 
                                  className="bg-primary flex items-center gap-1"
                                  onClick={() => connectMutation.mutate()}
                                  disabled={connectMutation.isPending}
                                >
                                  {connectMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserPlus className="h-4 w-4" />
                                  )} 
                                  Connect
                                </Button>
                              )}
                              
                              {isFollowing ? (
                                <Button 
                                  variant="outline"
                                  className="flex items-center gap-1"
                                  onClick={() => unfollowMutation.mutate()}
                                  disabled={unfollowMutation.isPending}
                                >
                                  {unfollowMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserMinus className="h-4 w-4" />
                                  )} 
                                  Unfollow
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline"
                                  className="flex items-center gap-1"
                                  onClick={() => followMutation.mutate()}
                                  disabled={followMutation.isPending}
                                >
                                  {followMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Heart className="h-4 w-4" />
                                  )} 
                                  Follow
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {profileData.bio && (
                        <p className="mt-4 text-gray-700">{profileData.bio}</p>
                      )}
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profileData.location && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{profileData.location}</span>
                          </div>
                        )}
                        
                        {profileData.email && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{profileData.email}</span>
                          </div>
                        )}
                        
                        {profileData.occupation && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{profileData.occupation}</span>
                          </div>
                        )}
                        
                        {profileData.createdAt && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Joined {formatDate(profileData.createdAt)}</span>
                          </div>
                        )}
                        
                        {profileData.website && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {profileData.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex items-center space-x-6">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-500 mr-1" />
                          <span className="font-medium mr-1">{connections?.length || 0}</span>
                          <span className="text-gray-600">Connections</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-500 mr-1" />
                          <span className="font-medium mr-1">{followers?.length || 0}</span>
                          <span className="text-gray-600">Followers</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-500 mr-1" />
                          <span className="font-medium mr-1">{following?.length || 0}</span>
                          <span className="text-gray-600">Following</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Tabs */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="connections">Connections</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                    {isOwnProfile && <TabsTrigger value="preferences">Preferences</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="posts">
                    {isPostsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : posts && posts.length > 0 ? (
                      <div className="space-y-4">
                        {posts.map((post: any) => (
                          <Card key={post.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  {profileData.profileImage ? (
                                    <AvatarImage src={profileData.profileImage} alt={profileData.fullName} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {profileData.fullName.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{profileData.fullName}</CardTitle>
                                  <CardDescription>
                                    {formatDate(post.createdAt)}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700">{post.content}</p>
                              {post.imageUrl && (
                                <div className="mt-3 rounded-md overflow-hidden">
                                  <img 
                                    src={post.imageUrl} 
                                    alt="Post image" 
                                    className="w-full object-cover" 
                                  />
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="flex justify-between text-gray-600 pt-0">
                              <div className="flex items-center space-x-1">
                                <Heart className="h-5 w-5" />
                                <span>{post.likeCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-5 w-5" />
                                <span>{post.commentCount || 0}</span>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No posts yet</p>
                        {isOwnProfile && (
                          <Button className="mt-4 bg-primary">Create a Post</Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="events">
                    {isEventsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : events && events.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: any) => (
                          <Card key={event.id} className="overflow-hidden">
                            <div className="h-40 bg-gray-200">
                              {event.imageUrl ? (
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                                  <Calendar className="h-8 w-8 text-primary" />
                                </div>
                              )}
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>{event.isPublic ? 'Public' : 'Private'} Event</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <MapPin className="h-4 w-4 mr-1.5" />
                                <span className="truncate">{event.address || 'Location not specified'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Users className="h-4 w-4 mr-1.5" />
                                <span>{event.attendeeCount || 0} attending</span>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link href={`/events/${event.id}`}>
                                <Button className="bg-primary">View Details</Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No events yet</p>
                        {isOwnProfile && (
                          <Link href="/create-event">
                            <Button className="mt-4 bg-primary">Create an Event</Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="connections">
                    {isConnectionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : connections && connections.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connections.map((connection: any) => {
                          const connectionUser = connection.requester.id === profileData.id 
                            ? connection.addressee 
                            : connection.requester;
                          
                          return (
                            <Card key={connection.id}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    {connectionUser.profileImage ? (
                                      <AvatarImage src={connectionUser.profileImage} alt={connectionUser.fullName} />
                                    ) : (
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {connectionUser.fullName.charAt(0)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <CardTitle className="text-base">{connectionUser.fullName}</CardTitle>
                                    <CardDescription>@{connectionUser.username}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="text-gray-600 text-sm line-clamp-2">
                                  {connectionUser.bio || `${connectionUser.fullName} is a user on the platform`}
                                </p>
                                <div className="mt-2">
                                  <Badge className="bg-primary/10 text-primary border-primary/20">
                                    {connection.type || 'Connection'}
                                  </Badge>
                                </div>
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Link href={`/profile?id=${connectionUser.id}`}>
                                  <Button variant="outline" size="sm">View Profile</Button>
                                </Link>
                                <Link href={`/chat?user=${connectionUser.id}`}>
                                  <Button className="bg-primary" size="sm">Message</Button>
                                </Link>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <User className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-gray-900 font-medium">No connections yet</h3>
                        <p className="mt-1 text-gray-600">Connect with others to build your network</p>
                        {isOwnProfile && (
                          <Link href="/community">
                            <Button className="mt-4 bg-primary">Find People</Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="background">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Education Section */}
                      <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <GraduationCap className="h-5 w-5 mr-2" />
                              Education
                            </CardTitle>
                            <CardDescription>Education history and qualifications</CardDescription>
                          </div>
                          {isOwnProfile && <AddEducationForm userId={parseInt(userId || user.id.toString())} />}
                        </CardHeader>
                        <CardContent>
                          {isEducationLoading ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            <EducationHistorySection userId={parseInt(userId || user.id.toString())} isCurrentUser={isOwnProfile} />
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Work Experience Section */}
                      <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <Briefcase className="h-5 w-5 mr-2" />
                              Work Experience
                            </CardTitle>
                            <CardDescription>Professional experience and career history</CardDescription>
                          </div>
                          {isOwnProfile && <AddWorkForm userId={parseInt(userId || user.id.toString())} />}
                        </CardHeader>
                        <CardContent>
                          {isWorkLoading ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            <WorkHistorySection userId={parseInt(userId || user.id.toString())} isCurrentUser={isOwnProfile} />
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="network">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Followers</CardTitle>
                          <CardDescription>People who follow {isOwnProfile ? 'you' : profileData.fullName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isFollowersLoading ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : followers && followers.length > 0 ? (
                            <div className="space-y-4">
                              {followers.map((follower: any) => (
                                <div key={follower.id} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      {follower.follower.profileImage ? (
                                        <AvatarImage src={follower.follower.profileImage} alt={follower.follower.fullName} />
                                      ) : (
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {follower.follower.fullName.charAt(0)}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{follower.follower.fullName}</p>
                                      <p className="text-sm text-gray-600">@{follower.follower.username}</p>
                                    </div>
                                  </div>
                                  <Link href={`/profile?id=${follower.follower.id}`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-600">No followers yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Following</CardTitle>
                          <CardDescription>People {isOwnProfile ? 'you follow' : `${profileData.fullName} follows`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isFollowingLoading ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : following && following.length > 0 ? (
                            <div className="space-y-4">
                              {following.map((follow: any) => (
                                <div key={follow.id} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      {follow.followed.profileImage ? (
                                        <AvatarImage src={follow.followed.profileImage} alt={follow.followed.fullName} />
                                      ) : (
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {follow.followed.fullName.charAt(0)}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{follow.followed.fullName}</p>
                                      <p className="text-sm text-gray-600">@{follow.followed.username}</p>
                                    </div>
                                  </div>
                                  <Link href={`/profile?id=${follow.followed.id}`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-600">Not following anyone yet</p>
                              {isOwnProfile && (
                                <Link href="/community">
                                  <Button className="mt-4 bg-primary">Find People</Button>
                                </Link>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {isOwnProfile && (
                    <TabsContent value="preferences">
                      <div className="max-w-3xl mx-auto">
                        <h3 className="text-xl font-semibold mb-4">Your Preferences</h3>
                        <p className="text-gray-600 mb-6">
                          Customize your experience by setting your preferences. This helps us recommend events and content that match your interests.
                        </p>
                        <PreferencesForm />
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
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
