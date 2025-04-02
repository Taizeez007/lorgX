import { useQuery, useMutation } from '@tanstack/react-query';
import { InsertEducationHistory, EducationHistory } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

export function useUserEducationHistory(userId: number) {
  return useQuery<EducationHistory[], Error>({
    queryKey: ['/api/users', userId, 'education'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/education`);
      if (!response.ok) {
        throw new Error('Failed to fetch education history');
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useEducationDetail(id: number) {
  return useQuery<EducationHistory, Error>({
    queryKey: ['/api/education', id],
    queryFn: async () => {
      const response = await fetch(`/api/education/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch education details');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useAddEducation() {
  return useMutation<EducationHistory, Error, InsertEducationHistory>({
    mutationFn: async (educationData) => {
      const response = await apiRequest('POST', '/api/education', educationData);
      return response.json();
    },
    onSuccess: (newEducation) => {
      // Get the userId from the new education record
      const userId = newEducation.userId;
      
      // Invalidate the user's education history query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'education'] });
    },
  });
}

export function useUpdateEducation() {
  return useMutation<
    EducationHistory, 
    Error, 
    { id: number; data: Partial<InsertEducationHistory> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/education/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedEducation) => {
      // Get the userId from the updated education record
      const userId = updatedEducation.userId;
      
      // Invalidate both specific education detail and the list
      queryClient.invalidateQueries({ queryKey: ['/api/education', updatedEducation.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'education'] });
    },
  });
}

export function useDeleteEducation() {
  return useMutation<void, Error, { id: number; userId: number }>({
    mutationFn: async ({ id }) => {
      await apiRequest('DELETE', `/api/education/${id}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate both specific education detail and the list
      queryClient.invalidateQueries({ queryKey: ['/api/education', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', variables.userId, 'education'] });
    },
  });
}