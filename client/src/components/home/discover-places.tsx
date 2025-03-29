import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Star } from "lucide-react";

export default function DiscoverPlaces() {
  const { user } = useAuth();
  
  const { data: places, isLoading } = useQuery({
    queryKey: ["/api/places"],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Discover Places</h2>
          <Link href="/events?filter=places">
            <a className="text-primary text-sm font-medium">View All</a>
          </Link>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Discover Places</h2>
        <Link href="/events?filter=places">
          <a className="text-primary text-sm font-medium">View All</a>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places && places.length > 0 ? (
          places.slice(0, 3).map((place: any) => (
            <div key={place.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="h-36 bg-gray-200">
                {place.imageUrl ? (
                  <img 
                    src={place.imageUrl} 
                    alt={place.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900">{place.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>
                    {place.rating || 4.5} ({place.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">{place.placeType || "Events Venue"}</span>
                  <Link href={`/events/places/${place.id}`}>
                    <a className="text-sm text-primary hover:text-red-700 font-medium">
                      View Details
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-4 text-center text-gray-600">
            No places found
          </div>
        )}
      </div>
    </div>
  );
}
