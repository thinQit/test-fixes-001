import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.string().optional(),
  categoryId: z.string().uuid().optional()
});

const parseSort = (sortParam: string | null): Prisma.TaskOrderByWithRelationInput => {
  if (!sortParam) return { createdAt: 'desc' };
  const [field, direction] = sortParam.split(':');
  const order = direction === 'asc' ? 'asc' : 'desc';
  if (field === 'dueDate') return { dueDate: order };
  if (field === 'createdAt') return { createdAt: order };
  return { createdAt: 'desc' };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const completedParam = searchParams.get('completed');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSizeRaw = parseInt(searchParams.get('pageSize') || '25', 10);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);
    const sort = parseSort(searchParams.get('sort'));

    const where: Prisma.TaskWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (completedParam === 'true') {
      where.completed = true;
    } else if (completedParam === 'false') {
      where.completed = false;
    }

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: sort,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.task.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: { items, total, page, pageSize }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { title, description, dueDate, priority, categoryId } = parsed.data;

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        categoryId
      }
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
