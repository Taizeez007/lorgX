import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Search, Send } from "lucide-react";

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: string;
}

interface ChatUser {
  id: number;
  fullName: string;
  username: string;
  profileImage?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
}

export default function ChatPage() {
  const [loc] = useLocation();
  const searchParams = new URLSearchParams(loc.search || "");
  const initialChatUserId = searchParams.get("user");
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    initialChatUserId ? parseInt(initialChatUserId) : null
  );
  const [message, setMessage] = useState("");
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch connections to get chat users
  const { data: connections, isLoading: isConnectionsLoading } = useQuery({
    queryKey: ["/api/connections"],
    enabled: !!user,
  });
  
  // Fetch messages for the selected user
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["/api/messages", user?.id, selectedUserId],
    queryFn: async () => {
      if (!user || !selectedUserId) return [];
      
      // Call API to get conversation
      try {
        const res = await fetch(`/api/conversations?user1=${user.id}&user2=${selectedUserId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        return await res.json();
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!user && !!selectedUserId,
  });
  
  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Connecting to WebSocket at:", wsUrl);
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connected successfully");
      setWsConnection(socket);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        
        if (data.type === 'chat_message') {
          const newMessage = data.data;
          
          // If the message is part of the current conversation, add it to the chat
          if (
            (newMessage.senderId === user.id && newMessage.receiverId === selectedUserId) ||
            (newMessage.senderId === selectedUserId && newMessage.receiverId === user.id)
          ) {
            setChatMessages(prev => [...prev, newMessage]);
          }
          
          // Update the chat users list with new last message
          setChatUsers(prev => {
            return prev.map(chatUser => {
              if (chatUser.id === newMessage.senderId || chatUser.id === newMessage.receiverId) {
                return {
                  ...chatUser,
                  lastMessage: {
                    content: newMessage.content,
                    createdAt: newMessage.createdAt,
                    isRead: newMessage.isRead,
                  },
                };
              }
              return chatUser;
            });
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat service. Please try again later.",
        variant: "destructive",
      });
    };
    
    socket.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setWsConnection(null);
    };
    
    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [user, toast]);
  
  // Update messages when data changes
  useEffect(() => {
    if (messages) {
      setChatMessages(messages);
    }
  }, [messages]);
  
  // Update chat users when connections data changes
  useEffect(() => {
    if (connections) {
      const connectionUsers: ChatUser[] = connections.map((conn: any) => {
        const otherUser = conn.user1Id === user?.id ? conn.user2 : conn.user1;
        return {
          id: otherUser.id,
          fullName: otherUser.fullName,
          username: otherUser.username,
          profileImage: otherUser.profileImage,
          lastMessage: conn.lastMessage || undefined,
        };
      });
      
      setChatUsers(connectionUsers);
    }
  }, [connections, user]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  // Send message
  const sendMessage = () => {
    if (!message.trim() || !wsConnection || !user || !selectedUserId) return;
    
    // Prepare message data
    const messageData = {
      type: 'chat_message',
      data: {
        content: message,
        senderId: user.id,
        receiverId: selectedUserId,
      },
    };
    
    // Send through WebSocket
    wsConnection.send(JSON.stringify(messageData));
    console.log("Sending message:", messageData);
    
    // Clear input
    setMessage("");
  };
  
  // Format date for chat
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[75vh]">
              {/* Chat Users Sidebar */}
              <div className="border-r border-gray-200 md:col-span-1 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  {isConnectionsLoading ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : chatUsers.length > 0 ? (
                    <div>
                      {chatUsers.map((chatUser) => (
                        <button
                          key={chatUser.id}
                          onClick={() => setSelectedUserId(chatUser.id)}
                          className={`w-full text-left p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                            selectedUserId === chatUser.id ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {chatUser.profileImage ? (
                                <img
                                  src={chatUser.profileImage}
                                  alt={chatUser.fullName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-primary font-medium">
                                  {chatUser.fullName.charAt(0)}
                                </span>
                              )}
                            </div>
                            {/* Online indicator would go here */}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {chatUser.fullName}
                              </h4>
                              {chatUser.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(chatUser.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-500 truncate">
                              {chatUser.lastMessage
                                ? chatUser.lastMessage.content
                                : `@${chatUser.username}`}
                            </p>
                            
                            {chatUser.lastMessage && !chatUser.lastMessage.isRead && (
                              <span className="inline-block h-2 w-2 rounded-full bg-primary mt-1"></span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No contacts yet</p>
                      <Link href="/community">
                        <Button className="mt-4 bg-primary">Find Connections</Button>
                      </Link>
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              {/* Chat Messages */}
              <div className="md:col-span-2 lg:col-span-3 flex flex-col">
                {selectedUserId ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {chatUsers.find(u => u.id === selectedUserId)?.profileImage ? (
                            <img
                              src={chatUsers.find(u => u.id === selectedUserId)?.profileImage}
                              alt={chatUsers.find(u => u.id === selectedUserId)?.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-medium">
                              {chatUsers.find(u => u.id === selectedUserId)?.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {chatUsers.find(u => u.id === selectedUserId)?.fullName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            @{chatUsers.find(u => u.id === selectedUserId)?.username}
                          </p>
                        </div>
                      </div>
                      
                      <Link href={`/profile?id=${selectedUserId}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                    
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      {isMessagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : chatMessages.length > 0 ? (
                        <div className="space-y-4">
                          {chatMessages.map((msg) => {
                            const isOwnMessage = msg.senderId === user?.id;
                            
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                    isOwnMessage
                                      ? 'bg-primary text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-50' : 'text-gray-500'}`}>
                                    {formatMessageTime(msg.createdAt)}
                                    {isOwnMessage && msg.isRead && " • Read"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No messages yet
                          </h3>
                          <p className="text-sm text-gray-500">Send a message to start the conversation</p>
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button 
                          onClick={sendMessage} 
                          disabled={!wsConnection || !message.trim()}
                          className="bg-primary"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      {!wsConnection && (
                        <p className="text-xs text-red-500 mt-1">
                          Chat connection lost. Please refresh the page.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose a contact to start chatting
                    </p>
                    <Link href="/community">
                      <Button className="mt-6 bg-primary">Find Connections</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
