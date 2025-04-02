import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  eventPlaces, type EventPlace, type InsertEventPlace,
  events, type Event, type InsertEvent,
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment,
  connections, type Connection, type InsertConnection,
  followers, type Follower, type InsertFollower,
  communities, type Community, type InsertCommunity,
  communityMembers, type CommunityMember, type InsertCommunityMember,
  messages, type Message, type InsertMessage,
  bookings, type Booking, type InsertBooking,
  notifications, type Notification, type InsertNotification,
  businessProfiles, type BusinessProfile, type InsertBusinessProfile,
  businessEditors, type BusinessEditor, type InsertBusinessEditor,
  postLikes, type PostLike, type InsertPostLike,
  eventLikes, type EventLike, type InsertEventLike,
  savedEvents, type SavedEvent, type InsertSavedEvent,
  savedPlaces, type SavedPlace, type InsertSavedPlace,
  postShares, type PostShare, type InsertPostShare,
  blockedUsers, type BlockedUser, type InsertBlockedUser,
  adminUsers, type AdminUser, type InsertAdminUser,
  unblockRequests, type UnblockRequest, type InsertUnblockRequest
} from "@shared/schema";

import { Store } from "express-session";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  requestDeleteUser(id: number): Promise<User | undefined>;
  cancelDeleteUser(id: number): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  updateUserPreferences(userId: number, preferences: any): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Event Place methods
  getEventPlaces(): Promise<EventPlace[]>;
  getEventPlaceById(id: number): Promise<EventPlace | undefined>;
  getEventPlacesByCategory(categoryId: number): Promise<EventPlace[]>;
  createEventPlace(place: InsertEventPlace): Promise<EventPlace>;
  requestDeleteEventPlace(id: number): Promise<EventPlace | undefined>;
  cancelDeleteEventPlace(id: number): Promise<EventPlace | undefined>;
  deleteEventPlace(id: number): Promise<void>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getPublicEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  getEventsByCategory(categoryId: number): Promise<Event[]>;
  getEventsByUser(userId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  getLiveEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  likeEvent(eventId: number, userId: number): Promise<void>;
  unlikeEvent(eventId: number, userId: number): Promise<void>;
  saveEvent(eventId: number, userId: number): Promise<void>;
  unsaveEvent(eventId: number, userId: number): Promise<void>;
  getSavedEvents(userId: number): Promise<Event[]>;
  getLikedEvents(userId: number): Promise<Event[]>;
  getRecommendedEvents(userId: number, limit?: number): Promise<Event[]>;
  requestDeleteEvent(id: number): Promise<Event | undefined>;
  cancelDeleteEvent(id: number): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<void>;
  
  // Post methods
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUser(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(postId: number, userId: number): Promise<void>;
  unlikePost(postId: number, userId: number): Promise<void>;
  sharePost(postId: number, userId: number, sharedTo: string): Promise<void>;
  getLikedPosts(userId: number): Promise<Post[]>;
  getSharedPosts(userId: number): Promise<Post[]>;
  requestDeletePost(id: number): Promise<Post | undefined>;
  cancelDeletePost(id: number): Promise<Post | undefined>;
  deletePost(id: number): Promise<void>;
  
  // Comment methods
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Connection methods
  getConnectionRequests(userId: number): Promise<Connection[]>;
  getConnections(userId: number): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnectionStatus(id: number, status: 'accepted' | 'rejected'): Promise<Connection | undefined>;
  
  // Follower methods
  getFollowers(userId: number): Promise<Follower[]>;
  getFollowing(userId: number): Promise<Follower[]>;
  createFollower(follower: InsertFollower): Promise<Follower>;
  removeFollower(id: number): Promise<void>;
  
  // Community methods
  getCommunities(): Promise<Community[]>;
  getCommunityById(id: number): Promise<Community | undefined>;
  getUserCommunities(userId: number): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  
  // Community Member methods
  getCommunityMembers(communityId: number): Promise<CommunityMember[]>;
  addCommunityMember(member: InsertCommunityMember): Promise<CommunityMember>;
  removeCommunityMember(communityId: number, userId: number): Promise<void>;
  
  // Message methods
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Booking methods
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByEvent(eventId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: 'confirmed' | 'cancelled' | 'pending'): Promise<Booking | undefined>;
  
  // Notification methods
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Business Profile methods
  getBusinessProfile(userId: number): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(id: number, profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile | undefined>;
  
  // Business Editor methods
  getBusinessEditors(businessId: number): Promise<BusinessEditor[]>;
  addBusinessEditor(editor: InsertBusinessEditor): Promise<BusinessEditor>;
  removeBusinessEditor(businessId: number, editorId: number): Promise<void>;
  getBusinessesManagedByUser(userId: number): Promise<BusinessProfile[]>;
  
  // Place methods
  savePlace(placeId: number, userId: number): Promise<void>;
  unsavePlace(placeId: number, userId: number): Promise<void>;
  getSavedPlaces(userId: number): Promise<EventPlace[]>;
  
  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private eventPlaces: Map<number, EventPlace>;
  private events: Map<number, Event>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private connections: Map<number, Connection>;
  private followers: Map<number, Follower>;
  private communities: Map<number, Community>;
  private communityMembers: Map<number, CommunityMember>;
  private messages: Map<number, Message>;
  private bookings: Map<number, Booking>;
  private notifications: Map<number, Notification>;
  private businessProfiles: Map<number, BusinessProfile>;
  private businessEditors: Map<number, BusinessEditor>;
  private postLikes: Map<number, PostLike>;
  private eventLikes: Map<number, EventLike>;
  private savedEvents: Map<number, SavedEvent>;
  private savedPlaces: Map<number, SavedPlace>;
  private postShares: Map<number, PostShare>;
  
  currentUserId: number;
  currentCategoryId: number;
  currentEventPlaceId: number;
  currentEventId: number;
  currentPostId: number;
  currentCommentId: number;
  currentConnectionId: number;
  currentFollowerId: number;
  currentCommunityId: number;
  currentCommunityMemberId: number;
  currentMessageId: number;
  currentBookingId: number;
  currentNotificationId: number;
  currentBusinessProfileId: number;
  currentBusinessEditorId: number;
  currentPostLikeId: number;
  currentEventLikeId: number;
  currentSavedEventId: number;
  currentSavedPlaceId: number;
  currentPostShareId: number;
  sessionStore: Store;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.eventPlaces = new Map();
    this.events = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.connections = new Map();
    this.followers = new Map();
    this.communities = new Map();
    this.communityMembers = new Map();
    this.messages = new Map();
    this.bookings = new Map();
    this.notifications = new Map();
    this.businessProfiles = new Map();
    this.businessEditors = new Map();
    this.postLikes = new Map();
    this.eventLikes = new Map();
    this.savedEvents = new Map();
    this.savedPlaces = new Map();
    this.postShares = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentEventPlaceId = 1;
    this.currentEventId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.currentConnectionId = 1;
    this.currentFollowerId = 1;
    this.currentCommunityId = 1;
    this.currentCommunityMemberId = 1;
    this.currentMessageId = 1;
    this.currentBookingId = 1;
    this.currentNotificationId = 1;
    this.currentBusinessProfileId = 1;
    this.currentBusinessEditorId = 1;
    this.currentPostLikeId = 1;
    this.currentEventLikeId = 1;
    this.currentSavedEventId = 1;
    this.currentSavedPlaceId = 1;
    this.currentPostShareId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    });
    
    this.seedData();
  }

  // Seed some initial data
  private seedData() {
    // Seed categories
    const categoryData: InsertCategory[] = [
      { name: "Music", icon: "fas fa-music" },
      { name: "Food & Drink", icon: "fas fa-utensils" },
      { name: "Education", icon: "fas fa-graduation-cap" },
      { name: "Business", icon: "fas fa-briefcase" },
      { name: "Arts", icon: "fas fa-palette" },
      { name: "Sports", icon: "fas fa-running" },
      { name: "Travel", icon: "fas fa-globe" }
    ];
    
    categoryData.forEach(category => this.createCategory(category));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPreferences(userId: number, preferences: any): Promise<User | undefined> {
    const existingUser = this.users.get(userId);
    if (!existingUser) return undefined;
    
    // Merge existing preferences with new preferences
    const currentPreferences = existingUser.preferences || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    const updatedUser = { ...existingUser, preferences: updatedPreferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Event Place methods
  async getEventPlaces(): Promise<EventPlace[]> {
    return Array.from(this.eventPlaces.values());
  }
  
  async getEventPlaceById(id: number): Promise<EventPlace | undefined> {
    return this.eventPlaces.get(id);
  }
  
  async getEventPlacesByCategory(categoryId: number): Promise<EventPlace[]> {
    return Array.from(this.eventPlaces.values())
      .filter(place => place.categoryId === categoryId);
  }
  
  async createEventPlace(place: InsertEventPlace): Promise<EventPlace> {
    const id = this.currentEventPlaceId++;
    const newPlace: EventPlace = { ...place, id };
    this.eventPlaces.set(id, newPlace);
    return newPlace;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getPublicEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.isPublic);
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByCategory(categoryId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.categoryId === categoryId);
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.createdById === userId);
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const newEvent: Event = { ...event, id, attendeeCount: 0 };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.isLive);
  }
  
  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }
  
  // Post methods
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const createdAt = new Date();
    const newPost: Post = { ...post, id, createdAt, likeCount: 0, commentCount: 0 };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async likePost(postId: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.likeCount += 1;
      this.posts.set(postId, post);
    }
  }
  
  async unlikePost(postId: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post && post.likeCount > 0) {
      post.likeCount -= 1;
      this.posts.set(postId, post);
    }
  }
  
  // Comment methods
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const createdAt = new Date();
    const newComment: Comment = { ...comment, id, createdAt };
    this.comments.set(id, newComment);
    
    // Update post comment count
    const post = this.posts.get(comment.postId);
    if (post) {
      post.commentCount += 1;
      this.posts.set(post.id, post);
    }
    
    return newComment;
  }
  
  // Connection methods
  async getConnectionRequests(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values())
      .filter(conn => conn.addresseeId === userId && conn.status === 'pending');
  }
  
  async getConnections(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values())
      .filter(conn => 
        (conn.requesterId === userId || conn.addresseeId === userId) && 
        conn.status === 'accepted'
      );
  }
  
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.currentConnectionId++;
    const createdAt = new Date();
    const newConnection: Connection = { 
      ...connection, 
      id, 
      status: 'pending', 
      createdAt 
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }
  
  async updateConnectionStatus(id: number, status: 'accepted' | 'rejected'): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    
    connection.status = status;
    this.connections.set(id, connection);
    return connection;
  }
  
  // Follower methods
  async getFollowers(userId: number): Promise<Follower[]> {
    return Array.from(this.followers.values())
      .filter(follower => follower.followedId === userId);
  }
  
  async getFollowing(userId: number): Promise<Follower[]> {
    return Array.from(this.followers.values())
      .filter(follower => follower.followerId === userId);
  }
  
  async createFollower(follower: InsertFollower): Promise<Follower> {
    const id = this.currentFollowerId++;
    const createdAt = new Date();
    const newFollower: Follower = { ...follower, id, createdAt };
    this.followers.set(id, newFollower);
    return newFollower;
  }
  
  async removeFollower(id: number): Promise<void> {
    this.followers.delete(id);
  }
  
  // Community methods
  async getCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }
  
  async getCommunityById(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }
  
  async getUserCommunities(userId: number): Promise<Community[]> {
    const memberEntries = Array.from(this.communityMembers.values())
      .filter(member => member.userId === userId);
    
    return memberEntries.map(entry => {
      const community = this.communities.get(entry.communityId);
      return community!;
    }).filter(Boolean);
  }
  
  async createCommunity(community: InsertCommunity): Promise<Community> {
    const id = this.currentCommunityId++;
    const createdAt = new Date();
    const newCommunity: Community = { 
      ...community, 
      id, 
      memberCount: 1, 
      createdAt 
    };
    this.communities.set(id, newCommunity);
    
    // Add creator as a member automatically
    this.addCommunityMember({
      communityId: id,
      userId: community.createdById,
      isAdmin: true
    });
    
    return newCommunity;
  }
  
  // Community Member methods
  async getCommunityMembers(communityId: number): Promise<CommunityMember[]> {
    return Array.from(this.communityMembers.values())
      .filter(member => member.communityId === communityId);
  }
  
  async addCommunityMember(member: InsertCommunityMember): Promise<CommunityMember> {
    const id = this.currentCommunityMemberId++;
    const joinedAt = new Date();
    const newMember: CommunityMember = { ...member, id, joinedAt };
    this.communityMembers.set(id, newMember);
    
    // Update member count
    const community = this.communities.get(member.communityId);
    if (community) {
      community.memberCount += 1;
      this.communities.set(community.id, community);
    }
    
    return newMember;
  }
  
  async removeCommunityMember(communityId: number, userId: number): Promise<void> {
    const memberEntry = Array.from(this.communityMembers.values())
      .find(m => m.communityId === communityId && m.userId === userId);
    
    if (memberEntry) {
      this.communityMembers.delete(memberEntry.id);
      
      // Update member count
      const community = this.communities.get(communityId);
      if (community) {
        community.memberCount -= 1;
        this.communities.set(communityId, community);
      }
    }
  }
  
  // Message methods
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.senderId === userId || message.receiverId === userId
      );
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const createdAt = new Date();
    const newMessage: Message = { 
      ...message, 
      id, 
      isRead: false, 
      createdAt 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessageAsRead(id: number): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
    }
  }
  
  // Booking methods
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId);
  }
  
  async getBookingsByEvent(eventId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.eventId === eventId);
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const createdAt = new Date();
    
    // Set default values for guest booking fields if not provided
    const isGuestBooking = booking.isGuestBooking || false;
    const numberOfTickets = booking.numberOfTickets || 1;
    
    const newBooking: Booking = { 
      ...booking,
      isGuestBooking,
      numberOfTickets, 
      id, 
      status: 'confirmed', 
      createdAt 
    };
    this.bookings.set(id, newBooking);
    
    // Update event attendee count (counting the number of tickets)
    const event = this.events.get(booking.eventId);
    if (event) {
      event.attendeeCount += numberOfTickets;
      this.events.set(event.id, event);
    }
    
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: 'confirmed' | 'cancelled' | 'pending'): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const oldStatus = booking.status;
    booking.status = status;
    this.bookings.set(id, booking);
    
    // Update event attendee count if status changed to/from 'confirmed'
    const event = this.events.get(booking.eventId);
    if (event) {
      if (oldStatus !== 'confirmed' && status === 'confirmed') {
        event.attendeeCount += 1;
      } else if (oldStatus === 'confirmed' && status !== 'confirmed') {
        event.attendeeCount -= 1;
      }
      this.events.set(event.id, event);
    }
    
    return booking;
  }
  
  // Notification methods
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const createdAt = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      isRead: false, 
      createdAt 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }
  
  // Business Profile methods
  async getBusinessProfile(userId: number): Promise<BusinessProfile | undefined> {
    return Array.from(this.businessProfiles.values())
      .find(profile => profile.userId === userId);
  }
  
  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const id = this.currentBusinessProfileId++;
    const newProfile: BusinessProfile = { ...profile, id, verified: false };
    this.businessProfiles.set(id, newProfile);
    
    // Add creator as an owner automatically
    this.addBusinessEditor({
      businessId: id,
      editorId: profile.userId,
      role: "owner"
    });
    
    return newProfile;
  }
  
  async updateBusinessProfile(id: number, profileData: Partial<InsertBusinessProfile>): Promise<BusinessProfile | undefined> {
    const existingProfile = this.businessProfiles.get(id);
    if (!existingProfile) return undefined;
    
    const updatedProfile = { ...existingProfile, ...profileData };
    this.businessProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Business Editor methods
  async getBusinessEditors(businessId: number): Promise<BusinessEditor[]> {
    return Array.from(this.businessEditors.values())
      .filter(editor => editor.businessId === businessId);
  }
  
  async addBusinessEditor(editor: InsertBusinessEditor): Promise<BusinessEditor> {
    const id = this.currentBusinessEditorId++;
    const addedAt = new Date();
    const newEditor: BusinessEditor = { ...editor, id, addedAt };
    this.businessEditors.set(id, newEditor);
    return newEditor;
  }
  
  async removeBusinessEditor(businessId: number, editorId: number): Promise<void> {
    const editorEntry = Array.from(this.businessEditors.values())
      .find(e => e.businessId === businessId && e.editorId === editorId);
    
    if (editorEntry) {
      this.businessEditors.delete(editorEntry.id);
    }
  }
  
  async getBusinessesManagedByUser(userId: number): Promise<BusinessProfile[]> {
    const editorEntries = Array.from(this.businessEditors.values())
      .filter(editor => editor.editorId === userId);
    
    return editorEntries.map(entry => {
      const business = this.businessProfiles.get(entry.businessId);
      return business!;
    }).filter(Boolean);
  }

  // User deletion related methods
  async requestDeleteUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    user.deleteRequestedAt = new Date();
    this.users.set(id, user);
    return user;
  }
  
  async cancelDeleteUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    user.deleteRequestedAt = null;
    this.users.set(id, user);
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }
  
  // Event Place deletion related methods
  async requestDeleteEventPlace(id: number): Promise<EventPlace | undefined> {
    const place = this.eventPlaces.get(id);
    if (!place) return undefined;
    
    place.deleteRequestedAt = new Date();
    this.eventPlaces.set(id, place);
    return place;
  }
  
  async cancelDeleteEventPlace(id: number): Promise<EventPlace | undefined> {
    const place = this.eventPlaces.get(id);
    if (!place) return undefined;
    
    place.deleteRequestedAt = null;
    this.eventPlaces.set(id, place);
    return place;
  }
  
  async deleteEventPlace(id: number): Promise<void> {
    this.eventPlaces.delete(id);
  }
  
  // Event deletion and social interaction methods
  async requestDeleteEvent(id: number): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    event.deleteRequestedAt = new Date();
    this.events.set(id, event);
    return event;
  }
  
  async cancelDeleteEvent(id: number): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    event.deleteRequestedAt = null;
    this.events.set(id, event);
    return event;
  }
  
  async deleteEvent(id: number): Promise<void> {
    this.events.delete(id);
  }
  
  async likeEvent(eventId: number, userId: number): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) return;
    
    // Check if already liked
    const existingLike = Array.from(this.eventLikes.values())
      .find(like => like.eventId === eventId && like.userId === userId);
      
    if (existingLike) return; // Already liked
    
    // Create new like
    const id = this.currentEventLikeId++;
    const createdAt = new Date();
    const newLike: EventLike = { id, userId, eventId, createdAt };
    this.eventLikes.set(id, newLike);
    
    // Update event like count
    if (event.likeCount === null) {
      event.likeCount = 1;
    } else {
      event.likeCount += 1;
    }
    this.events.set(eventId, event);
  }
  
  async unlikeEvent(eventId: number, userId: number): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) return;
    
    // Find the like
    const existingLike = Array.from(this.eventLikes.values())
      .find(like => like.eventId === eventId && like.userId === userId);
      
    if (!existingLike) return; // Not liked
    
    // Remove the like
    this.eventLikes.delete(existingLike.id);
    
    // Update event like count
    if (event.likeCount && event.likeCount > 0) {
      event.likeCount -= 1;
      this.events.set(eventId, event);
    }
  }
  
  async saveEvent(eventId: number, userId: number): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) return;
    
    // Check if already saved
    const existingSave = Array.from(this.savedEvents.values())
      .find(save => save.eventId === eventId && save.userId === userId);
      
    if (existingSave) return; // Already saved
    
    // Create new save
    const id = this.currentSavedEventId++;
    const createdAt = new Date();
    const newSave: SavedEvent = { id, userId, eventId, createdAt };
    this.savedEvents.set(id, newSave);
    
    // Update event save count
    if (event.saveCount === null) {
      event.saveCount = 1;
    } else {
      event.saveCount += 1;
    }
    this.events.set(eventId, event);
  }
  
  async unsaveEvent(eventId: number, userId: number): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) return;
    
    // Find the save
    const existingSave = Array.from(this.savedEvents.values())
      .find(save => save.eventId === eventId && save.userId === userId);
      
    if (!existingSave) return; // Not saved
    
    // Remove the save
    this.savedEvents.delete(existingSave.id);
    
    // Update event save count
    if (event.saveCount && event.saveCount > 0) {
      event.saveCount -= 1;
      this.events.set(eventId, event);
    }
  }
  
  async getSavedEvents(userId: number): Promise<Event[]> {
    const savedEventEntries = Array.from(this.savedEvents.values())
      .filter(save => save.userId === userId);
    
    return savedEventEntries.map(entry => {
      const event = this.events.get(entry.eventId);
      return event!;
    }).filter(Boolean);
  }
  
  async getLikedEvents(userId: number): Promise<Event[]> {
    const likedEventEntries = Array.from(this.eventLikes.values())
      .filter(like => like.userId === userId);
    
    return likedEventEntries.map(entry => {
      const event = this.events.get(entry.eventId);
      return event!;
    }).filter(Boolean);
  }
  
  async getRecommendedEvents(userId: number, limit: number = 10): Promise<Event[]> {
    const user = this.users.get(userId);
    if (!user) return [];
    
    // Get all public upcoming events
    const now = new Date();
    const upcomingEvents = Array.from(this.events.values())
      .filter(event => 
        event.isPublic && 
        new Date(event.startDate) > now &&
        !event.isDeleted
      );
    
    // If no user preferences, just return most popular upcoming events
    if (!user.preferences) {
      return upcomingEvents
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, limit);
    }
    
    // Extract user preferences
    const userPreferences = user.preferences as any;
    const preferredCategories = userPreferences.categories || [];
    const preferredLocations = userPreferences.locations || [];
    
    // Get user's liked and saved events to understand their preferences
    const likedEvents = await this.getLikedEvents(userId);
    const savedEvents = await this.getSavedEvents(userId);
    
    // Get user's booking history
    const bookings = Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId);
    
    // Get category IDs from user's previous interactions
    const interactionCategoryIds = new Set<number>();
    
    // Add categories from liked events
    likedEvents.forEach(event => {
      if (event.categoryId) interactionCategoryIds.add(event.categoryId);
    });
    
    // Add categories from saved events
    savedEvents.forEach(event => {
      if (event.categoryId) interactionCategoryIds.add(event.categoryId);
    });
    
    // Add categories from booked events
    bookings.forEach(booking => {
      const event = this.events.get(booking.eventId);
      if (event?.categoryId) interactionCategoryIds.add(event.categoryId);
    });
    
    // Score each event based on user preferences and behavior
    const scoredEvents = upcomingEvents.map(event => {
      let score = 0;
      
      // Score based on explicit category preferences
      if (preferredCategories.includes(event.categoryId)) {
        score += 10;
      }
      
      // Score based on categories from user interactions
      if (event.categoryId && interactionCategoryIds.has(event.categoryId)) {
        score += 8;
      }
      
      // Score based on location preferences for physical events
      if (!event.isVirtual && preferredLocations.length > 0) {
        // If event has location data (lat/long)
        if (event.latitude && event.longitude) {
          if (preferredLocations.some(loc => 
            // Simple check if location is "nearby" - in a real app, use proper distance calculation
            loc.latitude === event.latitude.substring(0, 5) || 
            loc.longitude === event.longitude.substring(0, 5)
          )) {
            score += 5;
          }
        }
      }
      
      // Score based on general popularity
      score += (event.likeCount || 0) * 0.5;
      
      // Score based on attendance
      score += (event.attendeeCount || 0) * 0.3;
      
      // Virtual events get a slight boost if user has attended virtual events before
      if (event.isVirtual && 
          bookings.some(b => {
            const bookedEvent = this.events.get(b.eventId);
            return bookedEvent?.isVirtual;
          })) {
        score += 3;
      }
      
      // Check if the event is from a followed organizer
      const eventOrganizer = event.createdById;
      if (eventOrganizer) {
        const isFollowing = Array.from(this.followers.values())
          .some(f => f.followerId === userId && f.followedId === eventOrganizer);
        
        if (isFollowing) {
          score += 7;
        }
      }
      
      return { event, score };
    });
    
    // Sort by score and return top events
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .map(item => item.event)
      .slice(0, limit);
  }
  
  // Post social interactions and deletion methods
  async requestDeletePost(id: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    post.deleteRequestedAt = new Date();
    this.posts.set(id, post);
    return post;
  }
  
  async cancelDeletePost(id: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    post.deleteRequestedAt = null;
    this.posts.set(id, post);
    return post;
  }
  
  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
  }
  
  async likePost(postId: number, userId: number): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) return;
    
    // Check if already liked
    const existingLike = Array.from(this.postLikes.values())
      .find(like => like.postId === postId && like.userId === userId);
      
    if (existingLike) return; // Already liked
    
    // Create new like
    const id = this.currentPostLikeId++;
    const createdAt = new Date();
    const newLike: PostLike = { id, userId, postId, createdAt };
    this.postLikes.set(id, newLike);
    
    // Update post like count
    if (post.likeCount === null) {
      post.likeCount = 1;
    } else {
      post.likeCount += 1;
    }
    this.posts.set(postId, post);
  }
  
  async unlikePost(postId: number, userId: number): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) return;
    
    // Find the like
    const existingLike = Array.from(this.postLikes.values())
      .find(like => like.postId === postId && like.userId === userId);
      
    if (!existingLike) return; // Not liked
    
    // Remove the like
    this.postLikes.delete(existingLike.id);
    
    // Update post like count
    if (post.likeCount && post.likeCount > 0) {
      post.likeCount -= 1;
      this.posts.set(postId, post);
    }
  }
  
  async sharePost(postId: number, userId: number, sharedTo: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) return;
    
    // Create new share
    const id = this.currentPostShareId++;
    const createdAt = new Date();
    const newShare: PostShare = { id, userId, postId, createdAt, sharedTo };
    this.postShares.set(id, newShare);
    
    // Update post share count
    if (post.shareCount === null) {
      post.shareCount = 1;
    } else {
      post.shareCount += 1;
    }
    this.posts.set(postId, post);
  }
  
  async getLikedPosts(userId: number): Promise<Post[]> {
    const likedPostEntries = Array.from(this.postLikes.values())
      .filter(like => like.userId === userId);
    
    return likedPostEntries.map(entry => {
      const post = this.posts.get(entry.postId);
      return post!;
    }).filter(Boolean);
  }
  
  async getSharedPosts(userId: number): Promise<Post[]> {
    const sharedPostEntries = Array.from(this.postShares.values())
      .filter(share => share.userId === userId);
    
    return sharedPostEntries.map(entry => {
      const post = this.posts.get(entry.postId);
      return post!;
    }).filter(Boolean);
  }
  
  // Place methods
  async savePlace(placeId: number, userId: number): Promise<void> {
    const place = this.eventPlaces.get(placeId);
    if (!place) return;
    
    // Check if already saved
    const existingSave = Array.from(this.savedPlaces.values())
      .find(save => save.placeId === placeId && save.userId === userId);
      
    if (existingSave) return; // Already saved
    
    // Create new save
    const id = this.currentSavedPlaceId++;
    const createdAt = new Date();
    const newSave: SavedPlace = { id, userId, placeId, createdAt };
    this.savedPlaces.set(id, newSave);
  }
  
  async unsavePlace(placeId: number, userId: number): Promise<void> {
    // Find the save
    const existingSave = Array.from(this.savedPlaces.values())
      .find(save => save.placeId === placeId && save.userId === userId);
      
    if (!existingSave) return; // Not saved
    
    // Remove the save
    this.savedPlaces.delete(existingSave.id);
  }
  
  async getSavedPlaces(userId: number): Promise<EventPlace[]> {
    const savedPlaceEntries = Array.from(this.savedPlaces.values())
      .filter(save => save.userId === userId);
    
    return savedPlaceEntries.map(entry => {
      const place = this.eventPlaces.get(entry.placeId);
      return place!;
    }).filter(Boolean);
  }
}

import { MongoStorage } from './mongo-storage';

// Use MongoDB storage in production, or if MONGODB_URI is set
// Otherwise, fall back to MemStorage for development/testing
export const storage = process.env.MONGODB_URI || process.env.NODE_ENV === 'production' 
  ? new MongoStorage() 
  : new MemStorage();
