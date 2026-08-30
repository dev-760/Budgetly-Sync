"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const jwt = storage.getItem('budgetly_jwt');
    if (!jwt) {
      router.push('/auth');
    }
  }, [router]);

  const jwt = storage.getItem('budgetly_jwt');
  if (!jwt) {
    return null; // or render a loading state
  }

  return <>{children}</>;
}