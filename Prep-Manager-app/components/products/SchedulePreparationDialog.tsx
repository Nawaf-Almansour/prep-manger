'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Calendar, Loader2, Clock } from 'lucide-react';
import { useCreateTask } from '@/hooks/useTasks';
import { useLanguage } from '@/contexts/LanguageContext';

const scheduleSchema = z.object({
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  taskType: z.enum(['red_alert', 'medium', 'daily_recurring', 'weekly_recurring', 'on_demand']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  assignmentType: z.enum(['specific_user', 'any_team_member']),
  assignedUserId: z.string().optional(),
  notes: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface SchedulePreparationDialogProps {
  productId: string;
  productName: string;
  prepTimeMinutes: number;
  trigger?: React.ReactNode;
}

export default function SchedulePreparationDialog({
  productId,
  productName,
  prepTimeMinutes,
  trigger,
}: SchedulePreparationDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const { mutate: createTask, isPending } = useCreateTask();

  // Mock users - in production, this would come from a useUsers hook
  const users = [
    { id: '1', name: 'John Manager', role: 'manager' },
    { id: '2', name: 'Sarah Supervisor', role: 'supervisor' },
    { id: '3', name: 'Mike Prep', role: 'prep' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      taskType: 'daily_recurring',
      priority: 'medium',
      assignmentType: 'any_team_member',
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    setError('');
    
    // Combine date and time into ISO string
    const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
    
    // Build request payload with required fields
    const taskData: {
      productId: string;
      scheduledAt: string;
      taskType: 'red_alert' | 'medium' | 'daily_recurring' | 'weekly_recurring' | 'on_demand';
      priority: 'critical' | 'high' | 'medium' | 'low';
      assignmentType: 'specific_user' | 'any_team_member';
      assignedTo?: string;
      assignedToName?: string;
      notes?: string;
    } = {
      productId,
      scheduledAt: scheduledDateTime.toISOString(),
      taskType: data.taskType,
      priority: data.priority,
      assignmentType: data.assignmentType,
    };
    
    // Only add assignedTo if a user is selected AND it's a valid MongoDB ObjectId
    // Mock users have IDs like '1', '2', '3' which are not valid ObjectIds
    if (data.assignedUserId && data.assignedUserId.length === 24) {
      const assignedUser = users.find(u => u.id === data.assignedUserId);
      taskData.assignedTo = data.assignedUserId;
      if (assignedUser) {
        taskData.assignedToName = assignedUser.name;
      }
    }
    
    // Only add notes if provided
    if (data.notes && data.notes.trim()) {
      taskData.notes = data.notes.trim();
    }
    
    createTask(taskData, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        setError(err.response?.data?.message || 'Failed to schedule task. Please try again.');
      },
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t('products.schedulePreparation')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('products.schedulePreparation')}</DialogTitle>
          <DialogDescription>
            {t('products.schedulePreparationDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-blue-900">
                <strong>{productName}</strong> - {t('products.prepTime')}: {prepTimeMinutes} {t('time.minutes')}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">{t('products.scheduleDate')} *</Label>
            <Input
              id="scheduledDate"
              type="date"
              min={today}
              {...register('scheduledDate')}
              disabled={isPending}
            />
            {errors.scheduledDate && (
              <p className="text-sm text-red-600">{errors.scheduledDate.message}</p>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledTime">{t('products.scheduleTime')} *</Label>
            <Input
              id="scheduledTime"
              type="time"
              {...register('scheduledTime')}
              disabled={isPending}
            />
            {errors.scheduledTime && (
              <p className="text-sm text-red-600">{errors.scheduledTime.message}</p>
            )}
          </div>

          {/* Task Type & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="taskType">{t('tasks.taskType')}</Label>
              <select
                id="taskType"
                {...register('taskType')}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="daily_recurring">{t('tasks.taskTypes.dailyRecurring')}</option>
                <option value="weekly_recurring">{t('tasks.taskTypes.weeklyRecurring')}</option>
                <option value="on_demand">{t('tasks.taskTypes.onDemand')}</option>
                <option value="red_alert">{t('tasks.taskTypes.redAlert')}</option>
                <option value="medium">{t('tasks.taskTypes.medium')}</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">{t('tasks.priority')}</Label>
              <select
                id="priority"
                {...register('priority')}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">{t('tasks.low')}</option>
                <option value="medium">{t('tasks.medium')}</option>
                <option value="high">{t('tasks.high')}</option>
                <option value="critical">{t('tasks.critical')}</option>
              </select>
            </div>
          </div>

          {/* Assignment Type */}
          <div className="space-y-2">
            <Label htmlFor="assignmentType">{t('tasks.assignmentType')}</Label>
            <select
              id="assignmentType"
              {...register('assignmentType')}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="any_team_member">{t('tasks.anyTeamMember')}</option>
              <option value="specific_user">{t('tasks.specificUser')}</option>
            </select>
          </div>

          {/* Assign to User */}
          <div className="space-y-2">
            <Label htmlFor="assignedUserId">{t('products.assignTo')}</Label>
            <select
              id="assignedUserId"
              {...register('assignedUserId')}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('products.assignLater')}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {errors.assignedUserId && (
              <p className="text-sm text-red-600">{errors.assignedUserId.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('products.scheduleNotes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('products.scheduleNotesPlaceholder')}
              rows={3}
              {...register('notes')}
              disabled={isPending}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                  {t('products.scheduling')}...
                </>
              ) : (
                <>
                  <Calendar className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t('products.scheduleTask')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={isPending}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
