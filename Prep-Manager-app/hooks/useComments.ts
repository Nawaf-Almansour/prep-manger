import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Comment, ApiResponse } from '@/types';

export const useTaskComments = (taskId: string) => {
  return useQuery({
    queryKey: ['comments', 'task', taskId],
    queryFn: async () => {
      const response: ApiResponse<Comment[]> = await api.get(`/tasks/${taskId}/comments`);
      return response.data || [];
    },
    enabled: !!taskId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      comment, 
      attachments 
    }: { 
      taskId: string; 
      comment: string; 
      attachments?: string[] 
    }) => {
      const response: ApiResponse<Comment> = await api.post(`/tasks/${taskId}/comments`, {
        comment,
        attachments,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      comment 
    }: { 
      commentId: string; 
      comment: string 
    }) => {
      const response: ApiResponse<Comment> = await api.put(`/comments/${commentId}`, {
        comment,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response: ApiResponse<void> = await api.delete(`/comments/${commentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};
