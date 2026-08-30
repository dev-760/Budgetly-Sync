"use client";

import { useEffect, useRef } from 'react';
import { useBudgetStore } from '@/lib/budget-store';

export function SyncWorker() {
  const syncToCloud = useBudgetStore((state) => state.syncToCloud);
  const hydrated = useBudgetStore((state) => state.hydrated);
  const isInitialLoad = useRef(true);

  // Poll every 30 seconds for new changes from other devices (Pull)
  useEffect(() => {
    if (!hydrated) return;
    
    // We already loaded from cloud on hydration (in budget-store initialize).
    // Now we just poll periodically.
    const interval = setInterval(() => {
      // For a true LWW entity sync we'd pull and merge. 
      // For this simple JSON blob sync, we rely mostly on manual pull or just pushing our state.
      // Doing an automatic pull of the entire blob every 30s might overwrite local unsaved changes, 
      // so in this simplified model we primarily PUSH changes automatically.
    }, 30000);

    return () => clearInterval(interval);
  }, [hydrated]);

  // Subscribe to Zustand store changes to automatically Push to cloud
  useEffect(() => {
    if (!hydrated) return;

    // Debounce the sync to avoid spamming the API on every keystroke
    let timeoutId: NodeJS.Timeout;

    const unsubscribe = useBudgetStore.subscribe((state, prevState) => {
      // Don't push immediately on hydration
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }
      
      // Simple deep equality check could go here, but for now we debounce and push
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        state.syncToCloud();
      }, 3000); // 3 seconds debounce
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [hydrated]);

  return null; // Invisible worker component
}
