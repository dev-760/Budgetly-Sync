"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, Tag, ShoppingCart, Dog, Dumbbell, Gamepad2, Sparkles, 
  Flag, Calendar, CreditCard, Landmark, Edit2, Trash2, Bell
} from "lucide-react";
import { Card, SectionTitle, RoundIcon, Button, Input } from "@/components/budget-ui";
import { useBudget } from "@/lib/budget-store";
import { useThemeContext, visualThemes } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import type { VisualThemeId } from "@/lib/budget-data";

const colors = ["#1A56DB", "#16A77B", "#D67A1F", "#7A63D2", "#D55A9B", "#1F9BB0"];
const iconMapping = {
  "category": Tag,
  "local-grocery-store": ShoppingCart,
  "pets": Dog,
  "fitness-center": Dumbbell,
  "sports-esports": Gamepad2,
  "spa": Sparkles
};
const icons = Object.keys(iconMapping) as (keyof typeof iconMapping)[];

export default function SettingsPage() {
  const router = useRouter();
  const { settings, addCustomExpenseCategory, updateCustomExpenseCategory, removeCustomExpenseCategory, setAppearancePreferences, setNotificationPreferences, toggleNotifications } = useBudget();
  const { palette } = useThemeContext();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState(icons[0]);
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const resetForm = () => { setEditingId(null); setName(""); setColor(colors[0]); setIcon(icons[0]); };
  
  const saveCategory = () => {
    const input = { name, color, icon };
    const saved = editingId ? updateCustomExpenseCategory(editingId, input) : addCustomExpenseCategory(input);
    if (!saved) {
      alert("Invalid category data.");
      return;
    }
    resetForm();
  };
  
  const beginEdit = (id: string) => {
    const current = settings.customExpenseCategories.find((item) => item.id === id);
    if (!current) return;
    setEditingId(id); setName(current.name); setColor(current.color); setIcon(current.icon as keyof typeof iconMapping);
  };
  
  const remove = (id: string, title: string) => {
    if (window.confirm(label(`Remove category ${title}?`, `Supprimer la catégorie ${title}?`))) {
      if (!removeCustomExpenseCategory(id)) {
        alert(label("Category in use. Move or delete its transactions and budget before removing it.", "Catégorie utilisée. Déplace ou supprime ses transactions et son budget avant de la retirer."));
      }
    }
  };
  
  const preferenceRows = [
    { key: "goalDeadlines" as const, icon: Flag, en: "Goal deadlines", fr: "Échéances d’objectifs", descriptionEn: "Target-date reminders", descriptionFr: "Rappels de dates cibles" },
    { key: "scheduledIncome" as const, icon: Calendar, en: "Scheduled income", fr: "Revenus programmés", descriptionEn: "Payday reminders", descriptionFr: "Rappels de versements" },
    { key: "subscriptionDue" as const, icon: CreditCard, en: "Subscriptions", fr: "Abonnements", descriptionEn: "Upcoming subscription dates", descriptionFr: "Prochaines échéances" },
    { key: "loanDue" as const, icon: Landmark, en: "Loans", fr: "Prêts", descriptionEn: "Loan-payment dates", descriptionFr: "Dates de remboursement" },
  ];
  
  const themeOptions = Object.entries(visualThemes) as [VisualThemeId, (typeof visualThemes)[VisualThemeId]][];

  return (
    <div className="min-h-screen pb-24 px-4 pt-4" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: palette.foreground }}>
            {label("Settings", "Réglages")}
          </h1>
          <p className="text-xs" style={{ color: palette.muted }}>
            {label("Local controls for your spending plan", "Contrôles locaux de ton budget")}
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Appearance */}
        <section>
          <SectionTitle title={label("Appearance", "Apparence")} />
          <Card>
            <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: palette.border }}>
              <div>
                <h4 className="font-semibold" style={{ color: palette.foreground }}>{label("Dark mode", "Mode sombre")}</h4>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>
                  {label("A calmer interface for low-light study sessions.", "Une interface plus douce pour les sessions d’étude en faible lumière.")}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.appearance.colorScheme === "dark"}
                  onChange={(e) => setAppearancePreferences({ colorScheme: e.target.checked ? "dark" : "light" })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: settings.appearance.colorScheme === "dark" ? palette.primary : undefined }}></div>
              </label>
            </div>
            
            <h4 className="text-xs font-bold mb-3" style={{ color: palette.muted }}>{label("Accent theme", "Thème d’accentuation")}</h4>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map(([theme, details]) => (
                <button
                  key={theme}
                  onClick={() => setAppearancePreferences({ visualTheme: theme })}
                  className="flex-1 min-w-[100px] min-h-[76px] rounded-xl border-2 p-2 flex flex-col justify-between transition-colors"
                  style={{ 
                    borderColor: settings.appearance.visualTheme === theme ? details.primary : palette.border,
                    backgroundColor: settings.appearance.visualTheme === theme ? details.soft : palette.background
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: details.primary }} />
                  <span className="text-xs font-bold text-left" style={{ color: settings.appearance.visualTheme === theme ? details.primary : palette.foreground }}>
                    {details.name}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* Expense Categories */}
        <section>
          <SectionTitle title={label("Expense categories", "Catégories de dépenses")} />
          <Card className="flex items-center gap-3 mb-4 bg-blue-50/50">
            <RoundIcon icon={Tag} size={36} color={palette.primary} background={`${palette.primary}20`} />
            <div>
              <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{label("Your categories, on this device", "Tes catégories, sur cet appareil")}</h4>
              <p className="text-xs mt-1" style={{ color: palette.muted }}>{label("Create a category for expense entry. Built-in categories stay available.", "Crée une catégorie pour tes dépenses. Les catégories intégrées restent disponibles.")}</p>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold mb-3" style={{ color: palette.foreground }}>
              {editingId ? label("Edit category", "Modifier la catégorie") : label("New category", "Nouvelle catégorie")}
            </h4>
            <Input 
              value={name} 
              onChange={setName} 
              placeholder={label("e.g. Sports", "ex. Sport")}
              className="mb-4"
            />
            
            <h5 className="text-xs font-bold mb-2" style={{ color: palette.muted }}>{label("Color", "Couleur")}</h5>
            <div className="flex gap-2 mb-4">
              {colors.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("w-7 h-7 rounded-full border-2 transition-all", color === c ? "border-black dark:border-white" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <h5 className="text-xs font-bold mb-2" style={{ color: palette.muted }}>{label("Icon", "Icône")}</h5>
            <div className="flex flex-wrap gap-2 mb-6">
              {icons.map(ic => {
                const Icon = iconMapping[ic];
                return (
                  <button 
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center transition-colors",
                      icon === ic ? "bg-gray-100" : "bg-white"
                    )}
                    style={{ borderColor: palette.border }}
                  >
                    <Icon size={20} color={icon === ic ? palette.primary : palette.muted} />
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button onPress={saveCategory} className="flex-1">
                {editingId ? label("Save changes", "Enregistrer") : label("Add category", "Ajouter")}
              </Button>
              {editingId && (
                <Button variant="secondary" onPress={resetForm}>
                  {label("Cancel", "Annuler")}
                </Button>
              )}
            </div>
          </Card>

          {settings.customExpenseCategories.length > 0 && (
            <Card className="mt-4">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {settings.customExpenseCategories.map(item => {
                  const Icon = iconMapping[item.icon as keyof typeof iconMapping] || Tag;
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <RoundIcon icon={Icon} size={38} color={item.color} background={`${item.color}20`} />
                      <span className="flex-1 font-bold text-sm" style={{ color: palette.foreground }}>{item.name}</span>
                      <button onClick={() => beginEdit(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-800">
                        <Edit2 size={16} color={palette.primary} />
                      </button>
                      <button onClick={() => remove(item.id, item.name)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </section>

        {/* Notifications */}
        <section>
          <SectionTitle title={label("Notifications", "Notifications")} />
          <Card>
            <div className="flex items-center justify-between pb-4 border-b mb-2" style={{ borderColor: palette.border }}>
              <div>
                <h4 className="font-semibold" style={{ color: palette.foreground }}>{label("Device reminders", "Rappels de l’appareil")}</h4>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>{label("Only local notifications.", "Notifications uniquement locales.")}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.notificationsEnabled}
                  onChange={() => toggleNotifications()}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: settings.notificationsEnabled ? palette.primary : undefined }}></div>
              </label>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {preferenceRows.map(row => (
                <div key={row.key} className="flex items-center justify-between py-3">
                  <div>
                    <h5 className="font-bold text-sm" style={{ color: palette.foreground }}>{label(row.en, row.fr)}</h5>
                    <p className="text-[10px] mt-1" style={{ color: palette.muted }}>{label(row.descriptionEn, row.descriptionFr)}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      disabled={!settings.notificationsEnabled}
                      checked={settings.notificationPreferences[row.key]}
                      onChange={(e) => setNotificationPreferences({ [row.key]: e.target.checked })}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-disabled:opacity-50" style={{ backgroundColor: settings.notificationPreferences[row.key] && settings.notificationsEnabled ? palette.primary : undefined }}></div>
                  </label>
                </div>
              ))}
            </div>

            <Button 
              className="w-full mt-4" 
              disabled={!settings.notificationsEnabled}
              onPress={() => alert("Notification settings saved.")}
            >
              <Bell size={18} className="mr-2" />
              {label("Apply reminder preferences", "Appliquer les préférences")}
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}
