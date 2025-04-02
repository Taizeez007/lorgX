import { useAuth } from '@/hooks/use-auth';
import { useUserWorkHistory } from '@/hooks/use-work-history';
import { WorkHistoryCard } from './work-history-card';
import { AddWorkForm } from './add-work-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkHistorySectionProps {
  userId: number;
  isCurrentUser: boolean;
}

export function WorkHistorySection({ userId, isCurrentUser }: WorkHistorySectionProps) {
  const { data: workHistory, isLoading, error, refetch } = useUserWorkHistory(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
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
          <Briefcase className="h-5 w-5" />
          Work Experience
        </h3>
        <p className="text-sm mt-2">
          Error loading work history: {error.message}
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
          <Briefcase className="h-5 w-5" />
          Work Experience
        </h3>
        {isCurrentUser && (
          <AddWorkForm 
            userId={userId} 
            onSuccess={() => refetch()}
            buttonVariant="outline" 
          />
        )}
      </div>

      {(!workHistory || workHistory.length === 0) && (
        <div className="bg-muted/50 rounded-md p-8 text-center">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
          <h4 className="mt-2 font-medium text-muted-foreground">No work experience</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {isCurrentUser 
              ? "Add your work experience to showcase your professional background."
              : "This user hasn't added any work experience yet."}
          </p>
          {isCurrentUser && (
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Add Work Experience"]')?.click()}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Work Experience
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {workHistory && workHistory.map((work) => (
          <WorkHistoryCard 
            key={work.id} 
            work={work} 
            isCurrentUser={isCurrentUser} 
          />
        ))}
      </div>
    </div>
  );
}