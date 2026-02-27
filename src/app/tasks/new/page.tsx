'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface TaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  categoryId?: string;
}

export function NewTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<TaskPayload>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    categoryId: ''
  });

  useEffect(() => {
    const loadCategories = async () => {
      const res = await api.get<{ items: Category[]; total: number; page: number; pageSize: number }>(
        '/api/categories?page=1&pageSize=100'
      );
      if (!res.error) {
        setCategories(res.data?.items || []);
      }
      setLoading(false);
    };
    loadCategories();
  }, []);

  const handleChange = (field: keyof TaskPayload, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const payload: TaskPayload = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority || undefined,
      categoryId: form.categoryId || undefined
    };

    const res = await api.post<TaskPayload>('/api/tasks', payload);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Task created', 'success');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Task</h1>
          <p className="text-sm text-secondary">Add a new task to your list.</p>
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
              value={form.title}
              onChange={event => handleChange('title', event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                placeholder="Optional description"
                value={form.description}
                onChange={event => handleChange('description', event.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={event => handleChange('dueDate', event.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Priority</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={form.priority}
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
                  value={form.categoryId}
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
            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                Create Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTaskPage;
