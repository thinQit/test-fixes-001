'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface DashboardData {
  totalTasks: number;
  completed: number;
  pending: number;
  byCategory?: { categoryId: string; name: string; count: number }[];
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

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    const [statsRes, tasksRes] = await Promise.all([
      api.get<DashboardData>('/api/dashboard?includeCategories=true'),
      api.get<{ items: Task[]; total: number; page: number; pageSize: number }>(
        '/api/tasks?page=1&pageSize=5&sort=createdAt:desc'
      )
    ]);

    if (statsRes.error) {
      setError(statsRes.error);
    } else {
      setStats(statsRes.data);
    }

    if (tasksRes.error) {
      setError(tasksRes.error);
    } else {
      setRecentTasks(tasksRes.data?.items || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{error}</p>
          <Button onClick={loadDashboard}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-secondary">Track task status at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/tasks">View Tasks</Link>
          </Button>
          <Button asChild>
            <Link href="/tasks/new">New Task</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-sm text-secondary">Total Tasks</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalTasks ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-secondary">Completed</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.completed ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-secondary">Pending</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.pending ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Tasks by Category</h2>
          </CardHeader>
          <CardContent>
            {stats?.byCategory && stats.byCategory.length > 0 ? (
              <ul className="space-y-2">
                {stats.byCategory.map(category => (
                  <li key={category.categoryId} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary">No categories yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-secondary">No tasks created yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-secondary">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant={task.completed ? 'success' : 'warning'}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
