import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertWorkHistorySchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useAddWork } from '@/hooks/use-work-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Briefcase } from 'lucide-react';

// Extend the work history schema with additional validation
const formSchema = insertWorkHistorySchema.extend({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  currentlyWorking: z.boolean().optional(),
}).refine(
  (data) => {
    // If currentlyWorking is true, endDate should be null/undefined
    if (data.currentlyWorking) {
      return !data.endDate;
    }
    
    // If currentlyWorking is false, endDate is required
    if (data.currentlyWorking === false) {
      return !!data.endDate;
    }
    
    // For initial form state where currentlyWorking might be undefined
    return true;
  },
  {
    message: "Please provide an end date or check 'I currently work here'",
    path: ["endDate"],
  }
).refine(
  (data) => {
    // If both dates are provided, make sure start is before end
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
  }
);

type FormValues = z.infer<typeof formSchema> & { currentlyWorking?: boolean };

interface AddWorkFormProps {
  userId: number;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline" | "link" | "ghost";
}

export function AddWorkForm({ userId, onSuccess, buttonVariant = "default" }: AddWorkFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const addWork = useAddWork();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      position: "",
      workType: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      imageUrl: "",
      workLink: "",
      userId: userId
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // If currently working, remove end date
      const submitData = {
        ...values,
        userId,
        endDate: values.currentlyWorking ? undefined : values.endDate
      };
      
      // Remove the currentlyWorking field as it's not part of the schema
      const { currentlyWorking, ...finalData } = submitData;
      
      await addWork.mutateAsync(finalData);
      
      toast({
        title: "Work experience added",
        description: "Your work history has been updated successfully.",
      });
      
      // Reset form and close dialog
      form.reset();
      setOpen(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Failed to add work experience",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const currentlyWorking = form.watch("currentlyWorking");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add Work Experience</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Add Work Experience
          </DialogTitle>
          <DialogDescription>
            Add your work experience to your profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Microsoft" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Full-time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="currentlyWorking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I currently work here</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {!currentlyWorking && (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="URL to company logo or related image"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Sample Link</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="URL to portfolio, project or work sample"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add a link to showcase your work from this position.
                  </FormDescription>
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
                      placeholder="Describe your responsibilities and achievements"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="mt-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addWork.isPending} className="mt-2">
                {addWork.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}