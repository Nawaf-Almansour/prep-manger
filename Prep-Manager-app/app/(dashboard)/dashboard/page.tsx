'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import TaskKanbanJira from '@/components/dashboard/TaskKanbanJira';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTodayTasks } from '@/hooks/useTasks';
import { useLowStockItems } from '@/hooks/useInventory';
import { useDashboardAnalytics } from '@/hooks/useReports';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Package, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStockStatusColor } from '@/lib/utils';
import { InventoryItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const { data: todayTasks, isLoading: isLoadingTasks } = useTodayTasks();
  const { data: lowStockItems } = useLowStockItems();
  const { data: analytics, isLoading: isLoadingAnalytics } = useDashboardAnalytics();

  // Ensure we always have an array
  const tasksArray = Array.isArray(todayTasks) ? todayTasks : [];
  const lowStockArray = Array.isArray(lowStockItems) ? lowStockItems : [];

  // Fallback stats from today's tasks if analytics not available
  const fallbackStats = {
    total: tasksArray.length,
    scheduled: tasksArray.filter((t) => t.status === 'scheduled').length,
    inProgress: tasksArray.filter((t) => t.status === 'in_progress').length,
    completed: tasksArray.filter((t) => t.status === 'completed').length,
    overdue: tasksArray.filter((t) => t.status === 'overdue').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.welcome')}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('dashboard.stats.totalTasks')}
            value={isLoadingAnalytics ? '...' : (analytics?.totalTasks?.count ?? fallbackStats.total)}
            icon={ClipboardList}
            description={analytics?.totalTasks?.changeLabel || t('tasks.todayTasks')}
            trend={analytics?.totalTasks ? {
              value: analytics.totalTasks.changePercent,
              isPositive: analytics.totalTasks.changePercent >= 0
            } : undefined}
          />
          <StatCard
            title={t('dashboard.stats.completionRate')}
            value={isLoadingAnalytics ? '...' : `${analytics?.completionRate?.percent ?? Math.round((fallbackStats.completed / (fallbackStats.total || 1)) * 100)}%`}
            icon={CheckCircle}
            description={analytics?.completionRate?.changeLabel || t('dashboard.stats.completedDesc')}
            className="border-l-4 border-green-500"
            trend={analytics?.completionRate ? {
              value: analytics.completionRate.changePercent,
              isPositive: analytics.completionRate.changePercent >= 0
            } : undefined}
          />
          <StatCard
            title={t('dashboard.stats.avgPrepTime')}
            value={isLoadingAnalytics ? '...' : `${analytics?.avgPrepTime?.hours ?? 0}h`}
            icon={Clock}
            description={analytics?.avgPrepTime?.changeLabel || t('dashboard.stats.inProgressDesc')}
            className="border-l-4 border-blue-500"
            trend={analytics?.avgPrepTime ? {
              value: Math.abs(analytics.avgPrepTime.changePercent),
              isPositive: analytics.avgPrepTime.changePercent <= 0 // Lower is better for prep time
            } : undefined}
          />
          <StatCard
            title={t('dashboard.stats.onTimeTasks')}
            value={isLoadingAnalytics ? '...' : `${analytics?.onTimeTasks?.percent ?? (100 - Math.round((fallbackStats.overdue / (fallbackStats.total || 1)) * 100))}%`}
            icon={AlertTriangle}
            description={analytics?.onTimeTasks?.changeLabel || t('dashboard.stats.overdueDesc')}
            className="border-l-4 border-yellow-500"
            trend={analytics?.onTimeTasks ? {
              value: analytics.onTimeTasks.changePercent,
              isPositive: analytics.onTimeTasks.changePercent >= 0
            } : undefined}
          />
        </div>

        {/* Task Kanban Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('tasks.todayTasks')}</h2>
              <p className="text-gray-500 text-sm mt-1">{t('dashboard.taskKanbanDesc')}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                {t('dashboard.kanbanView')}
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                {t('dashboard.listView')}
              </Button>
            </div>
          </div>

          {isLoadingTasks ? (
            <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
          ) : (
            <>
              {viewMode === 'kanban' ? (
                <TaskKanbanJira tasks={tasksArray} />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    {tasksArray.length > 0 ? (
                      <div className="space-y-3">
                        {tasksArray.map((task) => (
                          <div key={task.id} onClick={() => router.push(`/tasks/${task.id}`)}>
                            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{task.productName}</h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {new Date(task.scheduledAt).toLocaleString()}
                                  </p>
                                </div>
                                <Badge>{task.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t('tasks.noTasks')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* Low Stock Alerts */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('dashboard.lowStock')}</CardTitle>
                <button
                  onClick={() => router.push('/inventory')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('dashboard.viewAll')}
                </button>
              </CardHeader>
              <CardContent>
                {lowStockArray.length > 0 ? (
                  <div className="space-y-2">
                    {lowStockArray.slice(0, 5).map((item: InventoryItem) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => router.push(`/inventory/${item.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.currentQuantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStockStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t('inventory.allInStock')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
