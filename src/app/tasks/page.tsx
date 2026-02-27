'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

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

interface Category {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState('all');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    params.set('sort', sort);
    if (search) params.set('q', search);
    if (categoryId) params.set('categoryId', categoryId);
    if (completed !== 'all') params.set('completed', completed);
    return params.toString();
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const [tasksRes, categoriesRes] = await Promise.all([
      api.get<{ items: Task[]; total: number; page: number; pageSize: number }>(
        `/api/tasks?${buildQuery()}`
      ),
      api.get<{ items: Category[]; total: number; page: number; pageSize: number }>(
        '/api/categories?page=1&pageSize=100'
      )
    ]);

    if (tasksRes.error) {
      setError(tasksRes.error);
    } else {
      setTasks(tasksRes.data?.items || []);
      setTotal(tasksRes.data?.total || 0);
    }

    if (!categoriesRes.error) {
      setCategories(categoriesRes.data?.items || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, search, completed, categoryId, sort]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await api.delete<{ success: boolean }>(`/api/tasks/${deleteId}`);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Task deleted', 'success');
      setDeleteId(null);
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Tasks</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{error}</p>
          <Button onClick={loadData}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-secondary">Manage your to-do list.</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">Create Task</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input
            label="Search"
            placeholder="Search tasks"
            value={search}
            onChange={event => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Category</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={categoryId}
              onChange={event => {
                setPage(1);
                setCategoryId(event.target.value);
              }}
            >
              <option value="">All categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={completed}
              onChange={event => {
                setPage(1);
                setCompleted(event.target.value);
              }}
            >
              <option value="all">All</option>
              <option value="true">Completed</option>
              <option value="false">Pending</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Sort</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={sort}
              onChange={event => setSort(event.target.value)}
            >
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="dueDate:asc">Due Date (Soon)</option>
              <option value="dueDate:desc">Due Date (Later)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Task List</h2>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-secondary">No tasks match the filters.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/tasks/${task.id}`} className="text-base font-semibold hover:text-primary">
                        {task.title}
                      </Link>
                      <Badge variant={task.completed ? 'success' : 'warning'}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary">{task.description || 'No description'}</p>
                    <p className="text-xs text-secondary">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tasks/${task.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
          Page {page} of {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(prev => prev - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(prev => prev + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Task">
        <p className="text-sm text-secondary">Are you sure you want to delete this task?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TasksPage;
