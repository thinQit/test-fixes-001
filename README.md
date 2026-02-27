# test-fixes-001

A simple to-do list app for creating, editing, organizing, and tracking tasks with categories, dashboard metrics, and CRUD APIs.

## Features
- Task CRUD with optional description, due date, priority, and category
- Category CRUD with optional color and description
- Filtering, search, sorting, and pagination support
- Dashboard summary metrics
- Optional JWT-based auth scaffolding
- Accessibility-first UI components

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- Jest + React Testing Library
- Playwright for E2E testing

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
./install.sh
# or
./install.ps1
```
Then run:
```bash
npm run dev
```

## Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/app/           # Next.js App Router pages and layout
src/app/api/       # API route handlers
src/components/    # UI and layout components
src/lib/           # Shared utilities
src/providers/     # Client-side providers
src/server/        # Server helpers and services
prisma/            # Prisma schema and DB
tests/             # Unit, integration, and E2E tests
```

## API Endpoints
- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/dashboard`

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Generate Prisma client and build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Watch tests
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Notes
- SQLite is the default dev database.
- Update `DATABASE_URL` for production use.
