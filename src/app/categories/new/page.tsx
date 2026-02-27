'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface CategoryPayload {
  name: string;
  color?: string;
  description?: string;
}

export function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CategoryPayload>({
    name: '',
    color: '#3b82f6',
    description: ''
  });

  const handleChange = (field: keyof CategoryPayload, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      color: form.color || undefined,
      description: form.description?.trim() || undefined
    };

    const res = await api.post<CategoryPayload>('/api/categories', payload);
    if (res.error) {
      toast(res.error, 'error');
    } else {
      toast('Category created', 'success');
      router.push('/categories');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Category</h1>
          <p className="text-sm text-secondary">Add a new category for your tasks.</p>
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
              value={form.name}
              onChange={event => handleChange('name', event.target.value)}
              required
            />
            <Input
              label="Color"
              type="color"
              value={form.color}
              onChange={event => handleChange('color', event.target.value)}
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
            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                Create Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewCategoryPage;
