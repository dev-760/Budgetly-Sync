"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBudget } from '@/lib/budget-store';
import { storage } from '@/lib/storage';

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, settings } = useBudget();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Auth is optional; keep onboarding as the first required flow.
    if (pathname === '/auth' || pathname === '/onboarding') {
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(false);
  }, [isMounted, router, pathname]);

  useEffect(() => {
    if (isCheckingAuth || !hydrated) return;

    if (!settings.onboardingComplete && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [hydrated, settings.onboardingComplete, router, isCheckingAuth, pathname]);

  if (!isMounted || isCheckingAuth || !hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm opacity-60">Loading Budgetly...</p>
      </div>
    );
  }

  if (!settings.onboardingComplete && pathname !== '/onboarding') {
    return null; // Don't render the app until onboarding is complete
  }

  return <>{children}</>;
}