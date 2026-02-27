'use client';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/categories', label: 'Categories' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold" aria-label="Home">
          To-Do List
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost">Login</Button>
              <Button variant="primary">Sign Up</Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">Hi, {user?.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Open menu</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div className={cn('border-t border-border md:hidden', open ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-2 px-4 py-3" aria-label="Mobile navigation">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" className="w-full">Login</Button>
                <Button variant="primary" className="w-full">Sign Up</Button>
              </>
            ) : (
              <>
                <span className="text-sm">Hi, {user?.name}</span>
                <Button variant="outline" onClick={logout} className="w-full">Logout</Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
