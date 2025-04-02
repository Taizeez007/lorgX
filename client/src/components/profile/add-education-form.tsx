import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertEducationHistorySchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useAddEducation } from '@/hooks/use-education-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { PlusCircle, School } from 'lucide-react';

const currentYear = new Date().getFullYear();

// Extend the education schema with additional validation
const formSchema = insertEducationHistorySchema.extend({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  startYear: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(currentYear, `Year cannot be in the future`)
    .optional()
    .nullable(),
  graduationYear: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(currentYear + 10, `Year cannot be more than 10 years in the future`)
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // If both years are provided, make sure start is before or equal to graduation
    if (data.startYear && data.graduationYear) {
      return data.startYear <= data.graduationYear;
    }
    return true;
  },
  {
    message: "Start year must be before or equal to graduation year",
    path: ["graduationYear"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface AddEducationFormProps {
  userId: number;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline" | "link" | "ghost";
}

export function AddEducationForm({ userId, onSuccess, buttonVariant = "default" }: AddEducationFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const addEducation = useAddEducation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      degree: "",
      fieldOfStudy: "",
      startYear: null,
      graduationYear: null,
      description: "",
      imageUrl: "",
      userId: userId
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await addEducation.mutateAsync({
        ...values,
        userId
      });
      
      toast({
        title: "Education added",
        description: "Your education history has been updated successfully.",
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
        title: "Failed to add education",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add Education</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Add Education
          </DialogTitle>
          <DialogDescription>
            Add your educational background to your profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Harvard University" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the school, university, or educational institution.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor's, PhD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 2018"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : null);
                        }}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 2022"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : null);
                        }}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="URL to school logo or related image"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add an image URL for the institution's logo or related visual.
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
                      placeholder="Describe your educational experience, achievements, etc."
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
              <Button type="submit" disabled={addEducation.isPending} className="mt-2">
                {addEducation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}