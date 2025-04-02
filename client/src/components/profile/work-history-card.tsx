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
  Briefcase,
  BadgeCheck
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
import { InsertWorkHistory, WorkHistory } from '@shared/schema';
import { useDeleteWork, useUpdateWork } from '@/hooks/use-work-history';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface WorkHistoryCardProps {
  work: WorkHistory;
  isCurrentUser: boolean;
}

export function WorkHistoryCard({ work, isCurrentUser }: WorkHistoryCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentlyWorking, setCurrentlyWorking] = useState(!work.endDate);
  const [formData, setFormData] = useState<Partial<InsertWorkHistory>>({
    companyName: work.companyName,
    position: work.position,
    workType: work.workType || undefined,
    location: work.location || undefined,
    startDate: work.startDate ? new Date(work.startDate).toISOString().split('T')[0] : undefined,
    endDate: work.endDate ? new Date(work.endDate).toISOString().split('T')[0] : undefined,
    description: work.description || undefined,
    imageUrl: work.imageUrl || undefined,
    workLink: work.workLink || undefined,
  });

  const updateWork = useUpdateWork();
  const deleteWork = useDeleteWork();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrentlyWorkingChange = (checked: boolean) => {
    setCurrentlyWorking(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, endDate: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWork.mutateAsync({
        id: work.id,
        data: formData
      });
      setIsEditing(false);
      toast({
        title: "Work history updated",
        description: "Your work history has been updated successfully."
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
      await deleteWork.mutateAsync({
        id: work.id,
        userId: work.userId
      });
      setIsDeleting(false);
      toast({
        title: "Work history deleted",
        description: "Your work history entry has been deleted."
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const workTimeframe = () => {
    const startFormatted = formatDate(work.startDate);
    if (!work.endDate) {
      return `${startFormatted} - Present`;
    }
    const endFormatted = formatDate(work.endDate);
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              {work.imageUrl ? (
                <AvatarImage src={work.imageUrl} alt={work.companyName} />
              ) : (
                <AvatarFallback>
                  <Briefcase className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg">{work.position}</CardTitle>
              <CardDescription>
                {work.companyName}
                {work.location && ` · ${work.location}`}
              </CardDescription>
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
            <span>{workTimeframe()}</span>
            
            {work.workType && (
              <Badge variant="secondary" className="ml-2">
                {work.workType}
              </Badge>
            )}
            
            {work.isVerified && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          {work.description && (
            <p className="text-sm mt-2">{work.description}</p>
          )}
          
          {work.workLink && (
            <a 
              href={work.workLink.startsWith('http') ? work.workLink : `https://${work.workLink}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary mt-2 hover:underline"
            >
              View work sample
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Update your work experience details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">Company</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workType" className="text-right">Work Type</Label>
                <Input
                  id="workType"
                  name="workType"
                  value={formData.workType || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g. Full-time, Part-time, Contract"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g. New York, NY or Remote"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="text-right pt-2">End Date</div>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="currently-working" 
                      checked={currentlyWorking}
                      onCheckedChange={handleCurrentlyWorkingChange}
                    />
                    <Label htmlFor="currently-working">I currently work here</Label>
                  </div>
                  {!currentlyWorking && (
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="URL to company logo or related image"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workLink" className="text-right">Work Sample Link</Label>
                <Input
                  id="workLink"
                  name="workLink"
                  value={formData.workLink || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="URL to portfolio, project or work sample"
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
                  placeholder="Describe your responsibilities and achievements"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateWork.isPending}>
                {updateWork.isPending ? "Saving..." : "Save Changes"}
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
              Are you sure you want to delete this work experience? This action cannot be undone.
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
              disabled={deleteWork.isPending}
            >
              {deleteWork.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}