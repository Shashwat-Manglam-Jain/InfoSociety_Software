"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { useLanguage } from "@/shared/i18n/language-provider";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import {
  hydrateThemePreferences,
  setThemeMode,
  setThemePreset,
  toggleThemeMode
} from "@/shared/store/slices/ui-preferences-slice";
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
  const dispatch = useAppDispatch();
  const { locale } = useLanguage();
  const preset = useAppSelector((state) => state.uiPreferences.themePreset);
  const mode = useAppSelector((state) => state.uiPreferences.themeMode);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasHydrated.current) return;

    const stored = parseStoredTheme(window.localStorage.getItem(STORAGE_KEY));
    const nextMode = stored.mode ?? (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : defaultThemeMode);

    dispatch(
      hydrateThemePreferences({
        themePreset: stored.preset ?? defaultThemePreset,
        themeMode: nextMode
      })
    );

    hasHydrated.current = true;
  }, [dispatch]);

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

  const theme = useMemo(() => createAppTheme({ preset, mode, locale }), [locale, mode, preset]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preset,
      mode,
      presets: themePresets,
      setPreset: (nextPreset) => dispatch(setThemePreset(nextPreset)),
      setMode: (nextMode) => dispatch(setThemeMode(nextMode)),
      toggleMode: () => dispatch(toggleThemeMode())
    }),
    [dispatch, mode, preset]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

