import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { LoginFormData, RegisterFormData, User, ApiResponse } from '@/types';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post('/auth/login', data);
      return response;
    },
    onSuccess: (response: { data?: { user: User; token: string }; user?: User; token?: string }) => {
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      if (user && token) {
        setAuth(user, token);
        router.push('/dashboard');
      }
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await api.post('/auth/register', data);
      return response;
    },
    onSuccess: (response: { data?: { user: User; token: string }; user?: User; token?: string }) => {
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      if (user && token) {
        setAuth(user, token);
        router.push('/dashboard');
      }
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data || response;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.patch('/auth/profile', data);
      return response;
    },
    onSuccess: (response: { data?: User } | User) => {
      let user: User | undefined;
      if ('data' in response && response.data) {
        user = response.data;
      } else if ('id' in response) {
        user = response as User;
      }
      if (user) {
        updateUser(user);
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.patch<never, ApiResponse<void>>('/auth/password', data);
      return response;
    },
  });
};
