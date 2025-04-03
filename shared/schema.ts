import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subscription type enum
export const SubscriptionTypes = {
  FREE: "free",
  PRO: "pro",
  PREMIUM: "premium"
} as const;

// Subscription limits and features based on type
export const SubscriptionLimits = {
  [SubscriptionTypes.FREE]: {
    maxFreeTickets: 300,
    maxPaidTickets: 0,
    verified: false,
    commission: 0.05, // 5% commission
  },
  [SubscriptionTypes.PRO]: {
    maxFreeTickets: 1000,
    maxPaidTickets: 300,
    verified: true,
    commission: 0.05, // 5% commission
  },
  [SubscriptionTypes.PREMIUM]: {
    maxFreeTickets: 3000,
    maxPaidTickets: 1000,
    verified: true,
    commission: 0.05, // 5% commission
  }
} as const;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  occupation: text("occupation"), // Current occupation or student status
  preferences: jsonb("preferences"),
  isBusinessAccount: boolean("is_business_account").default(false),
  
  // Profile completion tracking
  profileCompletionPercentage: integer("profile_completion_percentage").default(20), // Starts at 20% after basic registration
  
  // Subscription related fields
  subscriptionType: text("subscription_type").default(SubscriptionTypes.FREE), // free, pro, premium
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  // Stripe integration fields - commented out for now
  // stripeCustomerId: text("stripe_customer_id"), // For subscription management
  // stripeSubscriptionId: text("stripe_subscription_id"), // For subscription management
  
  // Verification status
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  
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
  purposeTags: jsonb("purpose_tags").default([]), // Array of tags for what purpose the place serves (meetings, weddings, etc)
  foods: jsonb("foods").default([]), // Array of food items with name and price
  drinks: jsonb("drinks").default([]), // Array of drink items with name and price
  
  // Booking related fields
  bookingType: text("booking_type").default("single"), // single, daily, subscription
  bookingRate: text("booking_rate"), // For subscription: hourly, daily, weekly, monthly
  minimumBookingDays: integer("minimum_booking_days").default(1), // For daily booking type
  basePrice: integer("base_price").default(0), // Base price for booking
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  visitCount: integer("visit_count").default(0), // How many people visited this place
  bookingCount: integer("booking_count").default(0), // How many bookings were made
  isTrending: boolean("is_trending").default(false), // Whether this place is trending
  isHot: boolean("is_hot").default(false), // Whether this place is hot/popular
  placeType: text("place_type"),
  saveCount: integer("save_count").default(0), // How many users saved this place
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
  imageUrls: jsonb("image_urls").default([]), // Multiple images for the event
  imageUrl: text("image_url"), // Main event image (keeping for backward compatibility)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  placeId: integer("place_id").references(() => eventPlaces.id),
  address: text("address"),
  latitude: text("latitude"), // Geographic coordinate for mapping
  longitude: text("longitude"), // Geographic coordinate for mapping
  categoryId: integer("category_id").references(() => categories.id),
  tags: jsonb("tags").default([]), // Array of tags for the event
  purposeTags: jsonb("purpose_tags").default([]), // Purpose of the event (meeting, conference, etc.)
  createdById: integer("created_by_id").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  isVirtual: boolean("is_virtual").default(false),
  isHybrid: boolean("is_hybrid").default(false),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  isLive: boolean("is_live").default(false),
  isTrending: boolean("is_trending").default(false), // Whether this event is trending
  isHot: boolean("is_hot").default(false), // Whether this event is hot/popular
  viewCount: integer("view_count").default(0), // How many times this event was viewed
  attendeeCount: integer("attendee_count").default(0),
  maxAttendees: integer("max_attendees").default(300), // 300 for free events by default
  isRecurring: boolean("is_recurring").default(false), // Whether this event recurs
  recurrenceType: text("recurrence_type"), // daily, weekly, monthly, custom
  recurrenceInterval: integer("recurrence_interval"), // Every X days/weeks/months
  recurrenceDaysOfWeek: jsonb("recurrence_days_of_week").default([]), // For weekly: [0,1,2,3,4,5,6] (Sunday to Saturday)
  recurrenceDayOfMonth: integer("recurrence_day_of_month"), // For monthly by day (1-31)
  recurrenceMonthOfYear: integer("recurrence_month_of_year"), // For yearly (1-12)
  recurrenceEndDate: timestamp("recurrence_end_date"), // When the recurring events should stop
  recurrenceCount: integer("recurrence_count"), // Alternative to end date: after X occurrences
  parentEventId: integer("parent_event_id").references(() => events.id), // For recurring event instances
  isDeleted: boolean("is_deleted").default(false),
  deleteRequestedAt: timestamp("delete_requested_at"),
  likeCount: integer("like_count").default(0),
  saveCount: integer("save_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Blocked users
export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").references(() => users.id).notNull(),
  blockedId: integer("blocked_id").references(() => users.id).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin users (for support team)
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  role: text("role").notNull(), // admin, super_admin
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: integer("assigned_by").references(() => users.id),
});

