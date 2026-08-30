"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { settings, updateProfile, t } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const [name, setName] = useState(settings.displayName || "");
  const [uri, setUri] = useState(settings.profileImageUri || "");

  const save = () => {
    updateProfile({ displayName: name.trim(), profileImageUri: uri.trim() });
    router.back();
  };

  return (
    <div className="flex flex-col h-full w-full px-5" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="h-[62px] flex flex-row items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <X size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>{label("Edit Profile", "Modifier profil")}</span>
        <button onClick={save} className="h-10 px-4 rounded-[14px] flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.primary }}>
          <span className="text-white text-[14px] font-extrabold">{label("Save", "Enregistrer")}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center pt-8">
        <div className="h-[100px] w-[100px] rounded-[30px] flex items-center justify-center overflow-hidden mb-[30px] border-4" style={{ backgroundColor: palette.primary, borderColor: palette.surface }}>
          {uri ? (
            <img src={uri} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} color="white" />
          )}
        </div>

        <div className="w-full max-w-[400px]">
          <span className="text-[13px] font-extrabold ml-1 mb-2 block" style={{ color: palette.foreground }}>{label("Display Name", "Nom d'affichage")}</span>
          <div className="h-[52px] rounded-xl px-4 flex flex-row items-center border mb-6" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={label("e.g. Hassan", "ex: Hassan")}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold h-full"
              style={{ color: palette.foreground }}
            />
          </div>

          <span className="text-[13px] font-extrabold ml-1 mb-2 block" style={{ color: palette.foreground }}>{label("Photo URL", "URL de la photo")}</span>
          <div className="h-[52px] rounded-xl px-4 flex flex-row items-center border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <input
              type="url"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold h-full"
              style={{ color: palette.foreground }}
            />
          </div>
          <p className="text-[12px] font-bold mt-3 text-center" style={{ color: palette.muted }}>
            {label("Data is stored locally on this device.", "Les données sont stockées localement sur cet appareil.")}
          </p>
        </div>
      </div>
    </div>
  );
}
