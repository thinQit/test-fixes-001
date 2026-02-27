import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: 'admin'
    }
  });

  const work = await prisma.category.upsert({
    where: { name: 'Work' },
    update: {},
    create: {
      name: 'Work',
      color: '#3b82f6',
      description: 'Tasks related to work and projects'
    }
  });

  const personal = await prisma.category.upsert({
    where: { name: 'Personal' },
    update: {},
    create: {
      name: 'Personal',
      color: '#22c55e',
      description: 'Personal tasks and errands'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Draft project proposal',
        description: 'Outline objectives, scope, and timeline',
        completed: false,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        priority: 'high',
        categoryId: work.id
      },
      {
        title: 'Plan weekly groceries',
        description: 'Prepare shopping list for the week',
        completed: true,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        priority: 'medium',
        categoryId: personal.id
      },
      {
        title: 'Book dentist appointment',
        completed: false,
        priority: 'low',
        categoryId: personal.id
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
