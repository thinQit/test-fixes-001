'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Category {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const taskId = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const [taskRes, categoriesRes] = await Promise.all([
        api.get<Task>(`/api/tasks/${taskId}`),
        api.get<{ items: Category[]; total: number; page: number; pageSize: number }>(
          '/api/categories?page=1&pageSize=100'
        )
      ]);

      if (taskRes.error) {
        setError(taskRes.error);
      } else {
        setTask(taskRes.data || null);
      }

      if (!categoriesRes.error) {
        setCategories(categoriesRes.data?.items || []);
      }

      setLoading(false);
    };

    if (taskId) {
      loadData();
    }
  }, [taskId]);

  const handleChange = (field: keyof Task, value: string | boolean) => {
    if (!task) return;
    setTask({ ...task, [field]: value } as Task);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task) return;
    setSubmitting(true);

    const payload = {
      title: task.title.trim(),
      description: task.description?.trim() || undefined,
      dueDate: task.dueDate || undefined,
      priority: task.priority || undefined,
      categoryId: task.categoryId || undefined,
      completed: task.completed
    };

    const res = await api.put<Task>(`/api/tasks/${task.id}`, payload);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Task updated', 'success');
      router.push('/tasks');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Task</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{error || 'Task not found.'}</p>
          <Button asChild variant="outline">
            <Link href="/tasks">Back to Tasks</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Task</h1>
          <p className="text-sm text-secondary">Update details and status.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/tasks">Back to Tasks</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Task Details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              placeholder="Task title"
              value={task.title}
              onChange={event => handleChange('title', event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                placeholder="Optional description"
                value={task.description || ''}
                onChange={event => handleChange('description', event.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Due Date"
                type="date"
                value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                onChange={event => handleChange('dueDate', event.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Priority</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={task.priority || 'medium'}
                  onChange={event => handleChange('priority', event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Category</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={task.categoryId || ''}
                  onChange={event => handleChange('categoryId', event.target.value)}
                >
                  <option value="">No category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={event => handleChange('completed', event.target.checked)}
              />
              Mark as completed
            </label>
            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskDetailPage;
