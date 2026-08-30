"use client";

import React from 'react';
import { useThemeContext } from '@/lib/theme-provider';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { palette } = useThemeContext();
  
  return (
    <div className="min-h-screen w-full bg-[#121c2a] sm:p-4 md:p-8 flex items-center justify-center font-sans text-foreground">
      <div 
        className="w-full sm:max-w-[400px] h-[100dvh] sm:h-[850px] sm:max-h-[90vh] bg-background relative sm:rounded-[40px] sm:shadow-2xl overflow-hidden sm:border-[8px] sm:border-black flex flex-col"
        style={{ backgroundColor: palette.background }}
      >
        {children}
      </div>
    </div>
  );
}