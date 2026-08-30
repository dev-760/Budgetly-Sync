"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ColorScheme = "light" | "dark";
type VisualThemeId = "ocean" | "violet" | "sage";

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  visualTheme: VisualThemeId;
  setVisualTheme: (theme: VisualThemeId) => void;
  palette: {
    background: string;
    foreground: string;
    surface: string;
    border: string;
    primary: string;
    primaryLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    muted: string;
    softPrimary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const visualThemes: Record<VisualThemeId, { primary: string; primaryLight: string; primaryLightDark: string }> = {
  ocean: { primary: "#3B82F6", primaryLight: "#EAF0FF", primaryLightDark: "rgba(59, 130, 246, 0.1)" },
  violet: { primary: "#7C3AED", primaryLight: "#EDE9FE", primaryLightDark: "rgba(124, 58, 237, 0.1)" },
  sage: { primary: "#10B981", primaryLight: "#D1FAE5", primaryLightDark: "rgba(16, 185, 129, 0.1)" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const [visualTheme, setVisualTheme] = useState<VisualThemeId>("ocean");

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setColorScheme(prefersDark ? "dark" : "light");

    // Load saved preferences from localStorage
    const savedColorScheme = localStorage.getItem("colorScheme") as ColorScheme;
    const savedVisualTheme = localStorage.getItem("visualTheme") as VisualThemeId;
    
    if (savedColorScheme) setColorScheme(savedColorScheme);
    if (savedVisualTheme) setVisualTheme(savedVisualTheme);
  }, []);

  useEffect(() => {
    // Apply color scheme to document
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(colorScheme);
    localStorage.setItem("colorScheme", colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    // Apply visual theme CSS variables
    const theme = visualThemes[visualTheme];
    document.documentElement.style.setProperty("--primary", theme.primary);
    
    // Use dark mode background if in dark mode
    const isDark = document.documentElement.classList.contains("dark") || colorScheme === "dark";
    document.documentElement.style.setProperty("--primary-light", isDark ? theme.primaryLightDark : theme.primaryLight);
    
    localStorage.setItem("visualTheme", visualTheme);
  }, [visualTheme, colorScheme]);

  const palette = {
    background: `var(--background)`,
    foreground: `var(--foreground)`,
    surface: `var(--surface)`,
    border: `var(--border)`,
    primary: `var(--primary)`,
    primaryLight: `var(--primary-light)`,
    success: `var(--success)`,
    successLight: `var(--success-light)`,
    warning: `var(--warning)`,
    warningLight: `var(--warning-light)`,
    error: `var(--error)`,
    errorLight: `var(--error-light)`,
    muted: `var(--muted)`,
    softPrimary: `var(--soft-primary)`,
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, visualTheme, setVisualTheme, palette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
