"use client";

import React from 'react';
import { useThemeContext } from '@/lib/theme-provider';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { palette } = useThemeContext();
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: palette.background }}
    >
      <div 
        className="w-full max-w-[1400px] min-h-screen bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: palette.surface,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}