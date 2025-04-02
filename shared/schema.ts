import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  career: text("career"),
  preferences: jsonb("preferences"),
  isBusinessAccount: boolean("is_business_account").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
  deleteRequestedAt: timestamp("delete_requested_at"),
});

// Event categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

// Event places
export const eventPlaces = pgTable("event_places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: text("latitude"), // Geographic coordinate for mapping
  longitude: text("longitude"), // Geographic coordinate for mapping
  categoryId: integer("category_id").references(() => categories.id),
  businessId: integer("business_id").references(() => businessProfiles.id),
  capacity: integer("capacity").default(100),
  imageUrls: jsonb("image_urls").default([]), // Array of image URLs for the venue
  tags: jsonb("tags").default([]), // Array of tags for what the place can be used for
  amenities: jsonb("amenities").default([]), // Array of amenities like 'wifi', 'parking', 'wheelchair_accessible', etc.
  foods: jsonb("foods").default([]), // Array of food items with name and price
  drinks: jsonb("drinks").default([]), // Array of drink items with name and price
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  placeType: text("place_type"),
  createdById: integer("created_by_id").references(() => users.id),
  isDeleted: boolean("is_deleted").default(false),
  deleteRequestedAt: timestamp("delete_requested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  placeId: integer("place_id").references(() => eventPlaces.id),
  address: text("address"),
  latitude: text("latitude"), // Geographic coordinate for mapping
  longitude: text("longitude"), // Geographic coordinate for mapping
  categoryId: integer("category_id").references(() => categories.id),
  createdById: integer("created_by_id").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  isVirtual: boolean("is_virtual").default(false),
  isHybrid: boolean("is_hybrid").default(false),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  isLive: boolean("is_live").default(false),
  attendeeCount: integer("attendee_count").default(0),
  maxAttendees: integer("max_attendees").default(300), // 300 for free events by default
  isDeleted: boolean("is_deleted").default(false),
  deleteRequestedAt: timestamp("delete_requested_at"),
  likeCount: integer("like_count").default(0),
  saveCount: integer("save_count").default(0),
});

// Posts (similar to Instagram posts)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content"),
  imageUrl: text("image_url"),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  isDeleted: boolean("is_deleted").default(false),
  deleteRequestedAt: timestamp("delete_requested_at"),
});

// Comments on posts
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connections between users (friends, colleagues, network)
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  addresseeId: integer("addressee_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  connectionType: text("connection_type").notNull(), // friend, colleague, network
  createdAt: timestamp("created_at").defaultNow(),
});

// Followers (separate from connections)
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followedId: integer("followed_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communities/Groups
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  isPublic: boolean("is_public").default(true),
  memberCount: integer("member_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community members
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id), // Optional user ID for logged in users
  // Guest information for non-logged in users
  guestName: text("guest_name"),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  isGuestBooking: boolean("is_guest_booking").default(false),
  numberOfTickets: integer("number_of_tickets").default(1),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, pending
  paymentStatus: text("payment_status"), // paid, unpaid, refunded
  paymentMethod: text("payment_method"), // stripe, paystack, free
  paymentAmount: integer("payment_amount"),
  paymentCurrency: text("payment_currency"),
  paymentReference: text("payment_reference"),
  createdAt: timestamp("created_at").defaultNow(),
  additionalNotes: text("additional_notes"),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // event_invite, connection_request, etc.
  content: text("content").notNull(),
  sourceId: integer("source_id"), // ID of the event, connection, etc.
  sourceType: text("source_type"), // event, connection, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business Profiles
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique().notNull(),
  orgName: text("org_name").notNull(),
  industryType: text("industry_type").notNull(),
  employeeCount: text("employee_count").notNull(), // Range: "1-10", "11-50", "51-200", "201-500", "501+"
  foundedYear: integer("founded_year"),
  website: text("website"),
  officialEmail: text("official_email").notNull(),
  logo: text("logo"),
  coverImage: text("cover_image"),
  address: text("address"),
  socialLinks: jsonb("social_links"), // Facebook, Twitter, LinkedIn, etc.
  verified: boolean("verified").default(false),
});

