import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SyncWorker } from "@/components/sync-worker";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Budgetly - Personal Finance for Students",
  description: "A modern personal finance and budgeting application built for students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
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
