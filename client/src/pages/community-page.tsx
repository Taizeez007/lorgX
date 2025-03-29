import { useState } from "react";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SidebarLeft from "@/components/layout/sidebar-left";
import SidebarRight from "@/components/layout/sidebar-right";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, UserPlus, Search, MessageSquare } from "lucide-react";

export default function CommunityPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("people");
  
  const { user } = useAuth();
  
  // Fetch all users
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: activeTab === "people",
  });
  
  // Fetch all communities
  const { data: communities, isLoading: isCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities"],
    enabled: activeTab === "communities",
  });
  
  // Fetch user's communities
  const { data: userCommunities, isLoading: isUserCommunitiesLoading } = useQuery({
    queryKey: ["/api/communities/user"],
    enabled: !!user && activeTab === "my-communities",
  });
  
  // Filter users based on search term
  const filteredUsers = users?.filter((user: any) => {
    return (
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Filter communities based on search term
  const filteredCommunities = communities?.filter((community: any) => {
    return (
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (community.description && community.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Community</h1>
                <p className="text-gray-600 mb-6">
                  Connect with people and communities that share your interests
                </p>
                
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for people or communities..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Tabs */}
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="people">People</TabsTrigger>
                    <TabsTrigger value="communities">Communities</TabsTrigger>
                    <TabsTrigger value="my-communities">My Communities</TabsTrigger>
                  </TabsList>
                  
                  {/* People Tab */}
                  <TabsContent value="people">
                    {isUsersLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((person: any) => (
                          <Card key={person.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  {person.profileImage ? (
                                    <AvatarImage src={person.profileImage} alt={person.fullName} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {person.fullName.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{person.fullName}</CardTitle>
                                  <p className="text-sm text-gray-600">@{person.username}</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {person.bio || `${person.fullName} is a user on the platform`}
                              </p>
                              {person.location && (
                                <Badge className="mt-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">
                                  {person.location}
                                </Badge>
                              )}
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Link href={`/profile?id=${person.id}`}>
                                <Button variant="outline" className="flex items-center gap-1" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                              <Link href={`/chat?user=${person.id}`}>
                                <Button className="bg-primary flex items-center gap-1" size="sm">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  Message
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No users found</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Communities Tab */}
                  <TabsContent value="communities">
                    {isCommunitiesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredCommunities && filteredCommunities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommunities.map((community: any) => (
                          <Card key={community.id} className="overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                              {community.bannerImage ? (
                                <img 
                                  src={community.bannerImage} 
                                  alt={community.name} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <Users className="h-12 w-12 text-primary/30" />
                              )}
                            </div>
                            <CardHeader>
                              <CardTitle>{community.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {community.description || `A community for people interested in ${community.name}`}
                              </p>
                              <div className="flex items-center mt-3 text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{community.memberCount || 0} members</span>
                              </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Link href={`/community/${community.id}`}>
                                <Button variant="outline" size="sm">View Community</Button>
                              </Link>
                              <Button className="bg-primary" size="sm">
                                <UserPlus className="h-3.5 w-3.5 mr-1" />
                                Join
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No communities found</p>
                      </div>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Link href="/community/create">
                        <Button className="bg-primary">Create a Community</Button>
                      </Link>
                    </div>
                  </TabsContent>
                  
                  {/* My Communities Tab */}
                  <TabsContent value="my-communities">
                    {isUserCommunitiesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : userCommunities && userCommunities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userCommunities.map((community: any) => (
                          <Card key={community.id} className="overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                              {community.bannerImage ? (
                                <img 
                                  src={community.bannerImage} 
                                  alt={community.name} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <Users className="h-12 w-12 text-primary/30" />
                              )}
                            </div>
                            <CardHeader>
                              <CardTitle>{community.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {community.description || `A community for people interested in ${community.name}`}
                              </p>
                              <div className="flex items-center mt-3 text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{community.memberCount || 0} members</span>
                              </div>
                              
                              {community.creatorId === user?.id && (
                                <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                  You're the admin
                                </Badge>
                              )}
                            </CardContent>
                            <CardFooter>
                              <Link href={`/community/${community.id}`}>
                                <Button className="bg-primary">View Community</Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">You're not a member of any community yet</p>
                        <Link href="/community">
                          <Button className="mt-4 bg-primary">Join Communities</Button>
                        </Link>
                      </div>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Link href="/community/create">
                        <Button className="bg-primary">Create a Community</Button>
                      </Link>
                    </div>
                  </TabsContent>
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
