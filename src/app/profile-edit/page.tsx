"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Camera } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';

export default function ProfileEditPage() {
  const router = useRouter();
  const { settings, setDisplayName, setProfileImage, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const [name, setName] = useState(settings.displayName || "");
  const [imageUri, setImageUri] = useState(settings.profileImageUri || "");

  const save = () => {
    updateProfile({
      displayName: name.trim() || undefined,
      profileImageUri: imageUri.trim() || undefined
    });
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
            <ArrowLeft size={20} className="text-[#434654]" />
          </button>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Edit Profile", "Modifier le profil")}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-[#003fb1] flex items-center justify-center relative overflow-hidden shadow-sm">
              {imageUri ? (
                <img src={imageUri} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Display Name", "Nom d'affichage")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={label("Enter your name", "Entrez votre nom")}
                className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] font-medium text-[#191b23] outline-none focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Profile Image URL", "URL de l'image de profil")}</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#e5e7eb] focus-within:border-[#003fb1] focus-within:ring-1 focus-within:ring-[#003fb1] transition-all bg-white">
                <Camera size={16} className="text-[#434654]" />
                <input
                  type="text"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-[14px] bg-transparent outline-none text-[#191b23]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={save}
            className="w-full py-3.5 bg-[#003fb1] text-white rounded-lg text-[14px] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
          >
            {label("Save Changes", "Enregistrer les modifications")}
          </button>
        </div>
      </div>
    </div>
  );
}
