import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild className="mt-2">
        <Link href="/" aria-label="Go to home">Go Home</Link>
      </Button>
    </div>
  );
}

export default NotFound;
