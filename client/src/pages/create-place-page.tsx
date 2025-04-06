import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SidebarLeft from "@/components/layout/sidebar-left";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { X, Plus, Loader2, MapPin, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// Define place form schema
const placeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  capacity: z.coerce.number().min(1).optional(),
  categoryId: z.coerce.number().min(1, "Please select a category"),
  placeType: z.string().min(1, "Please enter a place type"),
  imageUrls: z.array(z.string()).min(1, "At least one image is required"),
  amenities: z.array(z.string()).optional(),
  purposeTags: z.array(z.string()).min(1, "At least one purpose tag is required").max(3, "You can select at most 3 purpose tags"),
  businessId: z.coerce.number().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  // Booking-related fields
  bookingType: z.enum(['single', 'daily', 'subscription']).default('single'),
  minimumBookingDays: z.coerce.number().min(1).default(1).optional(),
  bookingRate: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily').optional(),
  basePrice: z.coerce.number().min(0).default(0),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

// List of common amenities
const commonAmenities = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Heating",
  "Sound System",
  "Projector",
  "Restrooms",
  "Security",
  "Kitchen",
  "Bar",
  "Catering",
  "Wheelchair Accessible",
  "Stage",
  "Outdoor Space",
  "Smoking Area",
  "Private Rooms"
];

// List of common purpose tags
const commonPurposeTags = [
  "Meetings",
  "Conferences",
  "Weddings",
  "Parties",
  "Concerts",
  "Workshops",
  "Exhibitions",
  "Corporate Events",
  "Social Gatherings",
  "Sport Events",
  "Product Launches",
  "Retreats",
  "Team Building"
];

