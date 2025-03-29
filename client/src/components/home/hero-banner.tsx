import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Discover, Book, And Socialize At The Most Exciting Events, All In One Place
      </h1>
      <p className="mt-3 text-gray-600">From exclusive parties to insightful workshops,</p>
      <p className="text-gray-600">
        LorgX is your gateway to unforgettable experiences and meaningful connections
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/events?filter=places">
          <Button 
            variant="outline" 
            className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white rounded-full"
          >
            Explore Event Places
          </Button>
        </Link>
        <Link href="/events">
          <Button 
            className="px-6 py-3 bg-primary border border-transparent text-white hover:bg-red-700 rounded-full"
          >
            Explore Events
          </Button>
        </Link>
      </div>
    </div>
  );
}
