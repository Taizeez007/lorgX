import { useQuery, useMutation } from '@tanstack/react-query';
import { InsertWorkHistory, WorkHistory } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

export function useUserWorkHistory(userId: number) {
  return useQuery<WorkHistory[], Error>({
    queryKey: ['/api/users', userId, 'work'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/work`);
      if (!response.ok) {
        throw new Error('Failed to fetch work history');
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useWorkDetail(id: number) {
  return useQuery<WorkHistory, Error>({
    queryKey: ['/api/work', id],
    queryFn: async () => {
      const response = await fetch(`/api/work/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work details');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useAddWork() {
  return useMutation<WorkHistory, Error, InsertWorkHistory>({
    mutationFn: async (workData) => {
      const response = await apiRequest('POST', '/api/work', workData);
      return response.json();
    },
    onSuccess: (newWork) => {
      // Get the userId from the new work record
      const userId = newWork.userId;
      
      // Invalidate the user's work history query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'work'] });
    },
  });
}

export function useUpdateWork() {
  return useMutation<
    WorkHistory, 
    Error, 
    { id: number; data: Partial<InsertWorkHistory> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/work/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedWork) => {
      // Get the userId from the updated work record
      const userId = updatedWork.userId;
      
      // Invalidate both specific work detail and the list
      queryClient.invalidateQueries({ queryKey: ['/api/work', updatedWork.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'work'] });
    },
  });
}

export function useDeleteWork() {
  return useMutation<void, Error, { id: number; userId: number }>({
    mutationFn: async ({ id }) => {
      await apiRequest('DELETE', `/api/work/${id}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate both specific work detail and the list
      queryClient.invalidateQueries({ queryKey: ['/api/work', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', variables.userId, 'work'] });
    },
  });
}