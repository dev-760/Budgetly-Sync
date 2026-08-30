"use client";

import React from 'react';
import { useThemeContext } from '@/lib/theme-provider';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { palette } = useThemeContext();
  
  return (
    <div 
      className="min-h-screen w-full bg-background font-sans text-foreground"
      style={{ backgroundColor: palette.background }}
    >
      {children}
    </div>
  );
}