'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, Loader2, UserPlus, Shield, UserCircle } from 'lucide-react';
import { use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['prep', 'supervisor', 'manager'] as const),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

// Mock user data - in production, this would come from an API
const getMockUser = (id: string) => {
  const users: Record<string, UserFormData & { id: string }> = {
    '1': {
      id: '1',
      name: 'John Manager',
      email: 'john.manager@test.com',
      role: 'manager',
      phone: '+1 (555) 123-4567',
      isActive: true,
    },
    '2': {
      id: '2',
      name: 'Sarah Supervisor',
      email: 'supervisor@test.com',
      role: 'supervisor',
      phone: '+1 (555) 234-5678',
      isActive: true,
    },
    '3': {
      id: '3',
      name: 'Mike Prep',
      email: 'prep@test.com',
      role: 'prep',
      phone: '+1 (555) 345-6789',
      isActive: true,
    },
  };
  return users[id];
};

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = use(params);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserFormData & { id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'prep',
      isActive: true,
    },
  });

  useEffect(() => {
    // Simulate API call
    const fetchUser = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const userData = getMockUser(id);
      if (userData) {
        setUser(userData);
        reset({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          isActive: userData.isActive,
        });
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [id, reset]);

  const onSubmit = async (data: UserFormData) => {
    setError('');
    setIsSubmitting(true);

    try {
      // In production, this would call an API endpoint
      console.log('Updating user:', {
        id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        isActive: data.isActive,
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      router.push('/users');
    } catch {
      setError('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleInfo = {
    prep: {
      icon: '👨‍🍳',
      description: t('users.prepDescription'),
    },
    supervisor: {
      icon: '👨‍🏫',
      description: t('users.supervisorDescription'),
    },
    manager: {
      icon: '👨‍💼',
      description: t('users.managerDescription'),
    },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">{t('users.userNotFound')}</p>
          <Button onClick={() => router.push('/users')} className="mt-4">
            {t('users.backToUsers')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['manager']}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('users.editUser')}</h1>
            <p className="text-gray-500 mt-1">{t('users.updateUserDetails')}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t('users.userDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.fullName')} *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., John Doe"
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t('auth.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>{t('auth.role')} *</Label>
                <div className="space-y-3">
                  {(['prep', 'supervisor', 'manager'] as const).map((role) => (
                    <label
                      key={role}
                      className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        value={role}
                        {...register('role')}
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{roleInfo[role].icon}</span>
                          <span className="font-medium capitalize">{role}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {roleInfo[role].description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Is Active */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isSubmitting}
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  {t('users.activeStatus')}
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      {t('users.updatingUser')}...
                    </>
                  ) : (
                    <>
                      <UserPlus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      {t('users.updateUser')}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-amber-600">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  {t('users.editNote')}
                </p>
                <p className="text-sm text-amber-700">
                  {t('users.editNoteTip')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
