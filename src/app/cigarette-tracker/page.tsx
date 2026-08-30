"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

export default function CigaretteTrackerPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, t } = useBudget();
  const isFrench = settings.language === 'fr';

  return (
    <div className="flex flex-col h-full w-full px-5" style={{ backgroundColor: palette.background }}>
      <div className="h-[62px] flex flex-row items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <ArrowLeft size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>
          {isFrench ? "Cigarettes" : "Cigarette Tracker"}
        </span>
        <div className="w-10" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-[14px]" style={{ color: palette.muted }}>
          {isFrench ? "Suivi mensuel privé en cours de développement." : "Private monthly tracker under development."}
        </p>
      </div>
    </div>
  );
}
