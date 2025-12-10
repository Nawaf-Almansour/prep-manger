import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Task, 
  ApiResponse, 
  TaskFormData,
  TaskStatus
} from '@/types';

// API Response interface
interface InventoryUsageItem {
  itemId: string;
  quantityUsed: number;
  unit?: string;
}

export const useAllTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      const response = await api.get('/tasks/all');
      // Axios interceptor returns response.data which is { success, data: { tasks } }
      const apiResponse = response as unknown as { success: boolean; data: { tasks: Task[]; count?: number } };
      const tasks = apiResponse.data?.tasks || [];
      return tasks.map((task: Task) => ({
        ...task,
        id: task._id || task.id,
      }));
    },
  });
};

export const useTodayTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const response = await api.get('/tasks/today');
      // Axios interceptor returns response.data which is { success, data: { tasks } }
      const apiResponse = response as unknown as { success: boolean; data: { tasks: Task[]; count?: number } };
      const tasks = apiResponse.data?.tasks || [];
      return tasks.map((task: Task) => ({
        ...task,
        id: task._id || task.id,
      }));
    },
  });
};

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'my-tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks/my-tasks');
      // Axios interceptor returns response.data which is { success, data: { tasks } }
      const apiResponse = response as unknown as { success: boolean; data: { tasks: Task[]; count?: number } };
      const tasks = apiResponse.data?.tasks || [];
      return tasks.map((task: Task) => ({
        ...task,
        id: task._id || task.id,
      }));
    },
  });
};

export const useTasksByStatus = (status: TaskStatus) => {
  return useQuery({
    queryKey: ['tasks', 'status', status],
    queryFn: async () => {
      const response = await api.get(`/tasks/status/${status}`);
      // Axios interceptor returns response.data which is { success, data: { tasks } }
      const apiResponse = response as unknown as { success: boolean; data: { tasks: Task[]; count?: number } };
      const tasks = apiResponse.data?.tasks || [];
      return tasks.map((task: Task) => ({
        ...task,
        id: task._id || task.id,
      }));
    },
  });
};

export const useProductTasks = (productId: string) => {
  return useQuery({
    queryKey: ['tasks', 'product', productId],
    queryFn: async () => {
      const response = await api.get(`/tasks/product/${productId}`);
      // Axios interceptor returns response.data which is { success, data: { tasks } }
      const apiResponse = response as unknown as { success: boolean; data: { tasks: Task[]; count?: number } };
      const tasks = apiResponse.data?.tasks || [];
      return tasks.map((task: Task) => ({
        ...task,
        id: task._id || task.id,
      }));
    },
    enabled: !!productId,
  });
};



export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await api.get(`/tasks/${taskId}`);
      // Axios interceptor returns response.data which is { success, data: { task } }
      const apiResponse = response as unknown as { success: boolean; data: { task: Task } | Task };
      const task = (apiResponse.data as { task: Task }).task || (apiResponse.data as Task);
      
      // Debug log to see task data
      console.log('🔍 Task API Response:', { taskId, task, assignedTo: task.assignedTo, assignedToName: task.assignedToName });
      
      return {
        ...task,
        id: task._id || task.id,
      };
    },
    enabled: !!taskId,
  });
};



export const useStartTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response: ApiResponse<Task> = await api.patch(`/tasks/${taskId}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      const response: ApiResponse<Task> = await api.patch(`/tasks/${taskId}/complete`, { notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};


export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response: ApiResponse<Task> = await api.post('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, userId, userName }: { taskId: string; userId: string; userName?: string }) => {
      const response = await api.patch(`/tasks/${taskId}/assign`, { userId, userName });
      // Debug log
      console.log('🔍 Assign Task Response:', response);
      // Handle nested response structure
      const apiResponse = response as unknown as { success: boolean; data: { task: Task } | Task };
      const task = (apiResponse.data as { task: Task })?.task || apiResponse.data;
      return task;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Task assigned successfully:', data);
      // Invalidate both the specific task and all tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('❌ Assign Task Error:', error);
    },
  });
};

export const useMarkTaskLate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response: ApiResponse<Task> = await api.patch(`/tasks/${taskId}/late`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, inventoryUsage }: { taskId: string; inventoryUsage: InventoryUsageItem[] }) => {
      const response: ApiResponse<Task> = await api.patch(`/tasks/${taskId}/usage`, { inventoryUsage });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
