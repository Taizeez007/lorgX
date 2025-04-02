import mongoose from 'mongoose';

// Define models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  bio: { type: String, default: null },
  profileImage: { type: String, default: null },
  career: { type: String, default: null },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  isBusinessAccount: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deleteRequestedAt: { type: Date, default: null }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, default: null },
  icon: { type: String, default: null }
});

const eventPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, default: null },
  categoryId: { type: Number, default: null },
  businessId: { type: Number, default: null },
  latitude: { type: String, default: null },
  longitude: { type: String, default: null },
  capacity: { type: Number, default: null },
  amenities: { type: Array, default: [] },
  images: { type: Array, default: [] },
  pricePerHour: { type: Number, default: null },
  availabilitySchedule: { type: mongoose.Schema.Types.Mixed, default: {} },
  rating: { type: Number, default: null },
  reviewCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deleteRequestedAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  categoryId: { type: Number, default: null },
  description: { type: String, default: null },
  address: { type: String, default: null },
  latitude: { type: String, default: null },
  longitude: { type: String, default: null },
  placeId: { type: Number, default: null },
  createdById: { type: Number, required: true },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: null },
  currency: { type: String, default: 'USD' },
  isPublic: { type: Boolean, default: true },
  isVirtual: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false },
  meetingLink: { type: String, default: null },
  meetingPassword: { type: String, default: null },
  durationMinutes: { type: Number, default: 60 },
  imageUrl: { type: String, default: null },
  attendeeCount: { type: Number, default: 0 },
  maxAttendees: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deleteRequestedAt: { type: Date, default: null },
  likeCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 }
});

const postSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  content: { type: String, default: null },
  imageUrl: { type: String, default: null },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deleteRequestedAt: { type: Date, default: null }
});

const commentSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  postId: { type: Number, required: true },
  content: { type: String, required: true },
  likeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deleteRequestedAt: { type: Date, default: null }
});

const connectionSchema = new mongoose.Schema({
  requesterId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date, default: null },
  category: { type: String, default: null }
});

const followerSchema = new mongoose.Schema({
  followerId: { type: Number, required: true },
  followedId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdById: { type: Number, required: true },
  description: { type: String, default: null },
  imageUrl: { type: String, default: null },
  isPublic: { type: Boolean, default: true },
  memberCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const communityMemberSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  communityId: { type: Number, required: true },
  isAdmin: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  senderId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  attachmentUrl: { type: String, default: null },
  attachmentType: { type: String, default: null },
  replyToMessageId: { type: Number, default: null }
});

const bookingSchema = new mongoose.Schema({
  userId: { type: Number, default: null },
  eventId: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  isGuestBooking: { type: Boolean, default: false },
  guestName: { type: String, default: null },
  guestEmail: { type: String, default: null },
  guestPhone: { type: String, default: null },
  numberOfTickets: { type: Number, default: 1 },
  paymentStatus: { type: String, default: null },
  paymentMethod: { type: String, default: null },
  paymentAmount: { type: Number, default: null },
  paymentCurrency: { type: String, default: null },
  paymentReference: { type: String, default: null },
  additionalNotes: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sourceId: { type: Number, default: null },
  sourceType: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const businessProfileSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  orgName: { type: String, required: true },
  industryType: { type: String, required: true },
  employeeCount: { type: String, required: true },
  officialEmail: { type: String, required: true },
  address: { type: String, default: null },
  foundedYear: { type: Number, default: null },
  website: { type: String, default: null },
  logo: { type: String, default: null },
  coverImage: { type: String, default: null },
  socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
  verified: { type: Boolean, default: false }
});

const businessEditorSchema = new mongoose.Schema({
  businessId: { type: Number, required: true },
  editorId: { type: Number, required: true },
  role: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
});

const postLikeSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  postId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const eventLikeSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  eventId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const savedEventSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  eventId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const savedPlaceSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  placeId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postShareSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  postId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const UserModel = mongoose.model('User', userSchema);
export const CategoryModel = mongoose.model('Category', categorySchema);
export const EventPlaceModel = mongoose.model('EventPlace', eventPlaceSchema);
export const EventModel = mongoose.model('Event', eventSchema);
export const PostModel = mongoose.model('Post', postSchema);
export const CommentModel = mongoose.model('Comment', commentSchema);
export const ConnectionModel = mongoose.model('Connection', connectionSchema);
export const FollowerModel = mongoose.model('Follower', followerSchema);
export const CommunityModel = mongoose.model('Community', communitySchema);
export const CommunityMemberModel = mongoose.model('CommunityMember', communityMemberSchema);
export const MessageModel = mongoose.model('Message', messageSchema);
export const BookingModel = mongoose.model('Booking', bookingSchema);
export const NotificationModel = mongoose.model('Notification', notificationSchema);
export const BusinessProfileModel = mongoose.model('BusinessProfile', businessProfileSchema);
export const BusinessEditorModel = mongoose.model('BusinessEditor', businessEditorSchema);
export const PostLikeModel = mongoose.model('PostLike', postLikeSchema);
export const EventLikeModel = mongoose.model('EventLike', eventLikeSchema);
export const SavedEventModel = mongoose.model('SavedEvent', savedEventSchema);
export const SavedPlaceModel = mongoose.model('SavedPlace', savedPlaceSchema);
export const PostShareModel = mongoose.model('PostShare', postShareSchema);

// Import database configuration from config file
import { dbConfig } from './config';

// Add new schemas for user blocking and admin roles
const blockedUserSchema = new mongoose.Schema({
  blockerId: { type: Number, required: true },
  blockedId: { type: Number, required: true },
  reason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const adminUserSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  role: { type: String, required: true, enum: ['admin', 'super_admin'] },
  assignedAt: { type: Date, default: Date.now },
  assignedBy: { type: Number, default: null }
});

const unblockRequestSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: Number, default: null }
});

// Create models for the new schemas
export const BlockedUserModel = mongoose.model('BlockedUser', blockedUserSchema);
export const AdminUserModel = mongoose.model('AdminUser', adminUserSchema);
export const UnblockRequestModel = mongoose.model('UnblockRequest', unblockRequestSchema);

// Connect to MongoDB with improved error handling
export const connectToMongoDB = async () => {
  try {
    // Validate URI format before connecting
    if (!dbConfig.mongoDbUri || 
        !(dbConfig.mongoDbUri.startsWith('mongodb://') || 
          dbConfig.mongoDbUri.startsWith('mongodb+srv://'))) {
      console.error('Invalid MongoDB URI format. URI must start with mongodb:// or mongodb+srv://');
      return false;
    }
    
    await mongoose.connect(dbConfig.mongoDbUri);
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

export default mongoose;