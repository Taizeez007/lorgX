import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Calendar,
  School,
  GraduationCap
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { InsertEducationHistory, EducationHistory } from '@shared/schema';
import { useDeleteEducation, useUpdateEducation } from '@/hooks/use-education-history';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface EducationHistoryCardProps {
  education: EducationHistory;
  isCurrentUser: boolean;
}

export function EducationHistoryCard({ education, isCurrentUser }: EducationHistoryCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertEducationHistory>>({
    schoolName: education.schoolName,
    degree: education.degree || undefined,
    fieldOfStudy: education.fieldOfStudy || undefined,
    startYear: education.startYear || undefined,
    graduationYear: education.graduationYear || undefined,
    description: education.description || undefined,
    imageUrl: education.imageUrl || undefined
  });

  const updateEducation = useUpdateEducation();
  const deleteEducation = useDeleteEducation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEducation.mutateAsync({
        id: education.id,
        data: formData
      });
      setIsEditing(false);
      toast({
        title: "Education updated",
        description: "Your education history has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEducation.mutateAsync({
        id: education.id,
        userId: education.userId
      });
      setIsDeleting(false);
      toast({
        title: "Education deleted",
        description: "Your education history entry has been deleted."
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const educationTimeframe = () => {
    if (education.startYear && education.graduationYear) {
      return `${education.startYear} - ${education.graduationYear}`;
    } else if (education.startYear) {
      return `Started ${education.startYear}`;
    } else if (education.graduationYear) {
      return `Graduated ${education.graduationYear}`;
    }
    return '';
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              {education.imageUrl ? (
                <AvatarImage src={education.imageUrl} alt={education.schoolName} />
              ) : (
                <AvatarFallback>
                  <School className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg">{education.schoolName}</CardTitle>
              {education.degree && education.fieldOfStudy && (
                <CardDescription>
                  {education.degree} in {education.fieldOfStudy}
                </CardDescription>
              )}
            </div>
          </div>
          
          {isCurrentUser && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{educationTimeframe()}</span>
            
            {education.isVerified && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                <GraduationCap className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          {education.description && (
            <p className="text-sm mt-2">{education.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Update your education details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="schoolName" className="text-right">Institution</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="degree" className="text-right">Degree</Label>
                <Input
                  id="degree"
                  name="degree"
                  value={formData.degree || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g. Bachelor's, Master's"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fieldOfStudy" className="text-right">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startYear" className="text-right">Start Year</Label>
                <Input
                  id="startYear"
                  name="startYear"
                  type="number"
                  value={formData.startYear || ''}
                  onChange={handleNumberChange}
                  className="col-span-3"
                  placeholder="e.g. 2018"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="graduationYear" className="text-right">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  value={formData.graduationYear || ''}
                  onChange={handleNumberChange}
                  className="col-span-3"
                  placeholder="e.g. 2022"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="URL to institution logo or related image"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                  placeholder="Brief description of your educational experience"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateEducation.isPending}>
                {updateEducation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this education entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteEducation.isPending}
            >
              {deleteEducation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}