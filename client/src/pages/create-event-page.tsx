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
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define event form schema
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  isPublic: z.boolean().default(true),
  isVirtual: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  isFree: z.boolean().default(true),
  price: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });
  
  // Create event form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      startDate: new Date(),
      endDate: undefined,
      address: "",
      categoryId: "",
      isPublic: true,
      isVirtual: false,
      isHybrid: false,
      isFree: true,
      price: "",
    },
  });
  
  // Form values for conditional rendering
  const isVirtual = form.watch("isVirtual");
  const isHybrid = form.watch("isHybrid");
  const isFree = form.watch("isFree");
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormValues) => {
      // Convert categoryId from string to number
      const formattedData = {
        ...eventData,
        categoryId: parseInt(eventData.categoryId),
      };
      
      const res = await apiRequest("POST", "/api/events", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created successfully",
        description: "Your event has been created and is now visible to others",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/user'] });
      navigate("/events?filter=my-events");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message || "There was an error creating your event",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  function onSubmit(values: EventFormValues) {
    createEventMutation.mutate(values);
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            {/* Left Sidebar */}
            <div className="md:w-64">
              <SidebarLeft />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Create New Event</CardTitle>
                  <CardDescription>
                    Fill in the details below to create your event and share it with others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isCategoriesLoading ? (
                                    <div className="flex justify-center py-2">
                                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                  ) : categories && Array.isArray(categories) ? (
                                    categories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-categories">No categories available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter event description" 
                                rows={5} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormDescription>
                              Provide a URL to an image for your event
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date & Time</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                  <div className="p-3 border-t border-border">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-gray-600" />
                                      <Input
                                        type="time"
                                        onChange={(e) => {
                                          const [hours, minutes] = e.target.value.split(':');
                                          const date = new Date(field.value);
                                          date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                          field.onChange(date);
                                        }}
                                        defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                      />
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date & Time (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                  <div className="p-3 border-t border-border">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-gray-600" />
                                      <Input
                                        type="time"
                                        onChange={(e) => {
                                          if (!field.value) return;
                                          const [hours, minutes] = e.target.value.split(':');
                                          const date = new Date(field.value);
                                          date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                          field.onChange(date);
                                        }}
                                        defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                      />
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <FormField
                          control={form.control}
                          name="isVirtual"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Virtual Event</FormLabel>
                                <FormDescription>
                                  Is this a virtual event?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                      form.setValue("isHybrid", false);
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isHybrid"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Hybrid Event</FormLabel>
                                <FormDescription>
                                  Both virtual and physical?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                      form.setValue("isVirtual", false);
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isPublic"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Public Event</FormLabel>
                                <FormDescription>
                                  Make event visible to everyone?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {!isVirtual && (
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event location address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isFree"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>This is a free event</FormLabel>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {!isFree && (
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="text" 
                                    placeholder="$0.00" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/events")}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary" 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create Event"}
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
