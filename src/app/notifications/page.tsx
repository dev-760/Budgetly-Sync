"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { formatDate } from "@/lib/budget-data";
import { EmptyState, RoundIcon } from "@/components/budget-ui";
import { cn } from "@/lib/utils";

function NotificationsContent() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, notifications, markNotificationsRead, t } = useBudget();
  
  const unread = notifications.some((item) => !item.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return AlertTriangle;
      case "success": return CheckCircle;
      default: return CalendarIcon;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "warning": return "#F59E0B";
      case "success": return "#10B981";
      default: return palette.primary;
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4" style={{ backgroundColor: palette.background }}>
      <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <ArrowLeft size={22} color={palette.foreground} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: palette.foreground }}>
          {t("notifications")}
        </h1>
        <button 
          disabled={!unread}
          onClick={markNotificationsRead}
          className={cn("px-3 py-2 text-xs font-bold transition-opacity", !unread && "opacity-50")}
          style={{ color: palette.primary }}
        >
          {t("markAllRead")}
        </button>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <div className="mt-12">
            <EmptyState 
              icon={Bell} 
              title={t("noNotifications")} 
              description="" 
            />
          </div>
        ) : (
          notifications.map((item) => {
            const color = getColor(item.type);
            const Icon = getIcon(item.type);
            
            return (
              <div 
                key={item.id}
                className={cn(
                  "p-4 rounded-2xl border flex gap-3 transition-colors",
                  !item.isRead ? "bg-slate-50 dark:bg-slate-800" : "bg-white dark:bg-slate-900"
                )}
                style={{ borderColor: !item.isRead ? palette.primaryLight : palette.border }}
              >
                <RoundIcon icon={Icon} size={42} color={color} background={`${color}20`} />
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>
                    {t(item.titleKey as any)}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: palette.muted, lineHeight: 1.4 }}>
                    {t(item.bodyKey as any)}
                  </p>
                  <p className="text-[10px] mt-2 font-semibold" style={{ color: palette.muted }}>
                    {formatDate(item.createdAt, settings.language as any)}
                  </p>
                </div>
                {!item.isRead && (
                  <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: palette.primary }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <NotificationsContent />
    </Suspense>
  );
}
