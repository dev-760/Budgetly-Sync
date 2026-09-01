"use client";

import { useEffect, useRef } from 'react';
import { useBudgetStore } from '@/lib/budget-store';

export function SyncWorker() {
  const syncToCloud = useBudgetStore((state) => state.syncToCloud);
  const loadFromCloud = useBudgetStore((state) => state.loadFromCloud);
  const hydrated = useBudgetStore((state) => state.hydrated);
  const isInitialLoad = useRef(true);

  // Initial load from cloud on hydration
  useEffect(() => {
    if (!hydrated) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadFromCloud().catch(err => console.error('Initial load failed:', err));
    }
  }, [hydrated, loadFromCloud]);

  // Poll every 30 seconds for new changes from other devices (Pull)
  useEffect(() => {
    if (!hydrated || isInitialLoad.current) return;

    const interval = setInterval(async () => {
      try {
        await loadFromCloud();
      } catch (error) {
        console.error('Failed to pull from cloud:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [hydrated, loadFromCloud]);

  // Subscribe to Zustand store changes to automatically Push to cloud
  useEffect(() => {
    if (!hydrated || isInitialLoad.current) return;

    // Debounce the sync to avoid spamming the API on every keystroke
    let timeoutId: NodeJS.Timeout;

    const unsubscribe = useBudgetStore.subscribe((state) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        state.syncToCloud().catch(err => console.error('Sync failed:', err));
      }, 2000); // 2 seconds debounce
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [hydrated]);

  return null; // Invisible worker component
}
