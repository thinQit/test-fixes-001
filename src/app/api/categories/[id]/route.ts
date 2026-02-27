import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({ where: { id: context.params.id } });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id: context.params.id },
      data: {
        name: parsed.data.name,
        color: parsed.data.color === null ? null : parsed.data.color,
        description: parsed.data.description === null ? null : parsed.data.description
      }
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const existing = await prisma.category.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const taskCount = await prisma.task.count({ where: { categoryId: context.params.id } });

    if (taskCount > 0 && !force) {
      return NextResponse.json({ success: false, error: 'Category has tasks; use force=true to delete' }, { status: 400 });
    }

    if (taskCount > 0 && force) {
      await prisma.task.updateMany({
        where: { categoryId: context.params.id },
        data: { categoryId: null }
      });
    }

    await prisma.category.delete({ where: { id: context.params.id } });

    return NextResponse.json({ success: true, data: { success: true } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
