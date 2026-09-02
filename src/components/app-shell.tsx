'use client';

import { useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { MobileNav } from './mobile-nav';
import { Topbar } from './topbar';
import { Toaster } from './ui/toaster';
import { TooltipProvider } from './ui/tooltip';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background">
      <AppSidebar />
      <div className="md:pl-[248px]">
        <Topbar onAdd={() => setAddOpen(true)} />
        <main className="page-enter mx-auto max-w-[1440px] px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-12 lg:pt-9">
          {children}
        </main>
      </div>
      <MobileNav onAdd={() => setAddOpen(true)} />
      <TooltipProvider>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}
