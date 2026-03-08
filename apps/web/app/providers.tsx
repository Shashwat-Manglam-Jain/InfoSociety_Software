"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "@/shared/theme/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