export default function CreatePlacePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPurposeTags, setSelectedPurposeTags] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customPurposeTag, setCustomPurposeTag] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch business profiles for business accounts
  const { data: businessProfiles = [] } = useQuery({
    queryKey: ["/api/business-profiles"],
    enabled: !!user && !!user.isBusinessAccount,
  });

  // Form definition
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      capacity: 100,
      amenities: [],
      purposeTags: [],
      imageUrls: [],
      bookingType: 'single',
      minimumBookingDays: 1,
      bookingRate: 'daily',
      basePrice: 0,
    },
  });

  // Add image URL to the list
  const handleAddImageUrl = (url: string) => {
    if (url && !imageUrls.includes(url)) {
      const newImageUrls = [...imageUrls, url];
      setImageUrls(newImageUrls);
      form.setValue("imageUrls", newImageUrls);
    }
  };

  // Remove image URL from the list
  const handleRemoveImageUrl = (url: string) => {
    const newImageUrls = imageUrls.filter(imgUrl => imgUrl !== url);
    setImageUrls(newImageUrls);
    form.setValue("imageUrls", newImageUrls);
  };

  // Add amenity to the list
  const handleAddAmenity = (amenity: string) => {
    if (amenity && !selectedAmenities.includes(amenity)) {
      const newAmenities = [...selectedAmenities, amenity];
      setSelectedAmenities(newAmenities);
      form.setValue("amenities", newAmenities);
      setCustomAmenity("");
    }
  };

  // Remove amenity from the list
  const handleRemoveAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.filter(a => a !== amenity);
    setSelectedAmenities(newAmenities);
    form.setValue("amenities", newAmenities);
  };

  // Add purpose tag to the list
  const handleAddPurposeTag = (tag: string) => {
    if (tag && !selectedPurposeTags.includes(tag) && selectedPurposeTags.length < 3) {
      const newTags = [...selectedPurposeTags, tag];
      setSelectedPurposeTags(newTags);
      form.setValue("purposeTags", newTags);
      setCustomPurposeTag("");
    }
  };

  // Remove purpose tag from the list
  const handleRemovePurposeTag = (tag: string) => {
    const newTags = selectedPurposeTags.filter(t => t !== tag);
    setSelectedPurposeTags(newTags);
    form.setValue("purposeTags", newTags);
  };

  // Create place mutation
  const createPlaceMutation = useMutation({
    mutationFn: async (data: PlaceFormValues) => {
      const response = await apiRequest("POST", "/api/places", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create place");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your event place has been created.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      navigate("/events?filter=places");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event place.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: PlaceFormValues) => {
    // Filter booking fields based on booking type
    const { bookingType, bookingRate, minimumBookingDays, ...otherValues } = values;

    // Prepare booking related data
    const bookingData = {
      bookingType,
      // Only include booking rate for subscription type
      ...(bookingType === 'subscription' ? { bookingRate } : {}),
      // Only include minimum booking days for daily type
      ...(bookingType === 'daily' ? { minimumBookingDays } : {}),
      // Always include base price
      basePrice: values.basePrice
    };

    const placeData = { 
      ...otherValues,
      ...bookingData,
      createdById: user?.id,
      // Add business ID if user is a business account and has selected one
      ...(user?.isBusinessAccount && values.businessId && { businessId: values.businessId })
    };

    createPlaceMutation.mutate(placeData);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 lg:w-1/5">
            <SidebarLeft />
          </div>

          <div className="w-full md:w-3/4 lg:w-4/5">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create Event Place</CardTitle>
                  <CardDescription>
                    Create a place for hosting events. Businesses can create multiple places to offer for events.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Place Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter venue name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your event venue" 
                                className="min-h-32"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.isArray(categories) && categories.length > 0 ? 
                                    categories.map((category: any) => (
                                      <SelectItem 
                                        key={category.id} 
                                        value={category.id.toString()}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))
                                  : 
                                    <SelectItem value="loading">Loading categories...</SelectItem>
                                  }
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="placeType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Place Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select place type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                                  <SelectItem value="Cafe">Cafe</SelectItem>
                                  <SelectItem value="Hotel">Hotel</SelectItem>
                                  <SelectItem value="Lounge">Lounge</SelectItem>
                                  <SelectItem value="Concert Hall">Concert Hall</SelectItem>
                                  <SelectItem value="Conference Room">Conference Room</SelectItem>
                                  <SelectItem value="Theater">Theater</SelectItem>
                                  <SelectItem value="Gallery">Gallery</SelectItem>
                                  <SelectItem value="Outdoor Venue">Outdoor Venue</SelectItem>
                                  <SelectItem value="Sports Facility">Sports Facility</SelectItem>
                                  <SelectItem value="Banquet Hall">Banquet Hall</SelectItem>
                                  <SelectItem value="Community Center">Community Center</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The type of venue or place
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <div className="flex space-x-2">
                                  <Input placeholder="Full address" className="flex-1" {...field} />
                                  <Button type="button" variant="outline" size="icon">
                                    <MapPin className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacity (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  placeholder="Maximum number of people" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {user.isBusinessAccount && Array.isArray(businessProfiles) && businessProfiles.length > 0 && (
                        <FormField
                          control={form.control}
                          name="businessId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Profile</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select business profile" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {businessProfiles.map((profile: any) => (
                                    <SelectItem 
                                      key={profile.id} 
                                      value={profile.id.toString()}
                                    >
                                      {profile.orgName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Associate this place with one of your business profiles
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Image URLs */}
                      <div>
                        <FormLabel className="block mb-2">Images</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {imageUrls.map((url, index) => (
                            <div 
                              key={index} 
                              className="flex items-center bg-gray-100 dark:bg-gray-800 rounded p-2"
                            >
                              <span className="text-sm mr-2 truncate max-w-xs">{url}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={() => handleRemoveImageUrl(url)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            type="url" 
                            placeholder="Image URL"
                            value={imageUrls.length === 0 ? form.watch("imageUrls")[0] || "" : ""}
                            onChange={(e) => {
                              if (imageUrls.length === 0) {
                                form.setValue("imageUrls", [e.target.value]);
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                handleAddImageUrl(e.target.value);
                                e.target.value = "";
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input.value) {
                                  handleAddImageUrl(input.value);
                                  input.value = "";
                                }
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                              if (input.value) {
                                handleAddImageUrl(input.value);
                                input.value = "";
                              }
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        <FormDescription>
                          Enter image URLs for your venue. Press Enter or click Add to add multiple images.
                        </FormDescription>
                        {form.formState.errors.imageUrls && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.imageUrls.message}
                          </p>
                        )}
                      </div>

                      {/* Amenities */}
                      <div>
                        <FormLabel className="block mb-2">Amenities</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedAmenities.map((amenity, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <span>{amenity}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => handleRemoveAmenity(amenity)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Add amenity"
                            value={customAmenity}
                            onChange={(e) => setCustomAmenity(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customAmenity) {
                                  handleAddAmenity(customAmenity);
                                }
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (customAmenity) {
                                handleAddAmenity(customAmenity);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        <div className="mt-2">
                          <FormLabel className="text-sm font-normal block mb-2">Common amenities:</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {commonAmenities.map((amenity, index) => (
                              <Badge 
                                key={index} 
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleAddAmenity(amenity)}
                              >
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Purpose Tags */}
                      <div>
                        <FormLabel className="block mb-2">Purpose Tags</FormLabel>
                        <FormDescription className="mb-2">
                          Select up to 3 tags that best describe your event place.
                        </FormDescription>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedPurposeTags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <span>{tag}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => handleRemovePurposeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Add purpose tag"
                            value={customPurposeTag}
                            onChange={(e) => setCustomPurposeTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customPurposeTag) {
                                  handleAddPurposeTag(customPurposeTag);
                                }
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (customPurposeTag) {
                                handleAddPurposeTag(customPurposeTag);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        <div className="mt-2">
                          <FormLabel className="text-sm font-normal block mb-2">Common purposes:</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {commonPurposeTags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleAddPurposeTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Booking Options */}
                      <div className="border-t pt-6 mt-8">
                        <h3 className="text-lg font-medium mb-4">Booking Settings</h3>
                        <FormDescription className="mb-4">
                          Configure how this place can be booked by users
                        </FormDescription>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="bookingType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Booking Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select booking type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="single">Single Event Booking</SelectItem>
                                    <SelectItem value="daily">Daily/Specific Days (like a hotel)</SelectItem>
                                    <SelectItem value="subscription">Subscription (like a gym)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose how users can book this place
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {form.watch("bookingType") === "daily" && (
                            <FormField
                              control={form.control}
                              name="minimumBookingDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Booking Days</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Minimum number of days required for booking
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {form.watch("bookingType") === "subscription" && (
                            <FormField
                              control={form.control}
                              name="bookingRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subscription Rate</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select rate" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="hourly">Hourly</SelectItem>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    How often the subscription is billed
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={form.control}
                            name="basePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  {form.watch("bookingType") === "single" && "Price for booking this place for a single event"}
                                  {form.watch("bookingType") === "daily" && "Price per day for booking this place"}
                                  {form.watch("bookingType") === "subscription" && `Price per ${form.watch("bookingRate") || 'period'} subscription period`}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </form>
                  </Form>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/events?filter=places")}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary" 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={createPlaceMutation.isPending}
                  >
                    {createPlaceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create Place"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}