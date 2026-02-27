'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  createdAt?: string;
  updatedAt?: string;
}

export function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true);
      setError(null);
      const res = await api.get<Category>(`/api/categories/${categoryId}`);
      if (res.error) {
        setError(res.error);
      } else {
        setCategory(res.data || null);
      }
      setLoading(false);
    };
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleChange = (field: keyof Category, value: string) => {
    if (!category) return;
    setCategory({ ...category, [field]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) return;
    setSubmitting(true);

    const payload = {
      name: category.name.trim(),
      color: category.color || undefined,
      description: category.description?.trim() || undefined
    };

    const res = await api.put<Category>(`/api/categories/${category.id}`, payload);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Category updated', 'success');
      router.push('/categories');
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

  if (error || !category) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Category</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{error || 'Category not found.'}</p>
          <Button asChild variant="outline">
            <Link href="/categories">Back to Categories</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Category</h1>
          <p className="text-sm text-secondary">Update category details.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/categories">Back to Categories</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Category Details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              placeholder="Category name"
              value={category.name}
              onChange={event => handleChange('name', event.target.value)}
              required
            />
            <Input
              label="Color"
              type="color"
              value={category.color || '#3b82f6'}
              onChange={event => handleChange('color', event.target.value)}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                placeholder="Optional description"
                value={category.description || ''}
                onChange={event => handleChange('description', event.target.value)}
              />
            </div>
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

export default CategoryDetailPage;
