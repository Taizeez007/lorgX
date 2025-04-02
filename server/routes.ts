import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import Paystack from "paystack";
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
  InsertPostLike,
  InsertEventLike,
  InsertSavedEvent,
  InsertSavedPlace,
  InsertPostShare,
  InsertBlockedUser,
  InsertAdminUser,
  InsertUnblockRequest,
  insertPostSchema,
  insertEventSchema,
  insertPostLikeSchema,
  insertEventLikeSchema,
  insertSavedEventSchema,
  insertSavedPlaceSchema,
  insertPostShareSchema,
  insertEventPlaceSchema,
  insertConnectionSchema,
  insertFollowerSchema,
  insertCommunitySchema,
  insertCommunityMemberSchema,
  insertMessageSchema,
  insertBookingSchema,
  insertCommentSchema,
  insertBusinessProfileSchema,
  insertBusinessEditorSchema,
  insertBlockedUserSchema,
  insertAdminUserSchema,
  insertUnblockRequestSchema
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

// Initialize payment gateways with placeholder values - real values to be added later
// Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_stripe';
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-01-01',
});

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_dummy_key_for_paystack';
const paystack = Paystack(PAYSTACK_SECRET_KEY);

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
  
  // Advanced search endpoint
  app.get("/api/search/events", async (req, res) => {
    try {
      // Extract search parameters from query params
      const query = req.query.query as string | undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const isFree = req.query.isFree === 'true';
      const isVirtual = req.query.isVirtual === 'true';
      const isHybrid = req.query.isHybrid === 'true';
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Search for events with the provided filters
      const events = await storage.searchEvents({
        query,
        categoryId,
        startDate,
        endDate,
        isFree: req.query.isFree !== undefined ? isFree : undefined,
        isVirtual: req.query.isVirtual !== undefined ? isVirtual : undefined,
        isHybrid: req.query.isHybrid !== undefined ? isHybrid : undefined,
        maxPrice,
        limit,
        offset
      });
      
      res.json(events);
    } catch (error) {
      console.error("Error searching events:", error);
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

  // User account deletion routes
  app.post("/api/user/delete-request", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const updatedUser = await storage.requestDeleteUser(userId);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Delete request received. Account will be deleted in 24 hours (or 72 hours for business accounts)." });
    } catch (error) {
      console.error("Error requesting user deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/user/cancel-delete", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const updatedUser = await storage.cancelDeleteUser(userId);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Delete request canceled." });
    } catch (error) {
      console.error("Error canceling user deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Event place deletion routes
  app.post("/api/places/:id/delete-request", ensureAuthenticated, async (req, res) => {
    try {
      const placeId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      // Check if the user is authorized to delete this place
      const place = await storage.getEventPlace(placeId);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      if (place.createdById !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this place" });
      }
      
      const updatedPlace = await storage.requestDeleteEventPlace(placeId);
      
      res.status(200).json({ message: "Delete request received. Place will be deleted in 72 hours." });
    } catch (error) {
      console.error("Error requesting place deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/places/:id/cancel-delete", ensureAuthenticated, async (req, res) => {
    try {
      const placeId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      // Check if the user is authorized to modify this place
      const place = await storage.getEventPlace(placeId);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      if (place.createdById !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this place" });
      }
      
      const updatedPlace = await storage.cancelDeleteEventPlace(placeId);
      
      res.status(200).json({ message: "Delete request canceled." });
    } catch (error) {
      console.error("Error canceling place deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Event deletion and social interaction routes
  app.post("/api/events/:id/delete-request", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if the user is authorized to delete this event
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.createdById !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this event" });
      }
      
      const updatedEvent = await storage.requestDeleteEvent(eventId);
      
      res.status(200).json({ message: "Delete request received. Event will be deleted in 72 hours." });
    } catch (error) {
      console.error("Error requesting event deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/events/:id/cancel-delete", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if the user is authorized to modify this event
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.createdById !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this event" });
      }
      
      const updatedEvent = await storage.cancelDeleteEvent(eventId);
      
      res.status(200).json({ message: "Delete request canceled." });
    } catch (error) {
      console.error("Error canceling event deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Post social interactions and deletion routes
  app.post("/api/posts/:id/like", ensureAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if post exists
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.likePost(postId, userId);
      
      res.status(200).json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/posts/:id/like", ensureAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      await storage.unlikePost(postId, userId);
      
      res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/posts/:id/share", ensureAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      const { sharedTo } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      if (!sharedTo) {
        return res.status(400).json({ message: "Missing sharedTo parameter" });
      }
      
      // Check if post exists
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.sharePost(postId, userId, sharedTo);
      
      res.status(200).json({ message: "Post shared successfully" });
    } catch (error) {
      console.error("Error sharing post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/posts/:id/delete-request", ensureAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if the user is authorized to delete this post
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      const updatedPost = await storage.requestDeletePost(postId);
      
      res.status(200).json({ message: "Delete request received. Post will be deleted in 24 hours." });
    } catch (error) {
      console.error("Error requesting post deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/posts/:id/cancel-delete", ensureAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if the user is authorized to modify this post
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this post" });
      }
      
      const updatedPost = await storage.cancelDeletePost(postId);
      
      res.status(200).json({ message: "Delete request canceled." });
    } catch (error) {
      console.error("Error canceling post deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Event social interactions
  app.post("/api/events/:id/like", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      await storage.likeEvent(eventId, userId);
      
      res.status(200).json({ message: "Event liked successfully" });
    } catch (error) {
      console.error("Error liking event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/events/:id/like", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      await storage.unlikeEvent(eventId, userId);
      
      res.status(200).json({ message: "Event unliked successfully" });
    } catch (error) {
      console.error("Error unliking event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/events/:id/save", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      await storage.saveEvent(eventId, userId);
      
      res.status(200).json({ message: "Event saved successfully" });
    } catch (error) {
      console.error("Error saving event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/events/:id/save", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      await storage.unsaveEvent(eventId, userId);
      
      res.status(200).json({ message: "Event unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user/saved-events", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const savedEvents = await storage.getSavedEvents(userId);
      
      res.status(200).json(savedEvents);
    } catch (error) {
      console.error("Error fetching saved events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user/liked-events", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const likedEvents = await storage.getLikedEvents(userId);
      
      res.status(200).json(likedEvents);
    } catch (error) {
      console.error("Error fetching liked events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Place save/unsave routes
  app.post("/api/places/:id/save", ensureAuthenticated, async (req, res) => {
    try {
      const placeId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      // Check if place exists
      const place = await storage.getEventPlace(placeId);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      await storage.savePlace(placeId, userId);
      
      res.status(200).json({ message: "Place saved successfully" });
    } catch (error) {
      console.error("Error saving place:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/places/:id/save", ensureAuthenticated, async (req, res) => {
    try {
      const placeId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      await storage.unsavePlace(placeId, userId);
      
      res.status(200).json({ message: "Place unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving place:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user/saved-places", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const savedPlaces = await storage.getSavedPlaces(userId);
      
      res.status(200).json(savedPlaces);
    } catch (error) {
      console.error("Error fetching saved places:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user/liked-posts", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const likedPosts = await storage.getLikedPosts(userId);
      
      res.status(200).json(likedPosts);
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user/shared-posts", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sharedPosts = await storage.getSharedPosts(userId);
      
      res.status(200).json(sharedPosts);
    } catch (error) {
      console.error("Error fetching shared posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User preferences and recommendations
  app.get("/api/user/preferences", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user.preferences || {});
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/user/preferences", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const preferences = req.body;
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(updatedUser.preferences || {});
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/events/recommended", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Parse limit from query parameters, default to 10
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const recommendedEvents = await storage.getRecommendedEvents(userId, limit);
      
      res.status(200).json(recommendedEvents);
    } catch (error) {
      console.error("Error fetching recommended events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment integration for events with more than 300 attendees
  
  // Stripe payment integration
  app.post("/api/payments/stripe/create-payment-intent", ensureAuthenticated, async (req, res) => {
    try {
      const { amount, eventId, currency = "usd" } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!amount || !eventId) {
        return res.status(400).json({ message: "Amount and eventId are required" });
      }
      
      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: { 
          eventId: eventId.toString(),
          userId: userId.toString() 
        }
      });
      
      // Return client secret
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating Stripe payment intent:", error);
      res.status(500).json({ message: "Error processing payment" });
    }
  });
  
  // Stripe webhook handler for payment confirmation
  app.post("/api/payments/stripe/webhook", async (req, res) => {
    // In production, this should verify webhook signatures
    try {
      const event = req.body;
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const eventId = parseInt(paymentIntent.metadata.eventId);
        const isGuestBooking = paymentIntent.metadata.isGuestBooking === 'true';
        
        // Create the booking data object
        const bookingData: any = {
          eventId,
          paymentStatus: 'paid',
          paymentMethod: 'stripe',
          paymentAmount: paymentIntent.amount / 100,
          paymentCurrency: paymentIntent.currency,
          paymentReference: paymentIntent.id
        };
        
        // Add either user ID or guest information
        if (isGuestBooking) {
          bookingData.isGuestBooking = true;
          bookingData.guestName = paymentIntent.metadata.guestName;
          bookingData.guestEmail = paymentIntent.metadata.guestEmail;
          bookingData.guestPhone = paymentIntent.metadata.guestPhone;
          bookingData.numberOfTickets = parseInt(paymentIntent.metadata.numberOfTickets || '1');
        } else {
          bookingData.userId = parseInt(paymentIntent.metadata.userId);
        }
        
        // Create booking after successful payment
        await storage.createBooking(bookingData);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling Stripe webhook:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });
  
  // Paystack payment integration for both logged-in users and guests
  app.post("/api/payments/paystack/initialize", async (req, res) => {
    try {
      const { 
        amount, 
        eventId, 
        email, 
        currency = "NGN",
        isGuestBooking,
        guestName,
        guestEmail,
        guestPhone,
        numberOfTickets = 1
      } = req.body;
      
      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? req.user?.id : null;
      
      // Validate required fields
      if (!amount || !eventId || !email) {
        return res.status(400).json({ message: "Amount, eventId, and email are required" });
      }
      
      // For guest bookings, validate guest information
      if (isGuestBooking && (!guestName || !guestEmail)) {
        return res.status(400).json({ message: "Guest name and email are required for guest bookings" });
      }
      
      // If not a guest booking and not authenticated, return error
      if (!isGuestBooking && !userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Prepare metadata based on booking type
      const metadata: any = {
        eventId: eventId.toString(),
        isGuestBooking: isGuestBooking ? 'true' : 'false',
        numberOfTickets: numberOfTickets.toString()
      };
      
      // Add appropriate user data
      if (isGuestBooking) {
        metadata.guestName = guestName;
        metadata.guestEmail = guestEmail;
        metadata.guestPhone = guestPhone || '';
      } else {
        metadata.userId = userId!.toString();
      }
      
      // Initialize transaction
      const response = await paystack.transaction.initialize({
        amount: Math.round(parseFloat(amount) * 100), // Convert to kobo (smallest unit)
        email: isGuestBooking ? guestEmail : email,
        metadata,
        currency
      });
      
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error initializing Paystack payment:", error);
      res.status(500).json({ message: "Error processing payment" });
    }
  });
  
  // Paystack payment verification for both logged-in users and guests
  app.get("/api/payments/paystack/verify/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      
      // Verify transaction
      const response = await paystack.transaction.verify(reference);
      
      if (response.data.status === 'success') {
        const { metadata } = response.data;
        const eventId = parseInt(metadata.eventId);
        const isGuestBooking = metadata.isGuestBooking === 'true';
        
        // Create the booking data object
        const bookingData: any = {
          eventId,
          paymentStatus: 'paid',
          paymentMethod: 'paystack',
          paymentAmount: response.data.amount / 100,
          paymentCurrency: response.data.currency,
          paymentReference: reference
        };
        
        // Add either user ID or guest information
        if (isGuestBooking) {
          bookingData.isGuestBooking = true;
          bookingData.guestName = metadata.guestName;
          bookingData.guestEmail = metadata.guestEmail;
          bookingData.guestPhone = metadata.guestPhone || '';
          bookingData.numberOfTickets = parseInt(metadata.numberOfTickets || '1');
        } else {
          // If not a guest booking, ensure user is authenticated
          if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "User not authenticated" });
          }
          bookingData.userId = req.user?.id;
        }
        
        // Create booking after successful payment
        await storage.createBooking(bookingData);
        
        res.status(200).json({ status: 'success', data: response.data });
      } else {
        res.status(400).json({ status: 'failed', message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying Paystack payment:", error);
      res.status(500).json({ message: "Error verifying payment" });
    }
  });
  
  // Get all bookings for an event (for event organizers)
  app.get("/api/events/:eventId/bookings", ensureAuthenticated, async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Check if the event exists
      const event = await storage.getEventById(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the user is the creator of the event or a business editor
      const isCreator = event.createdById === userId;
      
      // If the event has a businessId, check if the user is an editor
      let isEditor = false;
      if ('businessId' in event && event.businessId) {
        const editors = await storage.getBusinessEditors(event.businessId);
        isEditor = editors.some(editor => editor.editorId === userId);
      }
      
      if (!isCreator && !isEditor) {
        return res.status(403).json({ message: "You don't have permission to view bookings for this event" });
      }
      
      // Get all bookings for the event
      const bookings = await storage.getBookingsByEvent(parseInt(eventId));
      
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching event bookings:", error);
      res.status(500).json({ message: "Error fetching event bookings" });
    }
  });
  
  // Create direct booking without payment (for free events)
  app.post("/api/bookings", async (req, res) => {
    try {
      const {
        eventId,
        isGuestBooking,
        guestName,
        guestEmail,
        guestPhone,
        numberOfTickets = 1,
        additionalNotes
      } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      
      // Check if the event exists
      const event = await storage.getEventById(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if event is free
      if (event.price && parseFloat(String(event.price)) > 0) {
        return res.status(400).json({ 
          message: "This endpoint is for free events only. For paid events, use the payment endpoints." 
        });
      }
      
      // Create the booking data object
      const bookingData: any = {
        eventId: parseInt(eventId),
        status: 'confirmed',
        numberOfTickets: parseInt(numberOfTickets),
        additionalNotes
      };
      
      // Add either user ID or guest information
      if (isGuestBooking) {
        // Validate guest booking fields
        if (!guestName || !guestEmail) {
          return res.status(400).json({ message: "Guest name and email are required for guest bookings" });
        }
        
        bookingData.isGuestBooking = true;
        bookingData.guestName = guestName;
        bookingData.guestEmail = guestEmail;
        bookingData.guestPhone = guestPhone || '';
      } else {
        // If not a guest booking, ensure user is authenticated
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        bookingData.userId = req.user?.id;
      }
      
      // Create the booking
      const booking = await storage.createBooking(bookingData);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Error creating booking" });
    }
  });

  // Account Management API
  // User Blocking
  app.post("/api/users/block", ensureAuthenticated, async (req, res) => {
    try {
      const { blockedId, reason } = req.body;
      const blockerId = req.user?.id;
      
      if (!blockerId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!blockedId) {
        return res.status(400).json({ message: "Blocked user ID is required" });
      }
      
      // Check if already blocked
      const isAlreadyBlocked = await storage.isUserBlocked(blockerId, blockedId);
      if (isAlreadyBlocked) {
        return res.status(400).json({ message: "User is already blocked" });
      }
      
      const blockedUser = await storage.blockUser(blockerId, blockedId, reason);
      res.status(201).json(blockedUser);
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/users/unblock", ensureAuthenticated, async (req, res) => {
    try {
      const { blockedId } = req.body;
      const blockerId = req.user?.id;
      
      if (!blockerId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!blockedId) {
        return res.status(400).json({ message: "Blocked user ID is required" });
      }
      
      await storage.unblockUser(blockerId, blockedId);
      res.status(204).end();
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/blocked", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const blockedUsers = await storage.getBlockedUsers(userId);
      res.json(blockedUsers);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Unblock Requests
  app.post("/api/unblock-requests", ensureAuthenticated, async (req, res) => {
    try {
      const { reason } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
      }
      
      const request = await storage.createUnblockRequest({ userId, reason });
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating unblock request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes - restricted to admin users
  const ensureAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const isAdmin = await storage.isUserAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  };
  
  // Super admin routes - restricted to super admin users
  const ensureSuperAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const isSuperAdmin = await storage.isSuperAdmin(userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Forbidden: Super admin access required" });
    }
    
    next();
  };
  
  app.get("/api/admin/unblock-requests", ensureAdmin, async (req, res) => {
    try {
      const requests = await storage.getPendingUnblockRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching unblock requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/unblock-requests/:id/resolve", ensureAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const requestId = parseInt(req.params.id);
      const adminId = req.user?.id;
      
      if (!adminId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      const updatedRequest = await storage.resolveUnblockRequest(requestId, status, adminId);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Unblock request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error resolving unblock request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/admins", ensureSuperAdmin, async (req, res) => {
    try {
      const { userId, role } = req.body;
      const assignedBy = req.user?.id;
      
      if (!assignedBy) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (!role || (role !== 'admin' && role !== 'super_admin')) {
        return res.status(400).json({ message: "Role must be 'admin' or 'super_admin'" });
      }
      
      const adminUser = await storage.createAdminUser({ userId, role, assignedBy });
      res.status(201).json(adminUser);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/admin/admins/:userId", ensureSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.removeAdminUser(userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing admin user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/admins", ensureSuperAdmin, async (req, res) => {
    try {
      const admins = await storage.getAdminUsers();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Account deletion request/cancel
  app.post("/api/users/request-delete", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const user = await storage.requestDeleteUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error requesting account deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/users/cancel-delete", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const user = await storage.cancelDeleteUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error cancelling account deletion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin delete user account immediately
  app.delete("/api/admin/users/:userId", ensureSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
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
