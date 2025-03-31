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
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: text("image_url"),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  placeType: text("place_type"),
  createdById: integer("created_by_id").references(() => users.id),
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
  categoryId: integer("category_id").references(() => categories.id),
  createdById: integer("created_by_id").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  isVirtual: boolean("is_virtual").default(false),
  isHybrid: boolean("is_hybrid").default(false),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  isLive: boolean("is_live").default(false),
  attendeeCount: integer("attendee_count").default(0),
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
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, pending
  createdAt: timestamp("created_at").defaultNow(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertEventPlaceSchema = createInsertSchema(eventPlaces).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, attendeeCount: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, likeCount: true, commentCount: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertConnectionSchema = createInsertSchema(connections).omit({ id: true, createdAt: true, status: true });
export const insertFollowerSchema = createInsertSchema(followers).omit({ id: true, createdAt: true });
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true, memberCount: true });
export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({ id: true, joinedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, status: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({ id: true, verified: true });
export const insertBusinessEditorSchema = createInsertSchema(businessEditors).omit({ id: true, addedAt: true });

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
