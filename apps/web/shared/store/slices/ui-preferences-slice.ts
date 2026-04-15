import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PaletteMode } from "@mui/material";
import { defaultThemeMode, defaultThemePreset, themePresets, type AppThemePreset } from "@/shared/theme/theme";

export type UiPreferencesState = {
  themePreset: AppThemePreset;
  themeMode: PaletteMode;
};

const initialState: UiPreferencesState = {
  themePreset: defaultThemePreset,
  themeMode: defaultThemeMode
};

const uiPreferencesSlice = createSlice({
  name: "uiPreferences",
  initialState,
  reducers: {
    setThemePreset(state, action: PayloadAction<AppThemePreset>) {
      if (action.payload in themePresets) {
        state.themePreset = action.payload;
      }
    },
    setThemeMode(state, action: PayloadAction<PaletteMode>) {
      if (action.payload === "light" || action.payload === "dark") {
        state.themeMode = action.payload;
      }
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === "light" ? "dark" : "light";
    },
    hydrateThemePreferences(state, action: PayloadAction<Partial<UiPreferencesState>>) {
      const { themeMode, themePreset } = action.payload;

      if (themePreset && themePreset in themePresets) {
        state.themePreset = themePreset;
      }

      if (themeMode === "light" || themeMode === "dark") {
        state.themeMode = themeMode;
      }
    }
  }
});

export const { hydrateThemePreferences, setThemeMode, setThemePreset, toggleThemeMode } = uiPreferencesSlice.actions;
export const uiPreferencesReducer = uiPreferencesSlice.reducer;
