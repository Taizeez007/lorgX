import { IStorage } from './storage';
import { Store } from 'express-session';
import MongoStore from 'connect-mongo';
import { dbConfig } from './config';
import {
  UserModel,
  CategoryModel,
  EventPlaceModel,
  EventModel,
  PostModel,
  CommentModel,
  ConnectionModel,
  FollowerModel,
  CommunityModel,
  CommunityMemberModel,
  MessageModel,
  BookingModel,
  NotificationModel,
  BusinessProfileModel,
  BusinessEditorModel,
  PostLikeModel,
  EventLikeModel,
  SavedEventModel,
  SavedPlaceModel,
  PostShareModel,
  connectToMongoDB
} from './mongodb';

import {
  User, InsertUser,
  Category, InsertCategory,
  EventPlace, InsertEventPlace,
  Event, InsertEvent,
  Post, InsertPost,
  Comment, InsertComment,
  Connection, InsertConnection,
  Follower, InsertFollower,
  Community, InsertCommunity,
  CommunityMember, InsertCommunityMember,
  Message, InsertMessage,
  Booking, InsertBooking,
  Notification, InsertNotification,
  BusinessProfile, InsertBusinessProfile,
  BusinessEditor, InsertBusinessEditor,
  PostLike, InsertPostLike,
  EventLike, InsertEventLike,
  SavedEvent, InsertSavedEvent,
  SavedPlace, InsertSavedPlace,
  PostShare, InsertPostShare
} from '@shared/schema';

// MongoStore is already imported directly

