import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { 
  InsertPost, 
  InsertEvent, 
  InsertEventPlace, 
  InsertConnection,
  InsertFollower,
  InsertCommunity,
  InsertCommunityMember,
  InsertMessage,
  InsertBooking,
  InsertComment,
  InsertBusinessProfile,
  InsertBusinessEditor,
  insertPostSchema,
  insertEventSchema,
  insertEventPlaceSchema,
  insertConnectionSchema,
  insertFollowerSchema,
  insertCommunitySchema,
  insertCommunityMemberSchema,
  insertMessageSchema,
  insertBookingSchema,
  insertCommentSchema,
  insertBusinessProfileSchema,
  insertBusinessEditorSchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Error handling for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Event Places API
  app.get("/api/places", async (req, res) => {
    try {
      const places = await storage.getEventPlaces();
      res.json(places);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/places/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const places = await storage.getEventPlacesByCategory(categoryId);
      res.json(places);
    } catch (error) {
      console.error("Error fetching places by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/places", ensureAuthenticated, async (req, res) => {
    try {
      const placeData = insertEventPlaceSchema.parse(req.body);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newPlace: InsertEventPlace = {
        ...placeData,
        createdById: userId
      };
      
      const place = await storage.createEventPlace(newPlace);
      res.status(201).json(place);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getPublicEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/live", async (req, res) => {
    try {
      const events = await storage.getLiveEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching live events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const events = await storage.getEventsByCategory(categoryId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/user", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const events = await storage.getEventsByUser(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/events", ensureAuthenticated, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newEvent: InsertEvent = {
        ...eventData,
        createdById: userId
      };
      
      const event = await storage.createEvent(newEvent);
      res.status(201).json(event);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Implement other API routes here
  
  // Posts API
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/posts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const posts = await storage.getPostsByUser(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts by user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts", ensureAuthenticated, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newPost: InsertPost = {
        ...postData,
        userId
      };
      
      const post = await storage.createPost(newPost);
      res.status(201).json(post);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Comments API
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts/:postId/comments", ensureAuthenticated, async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const postId = parseInt(req.params.postId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const newComment: InsertComment = {
        ...commentData,
        postId,
        userId
      };
      
      const comment = await storage.createComment(newComment);
      res.status(201).json(comment);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Connections API
  app.get("/api/connections", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const connections = await storage.getConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/connections/requests", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const requests = await storage.getConnectionRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/connections", ensureAuthenticated, async (req, res) => {
    try {
      const connectionData = insertConnectionSchema.parse(req.body);
      const requesterId = req.user?.id;
      
      if (!requesterId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newConnection: InsertConnection = {
        ...connectionData,
        requesterId
      };
      
      const connection = await storage.createConnection(newConnection);
      res.status(201).json(connection);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.post("/api/connections/:id/respond", ensureAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const connectionId = parseInt(req.params.id);
      
      if (isNaN(connectionId)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
      }
      
      const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
      
      if (!updatedConnection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      res.json(updatedConnection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Followers API
  app.get("/api/followers/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/following/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/follow", ensureAuthenticated, async (req, res) => {
    try {
      const { followedId } = req.body;
      const followerId = req.user?.id;
      
      if (!followerId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!followedId) {
        return res.status(400).json({ message: "Followed user ID is required" });
      }
      
      const newFollower: InsertFollower = {
        followerId,
        followedId
      };
      
      const follower = await storage.createFollower(newFollower);
      res.status(201).json(follower);
    } catch (error) {
      console.error("Error creating follower:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/follow/:id", ensureAuthenticated, async (req, res) => {
    try {
      const followerId = parseInt(req.params.id);
      
      if (isNaN(followerId)) {
        return res.status(400).json({ message: "Invalid follower ID" });
      }
      
      await storage.removeFollower(followerId);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing follower:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Communities API
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/communities/user", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const communities = await storage.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/communities", ensureAuthenticated, async (req, res) => {
    try {
      const communityData = insertCommunitySchema.parse(req.body);
      const creatorId = req.user?.id;
      
      if (!creatorId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newCommunity: InsertCommunity = {
        ...communityData,
        creatorId
      };
      
      const community = await storage.createCommunity(newCommunity);
      
      // Add creator as a member automatically
      await storage.addCommunityMember({
        communityId: community.id,
        userId: creatorId,
        role: 'admin'
      });
      
      res.status(201).json(community);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/communities/:id/members", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }
      
      const members = await storage.getCommunityMembers(communityId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/communities/:id/join", ensureAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }
      
      const newMember: InsertCommunityMember = {
        communityId,
        userId,
        role: 'member'
      };
      
      const member = await storage.addCommunityMember(newMember);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/communities/:id/leave", ensureAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }
      
      await storage.removeCommunityMember(communityId, userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Messages API
  app.get("/api/conversations", ensureAuthenticated, async (req, res) => {
    try {
      const user1Id = parseInt(req.query.user1 as string);
      const user2Id = parseInt(req.query.user2 as string);
      
      if (isNaN(user1Id) || isNaN(user2Id)) {
        return res.status(400).json({ message: "Invalid user IDs" });
      }
      
      const messages = await storage.getConversation(user1Id, user2Id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/messages", ensureAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const senderId = req.user?.id;
      
      if (!senderId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newMessage: InsertMessage = {
        ...messageData,
        senderId
      };
      
      const message = await storage.createMessage(newMessage);
      res.status(201).json(message);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Bookings API
  app.get("/api/bookings/user", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/:eventId/bookings", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const bookings = await storage.getBookingsByEvent(eventId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching event bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/bookings", ensureAuthenticated, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const newBooking: InsertBooking = {
        ...bookingData,
        userId
      };
      
      const booking = await storage.createBooking(newBooking);
      res.status(201).json(booking);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.post("/api/bookings/:id/status", ensureAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const bookingId = parseInt(req.params.id);
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      if (status !== 'confirmed' && status !== 'cancelled' && status !== 'pending') {
        return res.status(400).json({ message: "Status must be 'confirmed', 'cancelled', or 'pending'" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Business Profile API
  app.get("/api/business-profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getBusinessProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/business-profile", ensureAuthenticated, async (req, res) => {
    try {
      const profileData = insertBusinessProfileSchema.parse(req.body);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getBusinessProfile(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "User already has a business profile" });
      }
      
      const newBusinessProfile: InsertBusinessProfile = {
        ...profileData,
        userId
      };
      
      const profile = await storage.createBusinessProfile(newBusinessProfile);
      
      // Update user to set isBusinessAccount to true
      await storage.updateUser(userId, { isBusinessAccount: true });
      
      res.status(201).json(profile);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put("/api/business-profile/:id", ensureAuthenticated, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      // Validate if the user can edit this profile
      const userBusinesses = await storage.getBusinessesManagedByUser(userId);
      const canEdit = userBusinesses.some(business => business.id === profileId);
      
      if (!canEdit) {
        return res.status(403).json({ message: "Not authorized to edit this business profile" });
      }
      
      const profileData = insertBusinessProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateBusinessProfile(profileId, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Business Editors API
  app.get("/api/business/:businessId/editors", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "Invalid business ID" });
      }
      
      const editors = await storage.getBusinessEditors(businessId);
      res.json(editors);
    } catch (error) {
      console.error("Error fetching business editors:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/business/:businessId/editors", ensureAuthenticated, async (req, res) => {
    try {
      const { editorId, role } = req.body;
      const businessId = parseInt(req.params.businessId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(businessId)) {
        return res.status(400).json({ message: "Invalid business ID" });
      }
      
      // Validate if the user is an owner of this business
      const editors = await storage.getBusinessEditors(businessId);
      const isOwner = editors.some(editor => 
        editor.editorId === userId && editor.role === "owner"
      );
      
      if (!isOwner) {
        return res.status(403).json({ message: "Only owners can add editors" });
      }
      
      const newEditor: InsertBusinessEditor = {
        businessId,
        editorId,
        role: role || "editor"
      };
      
      const editor = await storage.addBusinessEditor(newEditor);
      res.status(201).json(editor);
    } catch (error) {
      console.error("Error adding business editor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/business/:businessId/editors/:editorId", ensureAuthenticated, async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const editorId = parseInt(req.params.editorId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(businessId) || isNaN(editorId)) {
        return res.status(400).json({ message: "Invalid business ID or editor ID" });
      }
      
      // Validate if the user is an owner of this business
      const editors = await storage.getBusinessEditors(businessId);
      const isOwner = editors.some(editor => 
        editor.editorId === userId && editor.role === "owner"
      );
      
      if (!isOwner) {
        return res.status(403).json({ message: "Only owners can remove editors" });
      }
      
      // Don't allow removing the owner
      const isTargetOwner = editors.some(editor => 
        editor.editorId === editorId && editor.role === "owner"
      );
      
      if (isTargetOwner) {
        return res.status(400).json({ message: "Cannot remove the owner" });
      }
      
      await storage.removeBusinessEditor(businessId, editorId);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing business editor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/managed-businesses", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const businesses = await storage.getBusinessesManagedByUser(userId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching managed businesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (messageData) => {
      try {
        const message = JSON.parse(messageData.toString());
        
        // Validate message format
        if (!message.type || !message.data) {
          return;
        }
        
        switch (message.type) {
          case 'chat_message':
            const { senderId, receiverId, content } = message.data;
            
            if (!senderId || !receiverId || !content) {
              return;
            }
            
            // Save message to storage
            const newMessage = await storage.createMessage({
              content,
              senderId,
              receiverId
            });
            
            // Broadcast to all clients (in production, would be more targeted)
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat_message',
                  data: newMessage
                }));
              }
            });
            break;
            
          case 'mark_read':
            const { messageId } = message.data;
            
            if (!messageId) {
              return;
            }
            
            await storage.markMessageAsRead(messageId);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
