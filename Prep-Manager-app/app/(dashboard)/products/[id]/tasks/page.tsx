'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskCard from '@/components/tasks/TaskCard';
import { useProduct } from '@/hooks/useProducts';
import { useProductTasks } from '@/hooks/useTasks';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Loader2, Package } from 'lucide-react';
import { use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Task } from '@/types';

export default function ProductTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = use(params);
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { data: tasks, isLoading: isLoadingTasks } = useProductTasks(id);

  const tasksArray = Array.isArray(tasks) ? tasks : [];

  // Group tasks by status
  const scheduledTasks = tasksArray.filter((task: Task) => task.status === 'scheduled');
  const inProgressTasks = tasksArray.filter((task: Task) => task.status === 'in_progress');
  const completedTasks = tasksArray.filter((task: Task) => task.status === 'completed');
  const lateTasks = tasksArray.filter((task: Task) => task.status === 'late');

  if (isLoadingProduct || isLoadingTasks) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">{t('products.productNotFound')}</p>
          <Button onClick={() => router.push('/products')} className="mt-4">
            {t('products.backToProducts')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/products/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{product.name} - {t('products.tasks')}</h1>
            <p className="text-gray-500 mt-1">{t('products.allTasksForProduct')}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-700">{scheduledTasks.length}</p>
                <p className="text-sm text-gray-500 mt-1">{t('tasks.scheduled')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
                <p className="text-sm text-gray-500 mt-1">{t('tasks.inProgress')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-sm text-gray-500 mt-1">{t('tasks.completed')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{lateTasks.length}</p>
                <p className="text-sm text-gray-500 mt-1">{t('tasks.late')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {tasksArray.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">{t('products.noTasksYet')}</p>
                <p className="text-sm text-gray-400 mt-2">{t('products.scheduleFirstTask')}</p>
                <Button
                  onClick={() => router.push(`/products/${id}`)}
                  className="mt-4"
                >
                  {t('products.schedulePreparation')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Late Tasks */}
            {lateTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                  {t('tasks.lateTasks')} ({lateTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lateTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Tasks */}
            {scheduledTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {t('tasks.scheduled')} ({scheduledTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduledTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {t('tasks.inProgress')} ({inProgressTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                  {t('tasks.completed')} ({completedTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
