import { useAuth } from '@/hooks/use-auth';
import { useUserEducationHistory } from '@/hooks/use-education-history';
import { EducationHistoryCard } from './education-history-card';
import { AddEducationForm } from './add-education-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, School } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EducationHistorySectionProps {
  userId: number;
  isCurrentUser: boolean;
}

export function EducationHistorySection({ userId, isCurrentUser }: EducationHistorySectionProps) {
  const { data: educationHistory, isLoading, error, refetch } = useUserEducationHistory(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <School className="h-5 w-5" />
            Education
          </h3>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <School className="h-5 w-5" />
          Education
        </h3>
        <p className="text-sm mt-2">
          Error loading education history: {error.message}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <School className="h-5 w-5" />
          Education
        </h3>
        {isCurrentUser && (
          <AddEducationForm 
            userId={userId} 
            onSuccess={() => refetch()}
            buttonVariant="outline"
          />
        )}
      </div>

      {(!educationHistory || educationHistory.length === 0) && (
        <div className="bg-muted/50 rounded-md p-8 text-center">
          <School className="h-10 w-10 mx-auto text-muted-foreground" />
          <h4 className="mt-2 font-medium text-muted-foreground">No education history</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {isCurrentUser 
              ? "Add your education to help others know about your background."
              : "This user hasn't added any education history yet."}
          </p>
          {isCurrentUser && (
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Add Education"]')?.click()}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {educationHistory && educationHistory.map((education) => (
          <EducationHistoryCard 
            key={education.id} 
            education={education} 
            isCurrentUser={isCurrentUser} 
          />
        ))}
      </div>
    </div>
  );
}