// Unblock requests
export const unblockRequests = pgTable("unblock_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
});

// Education history
export const educationHistory = pgTable("education_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  schoolName: text("school_name").notNull(),
  degree: text("degree"),
  fieldOfStudy: text("field_of_study"),
  startYear: integer("start_year"),
  graduationYear: integer("graduation_year"),
  description: text("description"),
  imageUrl: text("image_url"), // For certificates or proof of education
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work history
export const workHistory = pgTable("work_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isCurrentPosition: boolean("is_current_position").default(false),
  location: text("location"),
  description: text("description"),
  workLink: text("work_link"), // Link to work portfolio, website, projects
  imageUrl: text("image_url"), // For work samples or company logo
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  isDeleted: true, 
  deleteRequestedAt: true,
  profileCompletionPercentage: true,
  subscriptionType: true,
  subscriptionStartDate: true,
  subscriptionEndDate: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  isVerified: true,
  verifiedAt: true
});
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertEventPlaceSchema = createInsertSchema(eventPlaces).omit({ 
  id: true, 
  isDeleted: true, 
  deleteRequestedAt: true,
  visitCount: true,
  bookingCount: true,
  isTrending: true,
  isHot: true,
  saveCount: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Make booking fields properly validated
  bookingType: z.enum(['single', 'daily', 'subscription']).default('single'),
  bookingRate: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
  minimumBookingDays: z.number().int().min(1).default(1).optional(),
  basePrice: z.number().min(0).default(0)
});
export const insertEducationHistorySchema = createInsertSchema(educationHistory).omit({ id: true, createdAt: true, isVerified: true });
export const insertWorkHistorySchema = createInsertSchema(workHistory).omit({ id: true, createdAt: true, isVerified: true });
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  attendeeCount: true, 
  isDeleted: true, 
  deleteRequestedAt: true, 
  likeCount: true, 
  saveCount: true,
  viewCount: true,
  isTrending: true,
  isHot: true
}).extend({
  // Make recurrence fields optional with proper validation
  isRecurring: z.boolean().optional().default(false),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']).optional(),
  recurrenceInterval: z.number().int().positive().optional(),
  recurrenceDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  recurrenceDayOfMonth: z.number().int().min(1).max(31).optional(),
  recurrenceMonthOfYear: z.number().int().min(1).max(12).optional(),
  recurrenceEndDate: z.date().optional(),
  recurrenceCount: z.number().int().positive().optional(),
  parentEventId: z.number().optional()
}).superRefine((data, ctx) => {
  // Validate recurrence fields when isRecurring is true
  if (data.isRecurring) {
    if (!data.recurrenceType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurrence type is required for recurring events",
        path: ["recurrenceType"]
      });
    }
    
    if (!data.recurrenceInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurrence interval is required for recurring events",
        path: ["recurrenceInterval"]
      });
    }
    
    // Validate specific fields based on recurrence type
    if (data.recurrenceType === 'weekly' && (!data.recurrenceDaysOfWeek || data.recurrenceDaysOfWeek.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one day of the week must be selected for weekly recurring events",
        path: ["recurrenceDaysOfWeek"]
      });
    }
    
    if (data.recurrenceType === 'monthly' && !data.recurrenceDayOfMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Day of month is required for monthly recurring events",
        path: ["recurrenceDayOfMonth"]
      });
    }
    
    if (data.recurrenceType === 'yearly' && !data.recurrenceMonthOfYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Month of year is required for yearly recurring events",
        path: ["recurrenceMonthOfYear"]
      });
    }
    
    // Require either an end date or a count
    if (!data.recurrenceEndDate && !data.recurrenceCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either an end date or a number of occurrences is required for recurring events",
        path: ["recurrenceEndDate"]
      });
    }
  }
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
// Create booking schema for both logged in users and guests
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ 
    id: true, 
    createdAt: true
  })
  .extend({
    userId: z.number().optional(),
    guestName: z.string().nullable().optional(),
    guestEmail: z.string().nullable().optional(),
    guestPhone: z.string().nullable().optional()
  })
  .superRefine((data, ctx) => {
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
export const insertBlockedUserSchema = createInsertSchema(blockedUsers).omit({ id: true, createdAt: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, assignedAt: true });
export const insertUnblockRequestSchema = createInsertSchema(unblockRequests).omit({ id: true, createdAt: true, resolvedAt: true, resolvedBy: true, status: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type UnblockRequest = typeof unblockRequests.$inferSelect;
export type InsertUnblockRequest = z.infer<typeof insertUnblockRequestSchema>;

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

export type EducationHistory = typeof educationHistory.$inferSelect;
export type InsertEducationHistory = z.infer<typeof insertEducationHistorySchema>;

export type WorkHistory = typeof workHistory.$inferSelect;
export type InsertWorkHistory = z.infer<typeof insertWorkHistorySchema>;

//Account management feature schemas are already defined above
//Do not add duplicate declarations
