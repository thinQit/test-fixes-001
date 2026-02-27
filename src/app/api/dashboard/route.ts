import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCategories = searchParams.get('includeCategories') === 'true';

    const [totalTasks, completed, pending] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { completed: true } }),
      prisma.task.count({ where: { completed: false } })
    ]);

    const response: {
      totalTasks: number;
      completed: number;
      pending: number;
      byCategory?: Array<{ categoryId: string; name: string; count: number }>;
    } = { totalTasks, completed, pending };

    if (includeCategories) {
      const groups = await prisma.task.groupBy({
        by: ['categoryId'],
        where: { categoryId: { not: null } },
        _count: { _all: true }
      });

      const categoryIds = groups.map(group => group.categoryId).filter((id): id is string => !!id);
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } }
      });

      const nameById = new Map(categories.map(cat => [cat.id, cat.name]));
      response.byCategory = groups
        .filter(group => group.categoryId)
        .map(group => ({
          categoryId: group.categoryId as string,
          name: nameById.get(group.categoryId as string) || 'Uncategorized',
          count: group._count._all
        }));
    }

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
