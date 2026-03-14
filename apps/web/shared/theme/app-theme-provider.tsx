"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { createAppTheme, defaultThemeMode, defaultThemePreset, themePresets, type AppThemePreset } from "./theme";

const STORAGE_KEY = "infopath.theme.v1";

type ThemeState = {
  preset: AppThemePreset;
  mode: PaletteMode;
};

type ThemeContextValue = ThemeState & {
  presets: typeof themePresets;
  setPreset: (preset: AppThemePreset) => void;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  preset: defaultThemePreset,
  mode: defaultThemeMode,
  presets: themePresets,
  setPreset: () => {},
  setMode: () => {},
  toggleMode: () => {}
});

function parseStoredTheme(raw: string | null): Partial<ThemeState> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    const next: Partial<ThemeState> = {};

    if (parsed.preset && parsed.preset in themePresets) {
      next.preset = parsed.preset as AppThemePreset;
    }

    if (parsed.mode === "light" || parsed.mode === "dark") {
      next.mode = parsed.mode;
    }

    return next;
  } catch {
    return {};
  }
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = useState<AppThemePreset>(defaultThemePreset);
  const [mode, setMode] = useState<PaletteMode>(defaultThemeMode);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = parseStoredTheme(window.localStorage.getItem(STORAGE_KEY));
    if (stored.preset) setPreset(stored.preset);
    if (stored.mode) setMode(stored.mode);

    if (!stored.mode) {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      setMode(prefersDark ? "dark" : defaultThemeMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          preset,
          mode
        })
      );
    } catch {
      // Ignore storage write failures (private mode, quota, etc.)
    }
  }, [mode, preset]);

  const theme = useMemo(() => createAppTheme({ preset, mode }), [mode, preset]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preset,
      mode,
      presets: themePresets,
      setPreset,
      setMode,
      toggleMode: () => setMode((prev) => (prev === "light" ? "dark" : "light"))
    }),
    [mode, preset]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

