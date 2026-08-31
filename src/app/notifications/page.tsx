"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Check, CalendarDays, Bell } from 'lucide-react';
import { EmptyState, RoundIcon } from '@/components/budget-ui';
import { formatDate } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

export default function NotificationsScreen() {
  const { settings, notifications, markNotificationsRead, t } = useBudget();
  const { palette } = useThemeContext();
  const router = useRouter();
  const unread = notifications.some((item) => !item.isRead);

  const getIcon = (type: string) => {
    if (type === "warning") return AlertTriangle;
    if (type === "success") return Check;
    return CalendarDays;
  };
  const getColor = (type: string) => {
    if (type === "warning") return palette.warning;
    if (type === "success") return palette.success;
    return palette.primary;
  };

  return (
    <div className="flex flex-col h-full w-full px-5" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="h-[62px] flex flex-row items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70 transition-opacity" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <ArrowLeft size={22} color={palette.foreground} />
        </button>
        <span className="text-[17px] font-extrabold" style={{ color: palette.foreground }}>{t("notifications")}</span>
        <button
          disabled={!unread}
          onClick={() => markNotificationsRead()}
          className={cn("py-2 pl-2 active:opacity-70 transition-opacity", !unread && "opacity-45")}
        >
          <span className="text-[12px] font-extrabold" style={{ color: unread ? palette.primary : palette.muted }}>{t("markAllRead")}</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pt-3.5 pb-7">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title={t("noNotifications")} body="" />
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((item) => {
              const color = getColor(item.type);
              const Icon = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="min-h-[92px] rounded-2xl border p-3.5 flex flex-row gap-[11px]"
                  style={{
                    backgroundColor: !item.isRead ? '#F8FAFC' : palette.surface,
                    borderColor: palette.border
                  }}
                >
                  <RoundIcon icon={Icon} size={42} color={color} background={color + '18'} />
                  <div className="flex-1 pr-[7px]">
                    <p className="text-[14px] font-extrabold" style={{ color: palette.foreground }}>
                      {t(item.titleKey as Parameters<typeof t>[0])}
                    </p>
                    <p className="text-[12px] leading-[17px] mt-1" style={{ color: palette.muted }}>
                      {t(item.bodyKey as Parameters<typeof t>[0])}
                    </p>
                    <p className="text-[11px] font-semibold mt-[7px]" style={{ color: palette.muted }}>
                      {formatDate(item.createdAt, settings.language)}
                    </p>
                  </div>
                  {!item.isRead && (
                    <div className="w-2 h-2 rounded-full mt-[3px]" style={{ backgroundColor: palette.primary }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
