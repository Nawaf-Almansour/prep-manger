'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { User, Plus, Search, Edit, Trash2, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data - in production, this would come from an API
  const users = [
    {
      id: '1',
      name: 'John Manager',
      email: 'john.manager@test.com',
      role: 'manager',
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sarah Supervisor',
      email: 'supervisor@test.com',
      role: 'supervisor',
      isActive: true,
      createdAt: '2024-02-01',
    },
    {
      id: '3',
      name: 'Mike Prep',
      email: 'prep@test.com',
      role: 'prep',
      isActive: true,
      createdAt: '2024-02-15',
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'prep':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return '👨‍💼';
      case 'supervisor':
        return '👨‍🏫';
      case 'prep':
        return '👨‍🍳';
      default:
        return '👤';
    }
  };

  return (
    <DashboardLayout allowedRoles={['manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('users.title')}</h1>
            <p className="text-gray-500 mt-1">{t('users.subtitle')}</p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => router.push('/users/new')}
          >
            <Plus className="h-4 w-4" />
            {t('users.addUser')}
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('users.teamMembers')} ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('users.user')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('auth.email')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('auth.role')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('common.status')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">{t('users.joined')}</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                              {getRoleIcon(u.role)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{u.name}</p>
                              <p className="text-sm text-gray-500">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-700">{u.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getRoleBadgeColor(u.role)}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {u.isActive ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-700">
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              disabled={u.id === user?.id}
                              onClick={() => router.push(`/users/${u.id}/edit`)}
                            >
                              <Edit className="h-3 w-3" />
                              {t('common.edit')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-red-600 hover:bg-red-50"
                              disabled={u.id === user?.id}
                            >
                              <Trash2 className="h-3 w-3" />
                              {t('common.delete')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">
                  {t('users.noUsers')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('roles.manager')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter((u) => u.role === 'manager').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                  👨‍💼
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('users.supervisors')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter((u) => u.role === 'supervisor').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                  👨‍🏫
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('roles.prep')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.role === 'prep').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  👨‍🍳
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
