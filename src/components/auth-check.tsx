"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBudget } from '@/lib/budget-store';

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrated, settings } = useBudget();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (hydrated && !settings.onboardingComplete) {
      router.push('/onboarding');
    }
  }, [hydrated, settings.onboardingComplete, router]);

  if (!isMounted || !hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm opacity-60">Loading Budgetly...</p>
      </div>
    );
  }

  if (!settings.onboardingComplete) {
    return null; // Don't render layout until redirect happens
  }

  return <>{children}</>;
}