// Business Editors (users who can manage a business account)
export const businessEditors = pgTable("business_editors", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businessProfiles.id).notNull(),
  editorId: integer("editor_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("editor"), // owner, admin, editor
  addedAt: timestamp("added_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event likes
export const eventLikes = pgTable("event_likes", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved events
export const savedEvents = pgTable("saved_events", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved places
export const savedPlaces = pgTable("saved_places", {
  id: serial("id").primaryKey(),
  placeId: integer("place_id").references(() => eventPlaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post shares
export const postShares = pgTable("post_shares", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sharedTo: text("shared_to").notNull(), // "timeline", "direct", "external"
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isDeleted: true, deleteRequestedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertEventPlaceSchema = createInsertSchema(eventPlaces).omit({ id: true, isDeleted: true, deleteRequestedAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  attendeeCount: true, 
  isDeleted: true, 
  deleteRequestedAt: true, 
  likeCount: true, 
  saveCount: true 
});
export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true, 
  likeCount: true, 
  commentCount: true, 
  shareCount: true, 
  isDeleted: true, 
  deleteRequestedAt: true 
});
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertConnectionSchema = createInsertSchema(connections).omit({ id: true, createdAt: true, status: true });
export const insertFollowerSchema = createInsertSchema(followers).omit({ id: true, createdAt: true });
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true, memberCount: true });
export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({ id: true, joinedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
// Create two booking schemas: one for logged in users and one for guests
export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true,
  // Make these optional to support both user and guest bookings
  userId: true,
  guestName: true,
  guestEmail: true,
  guestPhone: true
}).superRefine((data, ctx) => {
  // Validate that either userId is provided or guest information is provided
  if (!data.userId && !data.isGuestBooking) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either userId or guest booking information is required",
      path: ["userId"]
    });
  }
  
  // If this is a guest booking, validate guest fields
  if (data.isGuestBooking) {
    if (!data.guestName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guest name is required for guest bookings",
        path: ["guestName"]
      });
    }
    if (!data.guestEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guest email is required for guest bookings",
        path: ["guestEmail"]
      });
    }
  }
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({ id: true, verified: true });
export const insertBusinessEditorSchema = createInsertSchema(businessEditors).omit({ id: true, addedAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export const insertEventLikeSchema = createInsertSchema(eventLikes).omit({ id: true, createdAt: true });
export const insertSavedEventSchema = createInsertSchema(savedEvents).omit({ id: true, createdAt: true });
export const insertSavedPlaceSchema = createInsertSchema(savedPlaces).omit({ id: true, createdAt: true });
export const insertPostShareSchema = createInsertSchema(postShares).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type EventPlace = typeof eventPlaces.$inferSelect;
export type InsertEventPlace = z.infer<typeof insertEventPlaceSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type Follower = typeof followers.$inferSelect;
export type InsertFollower = z.infer<typeof insertFollowerSchema>;

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;

export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;

export type BusinessEditor = typeof businessEditors.$inferSelect;
export type InsertBusinessEditor = z.infer<typeof insertBusinessEditorSchema>;

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;

export type EventLike = typeof eventLikes.$inferSelect;
export type InsertEventLike = z.infer<typeof insertEventLikeSchema>;

export type SavedEvent = typeof savedEvents.$inferSelect;
export type InsertSavedEvent = z.infer<typeof insertSavedEventSchema>;

export type SavedPlace = typeof savedPlaces.$inferSelect;
export type InsertSavedPlace = z.infer<typeof insertSavedPlaceSchema>;

export type PostShare = typeof postShares.$inferSelect;
export type InsertPostShare = z.infer<typeof insertPostShareSchema>;
