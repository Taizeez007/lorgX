import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, MapPin, Video } from "lucide-react";
import { addDays } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface SearchFiltersProps {
  onApplyFilters: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query?: string;
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  isFree?: boolean;
  isVirtual?: boolean;
  isHybrid?: boolean;
  maxPrice?: number;
}

export function SearchFilters({ onApplyFilters, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters.query || '',
    categoryId: initialFilters.categoryId,
    startDate: initialFilters.startDate,
    endDate: initialFilters.endDate,
    isFree: initialFilters.isFree || false,
    isVirtual: initialFilters.isVirtual || false,
    isHybrid: initialFilters.isHybrid || false,
    maxPrice: initialFilters.maxPrice || 100,
  });

  // Fetch categories for the dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      return response.json();
    },
  });

  const handleChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Remove empty or default values before applying filters
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        value !== undefined && 
        value !== '' && 
        (key !== 'isFree' || value === true) &&
        (key !== 'isVirtual' || value === true) &&
        (key !== 'isHybrid' || value === true)
      ) {
        acc[key as keyof SearchFilters] = value;
      }
      return acc;
    }, {} as SearchFilters);
    
    onApplyFilters(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
      isFree: false,
      isVirtual: false,
      isHybrid: false,
      maxPrice: 100,
    });
  };

  const selectToday = () => {
    const today = new Date();
    handleChange('startDate', today);
    handleChange('endDate', today);
  };

  const selectThisWeek = () => {
    const today = new Date();
    const endOfWeek = addDays(today, 7);
    handleChange('startDate', today);
    handleChange('endDate', endOfWeek);
  };

  const selectThisMonth = () => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    handleChange('startDate', today);
    handleChange('endDate', endOfMonth);
  };

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="bg-muted p-4">
        <CardTitle className="text-lg">Filter Events</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-4">
        <div className="space-y-4">
          <Label htmlFor="search-query">Keywords</Label>
          <Input
            id="search-query"
            placeholder="Search events..."
            value={filters.query || ''}
            onChange={(e) => handleChange('query', e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={filters.categoryId?.toString() || ''} 
            onValueChange={(value) => handleChange('categoryId', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category: { id: number; name: string }) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Label>Date Range</Label>
          
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={selectToday}
              >
                Today
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={selectThisWeek}
              >
                This Week
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={selectThisMonth}
              >
                This Month
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  handleChange('startDate', undefined);
                  handleChange('endDate', undefined);
                }}
              >
                Any Time
              </Button>
            </div>
            
            <div className="pt-2">
              <Label className="mb-1 block">From</Label>
              <DatePicker
                date={filters.startDate}
                onSelect={(date) => handleChange('startDate', date)}
              >
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    filters.startDate.toLocaleDateString()
                  ) : (
                    <span>Select start date</span>
                  )}
                </Button>
              </DatePicker>
            </div>
            
            <div className="pt-2">
              <Label className="mb-1 block">To</Label>
              <DatePicker
                date={filters.endDate}
                onSelect={(date) => handleChange('endDate', date)}
              >
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    filters.endDate.toLocaleDateString()
                  ) : (
                    <span>Select end date</span>
                  )}
                </Button>
              </DatePicker>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Label>Price</Label>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="isFree"
              checked={filters.isFree}
              onCheckedChange={(checked) => handleChange('isFree', checked)}
            />
            <Label htmlFor="isFree" className="cursor-pointer">Free events only</Label>
          </div>
          
          {!filters.isFree && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <Label>Max Price ($)</Label>
                <span className="font-medium">${filters.maxPrice}</span>
              </div>
              
              <Slider
                value={[filters.maxPrice || 100]}
                min={0}
                max={500}
                step={10}
                onValueChange={(value) => handleChange('maxPrice', value[0])}
              />
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Label>Event Type</Label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isVirtual"
                checked={filters.isVirtual}
                onCheckedChange={(checked) => handleChange('isVirtual', checked)}
              />
              <Label htmlFor="isVirtual" className="cursor-pointer">Virtual</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isHybrid"
                checked={filters.isHybrid}
                onCheckedChange={(checked) => handleChange('isHybrid', checked)}
              />
              <Label htmlFor="isHybrid" className="cursor-pointer">Hybrid</Label>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 bg-muted p-4">
        <Button className="w-full" onClick={handleApply}>
          Apply Filters
        </Button>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}