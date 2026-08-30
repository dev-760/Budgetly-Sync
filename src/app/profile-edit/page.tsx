"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { X, User, Camera } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { BrandLockup, Input } from "@/components/budget-ui";

function ProfileEditContent() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, updateProfile } = useBudget();
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const [displayName, setDisplayName] = useState(settings.displayName ?? "");
  const [profileImageUri, setProfileImageUri] = useState(settings.profileImageUri);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const choosePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const save = () => {
    updateProfile({ displayName: displayName.trim(), profileImageUri });
    router.back();
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col" style={{ backgroundColor: palette.background }}>
      <div className="flex items-center justify-between mb-8 max-w-xl mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <BrandLockup compact />
        <button 
          onClick={save}
          className="h-10 px-4 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-sm font-bold text-white">{label("Save", "Enregistrer")}</span>
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: palette.foreground }}>
          {label("Edit profile", "Modifier le profil")}
        </h1>
        <p className="text-sm mb-8" style={{ color: palette.muted, lineHeight: 1.5 }}>
          {label("Your name and photo stay on this device. Nothing is uploaded.", "Ton nom et ta photo restent sur cet appareil. Rien n’est envoyé en ligne.")}
        </p>

        <div className="flex flex-col items-center mb-8">
          <div 
            className="relative w-28 h-28 rounded-full flex items-center justify-center cursor-pointer mb-3"
            style={{ backgroundColor: palette.primary }}
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImageUri ? (
              <img src={profileImageUri} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={48} color="#FFFFFF" />
            )}
            <div 
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center border-[3px] shadow-sm"
              style={{ backgroundColor: palette.foreground, borderColor: palette.background }}
            >
              <Camera size={16} color={palette.background} />
            </div>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-bold transition-opacity hover:opacity-80"
            style={{ color: palette.primary }}
          >
            {profileImageUri ? label("Change photo", "Changer la photo") : label("Add a profile photo", "Ajouter une photo")}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            className="hidden" 
            onChange={choosePhoto}
          />
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900" style={{ borderColor: palette.border }}>
          <h4 className="text-xs font-bold tracking-wider mb-4" style={{ color: palette.primary }}>
            {label("PERSONAL", "PERSONNEL")}
          </h4>
          <label className="block text-sm font-bold mb-2" style={{ color: palette.foreground }}>
            {label("Name", "Nom")}
          </label>
          <Input 
            value={displayName} 
            onChange={setDisplayName} 
            placeholder={label("Your name", "Ton nom")}
            className="mb-2"
          />
          <p className="text-xs" style={{ color: palette.muted, lineHeight: 1.5 }}>
            {label("This helps make your dashboard feel personal.", "Cela personnalise ton tableau de bord.")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <ProfileEditContent />
    </Suspense>
  );
}
