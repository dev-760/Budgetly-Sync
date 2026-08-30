import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SyncWorker } from "@/components/sync-worker";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
      <body className={cn("min-h-full", inter.className)}>
        <ThemeProvider>
          <SyncWorker />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
