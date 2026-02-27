import './globals.css';
import type { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import { Toaster } from '@/components/ui/Toaster';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'To-Do List App',
  description: 'A simple to-do list app for creating, editing, organizing, and tracking tasks.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="mx-auto w-full max-w-6xl px-4 py-6">
              {children}
            </main>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