export class MongoStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new MongoStore({
      mongoUrl: dbConfig.mongoDbUri,
      collectionName: 'sessions'
    });
    // Initialize MongoDB connection
    connectToMongoDB();
  }

  // Helper to convert document to entity
  private documentToEntity<T>(doc: any): T {
    return doc ? doc.toObject() as T : undefined;
  }

  // Helper to convert documents to entities
  private documentsToEntities<T>(docs: any[]): T[] {
    return docs.map(doc => this.documentToEntity<T>(doc));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ id, isDeleted: { $ne: true } });
    return this.documentToEntity<User>(user);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username, isDeleted: { $ne: true } });
    return this.documentToEntity<User>(user);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email, isDeleted: { $ne: true } });
    return this.documentToEntity<User>(user);
  }

  async createUser(user: InsertUser): Promise<User> {
    const lastUser = await UserModel.findOne().sort({ id: -1 });
    const id = lastUser ? lastUser.id + 1 : 1;
    
    const newUser = new UserModel({
      ...user,
      id,
      createdAt: new Date(),
      isDeleted: false,
      deleteRequestedAt: null
    });
    
    await newUser.save();
    return this.documentToEntity<User>(newUser);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await UserModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { $set: userData },
      { new: true }
    );
    return this.documentToEntity<User>(user);
  }

  async requestDeleteUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { $set: { deleteRequestedAt: new Date() } },
      { new: true }
    );
    return this.documentToEntity<User>(user);
  }

  async cancelDeleteUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOneAndUpdate(
      { id },
      { $set: { deleteRequestedAt: null } },
      { new: true }
    );
    return this.documentToEntity<User>(user);
  }

  async deleteUser(id: number): Promise<void> {
    await UserModel.updateOne({ id }, { $set: { isDeleted: true } });
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User | undefined> {
    const user = await UserModel.findOneAndUpdate(
      { id: userId, isDeleted: { $ne: true } },
      { $set: { preferences } },
      { new: true }
    );
    return this.documentToEntity<User>(user);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find();
    return this.documentsToEntities<Category>(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const category = await CategoryModel.findOne({ id });
    return this.documentToEntity<Category>(category);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const lastCategory = await CategoryModel.findOne().sort({ id: -1 });
    const id = lastCategory ? lastCategory.id + 1 : 1;
    
    const newCategory = new CategoryModel({
      ...category,
      id
    });
    
    await newCategory.save();
    return this.documentToEntity<Category>(newCategory);
  }

  // Event Place methods
  async getEventPlaces(): Promise<EventPlace[]> {
    const places = await EventPlaceModel.find({ isDeleted: { $ne: true } });
    return this.documentsToEntities<EventPlace>(places);
  }

  async getEventPlaceById(id: number): Promise<EventPlace | undefined> {
    const place = await EventPlaceModel.findOne({ id, isDeleted: { $ne: true } });
    return this.documentToEntity<EventPlace>(place);
  }

  async getEventPlacesByCategory(categoryId: number): Promise<EventPlace[]> {
    const places = await EventPlaceModel.find({ categoryId, isDeleted: { $ne: true } });
    return this.documentsToEntities<EventPlace>(places);
  }

  async createEventPlace(place: InsertEventPlace): Promise<EventPlace> {
    const lastPlace = await EventPlaceModel.findOne().sort({ id: -1 });
    const id = lastPlace ? lastPlace.id + 1 : 1;
    
    const newPlace = new EventPlaceModel({
      ...place,
      id,
      createdAt: new Date(),
      isDeleted: false,
      deleteRequestedAt: null,
      saveCount: 0,
      reviewCount: 0,
      rating: null
    });
    
    await newPlace.save();
    return this.documentToEntity<EventPlace>(newPlace);
  }

  async requestDeleteEventPlace(id: number): Promise<EventPlace | undefined> {
    const place = await EventPlaceModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { $set: { deleteRequestedAt: new Date() } },
      { new: true }
    );
    return this.documentToEntity<EventPlace>(place);
  }

  async deleteEventPlace(id: number): Promise<void> {
    await EventPlaceModel.updateOne({ id }, { $set: { isDeleted: true } });
  }

  async updateEventPlace(id: number, placeData: Partial<InsertEventPlace>): Promise<EventPlace | undefined> {
    const place = await EventPlaceModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { 
        $set: {
          ...placeData,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );
    return this.documentToEntity<EventPlace>(place);
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    const events = await EventModel.find({ isDeleted: { $ne: true } });
    return this.documentsToEntities<Event>(events);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const event = await EventModel.findOne({ id, isDeleted: { $ne: true } });
    return this.documentToEntity<Event>(event);
  }

  async getEventsByCategory(categoryId: number): Promise<Event[]> {
    const events = await EventModel.find({ categoryId, isDeleted: { $ne: true } });
    return this.documentsToEntities<Event>(events);
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    const events = await EventModel.find({ createdById: userId, isDeleted: { $ne: true } });
    return this.documentsToEntities<Event>(events);
  }
  
  async searchEvents(params: {
    query?: string;
    categoryId?: number;
    startDate?: Date;
    endDate?: Date;
    isFree?: boolean;
    isVirtual?: boolean;
    isHybrid?: boolean;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    try {
      // Build the query object based on params
      const query: any = { 
        isPublic: true,
        isDeleted: { $ne: true }
      };
      
      // Text search on title and description
      if (params.query) {
        // Use MongoDB text search if a text index exists,
        // otherwise do a regex search on title and description
        query.$or = [
          { title: { $regex: params.query, $options: 'i' } },
          { description: { $regex: params.query, $options: 'i' } }
        ];
      }
      
      // Filter by category
      if (params.categoryId) {
        query.categoryId = params.categoryId;
      }
      
      // Filter by date range
      if (params.startDate || params.endDate) {
        query.startDate = {};
        if (params.startDate) {
          query.startDate.$gte = params.startDate;
        }
        if (params.endDate) {
          query.startDate.$lte = params.endDate;
        }
      }
      
      // Filter by event type
      if (params.isVirtual) {
        query.isVirtual = true;
      }
      
      if (params.isHybrid) {
        query.isHybrid = true;
      }
      
      // Filter by price
      if (params.isFree) {
        query.isFree = true;
      } else if (params.maxPrice !== undefined) {
        query.$or = query.$or || [];
        query.$or.push(
          { isFree: true },
          { price: { $lte: params.maxPrice } }
        );
      }
      
      // Create the base query
      let findQuery = EventModel.find(query);
      
      // Apply pagination
      if (params.offset) {
        findQuery = findQuery.skip(params.offset);
      }
      
      if (params.limit) {
        findQuery = findQuery.limit(params.limit);
      }
      
      // Execute the query
      const events = await findQuery.lean();
      return this.documentsToEntities<Event>(events);
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    }
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const lastEvent = await EventModel.findOne().sort({ id: -1 });
    const id = lastEvent ? lastEvent.id + 1 : 1;
    
    const newEvent = new EventModel({
      ...event,
      id,
      createdAt: new Date(),
      isDeleted: false,
      deleteRequestedAt: null,
      attendeeCount: 0,
      likeCount: 0,
      saveCount: 0
    });
    
    await newEvent.save();
    return this.documentToEntity<Event>(newEvent);
  }

  async requestDeleteEvent(id: number): Promise<Event | undefined> {
    const event = await EventModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { $set: { deleteRequestedAt: new Date() } },
      { new: true }
    );
    return this.documentToEntity<Event>(event);
  }

  async deleteEvent(id: number): Promise<void> {
    await EventModel.updateOne({ id }, { $set: { isDeleted: true } });
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await EventModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { $set: eventData },
      { new: true }
    );
    return this.documentToEntity<Event>(event);
  }

  async incrementEventAttendeeCount(id: number): Promise<Event | undefined> {
    const event = await EventModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true } },
      { $inc: { attendeeCount: 1 } },
      { new: true }
    );
    return this.documentToEntity<Event>(event);
  }

  async decrementEventAttendeeCount(id: number): Promise<Event | undefined> {
    const event = await EventModel.findOneAndUpdate(
      { id, isDeleted: { $ne: true }, attendeeCount: { $gt: 0 } },
      { $inc: { attendeeCount: -1 } },
      { new: true }
    );
    return this.documentToEntity<Event>(event);
  }

  // Implement the rest of the IStorage interface methods for MongoDB
  // For brevity, I'll add a few more key methods and you can add the rest as needed

  // Post methods
  async getPosts(): Promise<Post[]> {
    const posts = await PostModel.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return this.documentsToEntities<Post>(posts);
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    const posts = await PostModel.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return this.documentsToEntities<Post>(posts);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const lastPost = await PostModel.findOne().sort({ id: -1 });
    const id = lastPost ? lastPost.id + 1 : 1;
    
    const newPost = new PostModel({
      ...post,
      id,
      createdAt: new Date(),
      isDeleted: false,
      deleteRequestedAt: null,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0
    });
    
    await newPost.save();
    return this.documentToEntity<Post>(newPost);
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    const bookings = await BookingModel.find();
    return this.documentsToEntities<Booking>(bookings);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    const bookings = await BookingModel.find({ userId }).sort({ createdAt: -1 });
    return this.documentsToEntities<Booking>(bookings);
  }

  async getBookingsByEvent(eventId: number): Promise<Booking[]> {
    const bookings = await BookingModel.find({ eventId }).sort({ createdAt: -1 });
    return this.documentsToEntities<Booking>(bookings);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const lastBooking = await BookingModel.findOne().sort({ id: -1 });
    const id = lastBooking ? lastBooking.id + 1 : 1;
    
    const newBooking = new BookingModel({
      ...booking,
      id,
      createdAt: new Date()
    });
    
    await newBooking.save();

    // Increment attendee count
    if (booking.eventId) {
      await this.incrementEventAttendeeCount(booking.eventId);
    }
    
    return this.documentToEntity<Booking>(newBooking);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = await BookingModel.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    );
    return this.documentToEntity<Booking>(booking);
  }

  async updateBookingPaymentStatus(id: number, paymentStatus: string): Promise<Booking | undefined> {
    const booking = await BookingModel.findOneAndUpdate(
      { id },
      { $set: { paymentStatus } },
      { new: true }
    );
    return this.documentToEntity<Booking>(booking);
  }

  // Additional methods implementation will continue here
  
  // Account Management - User Blocking Methods
  async blockUser(blockerId: number, blockedId: number, reason?: string): Promise<BlockedUser> {
    const lastBlockedUser = await BlockedUserModel.findOne().sort({ id: -1 });
    const id = lastBlockedUser ? lastBlockedUser.id + 1 : 1;
    
    const newBlockedUser = new BlockedUserModel({
      id,
      blockerId,
      blockedId,
      reason,
      createdAt: new Date()
    });
    
    await newBlockedUser.save();
    return this.documentToEntity<BlockedUser>(newBlockedUser);
  }
  
  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await BlockedUserModel.deleteOne({ blockerId, blockedId });
  }
  
  async getBlockedUsers(userId: number): Promise<BlockedUser[]> {
    const blockedUsers = await BlockedUserModel.find({ blockerId: userId });
    return this.documentsToEntities<BlockedUser>(blockedUsers);
  }
  
  async isUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const count = await BlockedUserModel.countDocuments({ 
      blockerId, 
      blockedId 
    });
    return count > 0;
  }
  
  // Account Management - Unblock Requests
  async createUnblockRequest(request: InsertUnblockRequest): Promise<UnblockRequest> {
    const lastRequest = await UnblockRequestModel.findOne().sort({ id: -1 });
    const id = lastRequest ? lastRequest.id + 1 : 1;
    
    const newRequest = new UnblockRequestModel({
      ...request,
      id,
      createdAt: new Date()
    });
    
    await newRequest.save();
    return this.documentToEntity<UnblockRequest>(newRequest);
  }
  
  async getPendingUnblockRequests(): Promise<UnblockRequest[]> {
    const requests = await UnblockRequestModel.find({ status: 'pending' });
    return this.documentsToEntities<UnblockRequest>(requests);
  }
  
  async resolveUnblockRequest(requestId: number, status: string, adminId: number): Promise<UnblockRequest | undefined> {
    const request = await UnblockRequestModel.findOneAndUpdate(
      { id: requestId },
      { 
        $set: { 
          status, 
          adminId, 
          resolvedAt: new Date() 
        } 
      },
      { new: true }
    );
    
    return this.documentToEntity<UnblockRequest>(request);
  }
  
  // Account Management - Admin Users
  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    const lastAdminUser = await AdminUserModel.findOne().sort({ id: -1 });
    const id = lastAdminUser ? lastAdminUser.id + 1 : 1;
    
    const newAdminUser = new AdminUserModel({
      ...adminUser,
      id,
      assignedAt: new Date()
    });
    
    await newAdminUser.save();
    return this.documentToEntity<AdminUser>(newAdminUser);
  }
  
  async removeAdminUser(userId: number): Promise<void> {
    await AdminUserModel.deleteOne({ userId });
  }
  
  async getAdminUsers(): Promise<AdminUser[]> {
    const admins = await AdminUserModel.find();
    return this.documentsToEntities<AdminUser>(admins);
  }
  
  async isUserAdmin(userId: number): Promise<boolean> {
    const count = await AdminUserModel.countDocuments({ 
      userId, 
      role: { $in: ['admin', 'super_admin'] } 
    });
    return count > 0;
  }
  
  async isSuperAdmin(userId: number): Promise<boolean> {
    const count = await AdminUserModel.countDocuments({ 
      userId, 
      role: 'super_admin' 
    });
    return count > 0;
  }
  
  // Account Deletion Methods
  async requestDeleteUser(userId: number): Promise<User | undefined> {
    const user = await UserModel.findOneAndUpdate(
      { id: userId },
      { 
        $set: { 
          deleteRequestedAt: new Date() 
        } 
      },
      { new: true }
    );
    
    return this.documentToEntity<User>(user);
  }
  
  async cancelDeleteUser(userId: number): Promise<User | undefined> {
    const user = await UserModel.findOneAndUpdate(
      { id: userId },
      { 
        $set: { 
          deleteRequestedAt: null 
        } 
      },
      { new: true }
    );
    
    return this.documentToEntity<User>(user);
  }
  
  async deleteUser(userId: number): Promise<void> {
    await UserModel.updateOne(
      { id: userId },
      { 
        $set: { 
          isDeleted: true,
          deleteRequestedAt: new Date()
        } 
      }
    );
  }
}