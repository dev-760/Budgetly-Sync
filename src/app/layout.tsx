import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppShell } from "@/components/app-shell";
import { OnboardingCheck } from "@/components/auth-check";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Budgetly - Personal Finance for Students",
  description: "A modern personal finance and budgeting application built for students",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={cn("min-h-full")}>
        <ThemeProvider>
          <OnboardingCheck>
            <AppShell>
              {children}
            </AppShell>
          </OnboardingCheck>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
