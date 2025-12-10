import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'supervisor' | 'prep';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    count: number;
    users: User[];
  };
}

// Fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      // Axios interceptor unwraps response.data, so response is the API response body
      const apiResponse = response as unknown as UsersApiResponse;
      const users = apiResponse.data?.users || [];
      
      // Debug log
      console.log('🔍 Users API Response:', { response, users, count: apiResponse.data?.count });
      
      // Transform _id to id for frontend compatibility
      return users.map((user: User) => ({
        ...user,
        id: user._id || user.id,
      }));
    },
  });
};

// Fetch users by role (for filtered dropdowns)
export const useUsersByRole = (role: 'admin' | 'manager' | 'supervisor' | 'prep') => {
  return useQuery({
    queryKey: ['users', 'role', role],
    queryFn: async () => {
      const response = await api.get(`/users/role/${role}`);
      const apiResponse = response as unknown as UsersApiResponse;
      const users = apiResponse.data?.users || [];
      
      return users.map((user: User) => ({
        ...user,
        id: user._id || user.id,
      }));
    },
    enabled: !!role,
  });
};

// Fetch single user by ID
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      const apiResponse = response as unknown as { data: { user: User } };
      const user = apiResponse.data?.user;
      
      return {
        ...user,
        id: user._id || user.id,
      };
    },
    enabled: !!userId,
  });
};
