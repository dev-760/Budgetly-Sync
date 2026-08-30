"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { FormattedDate } from '@/components/budget-ui';
import { cn } from '@/lib/utils';

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  general: Bell
};

const colorMap = {
  warning: "text-[#ba1a1a] bg-[#ffdad6]",
  success: "text-[#006c49] bg-[#006c49]/10",
  info: "text-[#003fb1] bg-[#003fb1]/10",
  general: "text-[#434654] bg-[#ededf8]"
};

export default function NotificationsPage() {
  const router = useRouter();
  const { settings, notifications, markNotificationRead, markAllNotificationsRead, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
              <ArrowLeft size={20} className="text-[#434654]" />
            </button>
            <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{t("notifications")}</h1>
          </div>
          
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#ededf8] hover:bg-[#e2e1ed] text-[#003fb1] rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors"
            >
              <CheckCircle2 size={16} />
              {label("Mark all read", "Tout marquer comme lu")}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-16 text-center">
              <Bell size={48} className="text-[#c3c5d7] mx-auto mb-4" />
              <h3 className="text-[18px] font-semibold text-[#191b23] mb-2">{label("No notifications", "Aucune notification")}</h3>
              <p className="text-[14px] text-[#434654]">{label("You're all caught up!", "Vous êtes à jour !")}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {notifications.map((notif) => {
                const Icon = iconMap[notif.type as keyof typeof iconMap] || Bell;
                const colors = colorMap[notif.type as keyof typeof colorMap] || colorMap.general;
                
                return (
                  <button
                    key={notif.id}
                    onClick={() => !notif.read && markNotificationRead(notif.id)}
                    className={cn(
                      "w-full p-5 flex items-start gap-4 text-left transition-colors",
                      !notif.read ? "bg-[#f3f3fe] hover:bg-[#e6eeff]" : "bg-white hover:bg-[#f8f9ff]"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colors)}>
                      <Icon size={20} />
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <h3 className={cn(
                        "text-[14px] mb-1",
                        !notif.read ? "font-bold text-[#191b23]" : "font-semibold text-[#434654]"
                      )}>
                        {notif.title}
                      </h3>
                      <p className={cn(
                        "text-[13px] leading-[18px]",
                        !notif.read ? "text-[#434654]" : "text-[#737686]"
                      )}>
                        {notif.body}
                      </p>
                      <p className="text-[11px] font-bold tracking-[0.05em] text-[#737686] uppercase mt-2">
                        <FormattedDate date={notif.date} language={settings.language as any} />
                      </p>
                    </div>

                    {!notif.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#003fb1] mt-2 shrink-0 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
