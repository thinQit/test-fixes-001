import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  dueDate: z.union([z.string().datetime(), z.null()]).optional(),
  priority: z.string().optional().nullable(),
  categoryId: z.union([z.string().uuid(), z.null()]).optional()
});

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({ where: { id: context.params.id } });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const existing = await prisma.task.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const { title, description, completed, dueDate, priority, categoryId } = parsed.data;

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 });
      }
    }

    const updated = await prisma.task.update({
      where: { id: context.params.id },
      data: {
        title,
        description: description === null ? null : description,
        completed,
        dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
        priority: priority === null ? null : priority,
        categoryId: categoryId === null ? null : categoryId
      }
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const existing = await prisma.task.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: context.params.id } });
    return NextResponse.json({ success: true, data: { success: true } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
