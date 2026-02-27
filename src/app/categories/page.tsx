'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Category {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<{ items: Category[]; total: number; page: number; pageSize: number }>(
      '/api/categories?page=1&pageSize=100'
    );
    if (res.error) {
      setError(res.error);
    } else {
      setCategories(res.data?.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await api.delete<{ success: boolean }>(`/api/categories/${deleteId}`);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Category deleted', 'success');
      setDeleteId(null);
      loadCategories();
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
          <h1 className="text-xl font-semibold">Categories</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{error}</p>
          <Button onClick={loadCategories}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-secondary">Organize tasks by category.</p>
        </div>
        <Button asChild>
          <Link href="/categories/new">Create Category</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Category List</h2>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-secondary">No categories yet.</p>
          ) : (
            <div className="space-y-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{category.name}</p>
                    <p className="text-sm text-secondary">{category.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/categories/${category.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(category.id)}
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

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category">
        <p className="text-sm text-secondary">Are you sure you want to delete this category?</p>
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

export default CategoriesPage;
