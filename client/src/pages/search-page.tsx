import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/ui/search-filters";
import { SearchResults } from "@/components/ui/search-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFiltersType>({});

  // Merge quick search query with other filters
  const allFilters = {
    ...activeFilters,
    query: query || activeFilters.query
  };

  // Build the query string for the API
  const buildQueryString = useCallback((filters: SearchFiltersType) => {
    const params = new URLSearchParams();
    
    if (filters.query) params.append("query", filters.query);
    if (filters.categoryId !== undefined) params.append("categoryId", filters.categoryId.toString());
    if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
    if (filters.isFree) params.append("isFree", "true");
    if (filters.isVirtual) params.append("isVirtual", "true");
    if (filters.isHybrid) params.append("isHybrid", "true");
    if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
    
    return params.toString();
  }, []);

  // Get events with the current filters
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/search/events', allFilters],
    queryFn: async () => {
      const queryString = buildQueryString(allFilters);
      const response = await fetch(`/api/search/events?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to load events');
      }
      return response.json();
    },
    enabled: Object.keys(allFilters).length > 0,
  });

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters(prev => ({ ...prev, query }));
  };

  const handleApplyFilters = (filters: SearchFiltersType) => {
    setActiveFilters(filters);
    
    // Include the quick search query if it exists
    if (query && !filters.query) {
      setActiveFilters(prev => ({ ...prev, query }));
    }
  };

  const handleLikeEvent = useCallback((eventId: number) => {
    toast({
      title: "Event liked",
      description: "This event has been added to your liked events.",
    });
    // TODO: Implement actual like functionality
  }, [toast]);

  const handleSaveEvent = useCallback((eventId: number) => {
    toast({
      title: "Event saved",
      description: "This event has been saved to your bookmarks.",
    });
    // TODO: Implement actual save functionality
  }, [toast]);

  const clearFilters = () => {
    setQuery("");
    setActiveFilters({});
  };

  // Count active filters (excluding query which is shown separately)
  const activeFilterCount = Object.keys(activeFilters).filter(k => k !== 'query').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Event Search</h1>
        
        <div className="flex space-x-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
          
          {(query || Object.keys(activeFilters).length > 0) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <form onSubmit={handleQuickSearch} className="flex gap-2">
          <Input
            placeholder="Search for events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {showFilters && (
          <div className="lg:col-span-1">
            <SearchFilters
              onApplyFilters={handleApplyFilters}
              initialFilters={activeFilters}
            />
          </div>
        )}
        
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          <SearchResults
            events={events}
            isLoading={isLoading}
            onLikeEvent={handleLikeEvent}
            onSaveEvent={handleSaveEvent}
          />
        </div>
      </div>
    </div>
  );
}