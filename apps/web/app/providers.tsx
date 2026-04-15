"use client";

import { Provider as ReduxProvider } from "react-redux";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { LanguageProvider } from "@/shared/i18n/language-provider";
import { store } from "@/shared/store/store";
import { AppThemeProvider } from "@/shared/theme/app-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <LanguageProvider>
        <AppThemeProvider>
          {children}
          <ToastViewport />
        </AppThemeProvider>
      </LanguageProvider>
    </ReduxProvider>
  );
}
