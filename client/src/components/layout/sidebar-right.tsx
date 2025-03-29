import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Loader2, 
  Bell, 
  UserPlus, 
  Calendar, 
  Users, 
  Check, 
  X
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sourceType: string;
  sourceId: number;
  user?: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
}

interface Event {
  id: number;
  title: string;
  startDate: string;
  attendeeCount: number;
}

export default function SidebarRight() {
  const { user } = useAuth();

  const { data: notifications, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const { data: userEvents, isLoading: isUserEventsLoading } = useQuery({
    queryKey: ["/api/events/user"],
    enabled: !!user,
  });

  return (
    <div className="hidden lg:block w-72 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <Link href="/events?filter=cart">
          <Button className="w-full bg-primary hover:bg-red-600 text-white">
            Cart
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-3">Notifications</h3>
        <ul className="space-y-3">
          {isNotificationsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <>
              {notifications.slice(0, 2).map((notification: Notification) => (
                <li key={notification.id} className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                    {notification.type === 'connection_request' ? (
                      <UserPlus className="h-5 w-5 text-primary" />
                    ) : (
                      <Bell className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(notification.createdAt).toLocaleDateString()} 
                    </p>
                    {notification.type === 'connection_request' && (
                      <div className="mt-1 flex space-x-2">
                        <Button 
                          size="sm" 
                          className="h-7 text-xs bg-primary text-white"
                        >
                          <Check className="h-3 w-3 mr-1" /> Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs border border-gray-300 text-gray-900"
                        >
                          <X className="h-3 w-3 mr-1" /> Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </>
          ) : (
            <p className="text-sm text-gray-600">No notifications</p>
          )}
          <li>
            <Link href="/profile?tab=notifications">
              <a className="text-sm text-primary font-medium">View all notifications</a>
            </Link>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-3">Your Upcoming Events</h3>
        <ul className="space-y-3">
          {isUserEventsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : userEvents && userEvents.length > 0 ? (
            <>
              {userEvents
                .filter((event: Event) => new Date(event.startDate) > new Date())
                .slice(0, 2)
                .map((event: Event) => (
                  <li key={event.id} className="border-b border-gray-100 pb-3">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.attendeeCount} attendees</span>
                    </div>
                  </li>
                ))}
            </>
          ) : (
            <p className="text-sm text-gray-600">No upcoming events</p>
          )}
          <li>
            <Link href="/events?filter=my-events">
              <a className="text-sm text-primary font-medium">View calendar</a>
            </Link>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">Trending Topics</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-primary">#TechConference2023</a></li>
          <li><a href="#" className="text-primary">#SummerFestival</a></li>
          <li><a href="#" className="text-primary">#NetworkingEvent</a></li>
          <li><a href="#" className="text-primary">#WebDevelopment</a></li>
          <li><a href="#" className="text-primary">#ArtExhibition</a></li>
        </ul>
      </div>
    </div>
  );
}
