"use client";

import { ToastViewport } from "@/components/ui/toast-viewport";
import { LanguageProvider } from "@/shared/i18n/language-provider";
import { AppThemeProvider } from "@/shared/theme/app-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <LanguageProvider>
        {children}
        <ToastViewport />
      </LanguageProvider>
    </AppThemeProvider>
  );
}
