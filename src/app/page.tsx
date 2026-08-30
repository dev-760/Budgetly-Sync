"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const jwt = storage.getItem('budgetly_jwt');
    if (jwt) {
      router.push('/(tabs)');
    } else {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}