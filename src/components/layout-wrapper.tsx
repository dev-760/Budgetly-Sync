"use client";

import React from 'react';
import { useThemeContext } from '@/lib/theme-provider';
import { useBudget } from '@/lib/budget-store';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { palette } = useThemeContext();
  const { hydrated } = useBudget();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hydrated) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col font-sans text-foreground"
        style={{ backgroundColor: palette.background }}
      />
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col font-sans text-foreground"
      style={{ backgroundColor: palette.background }}
    >
      {children}
    </div>
  );
}