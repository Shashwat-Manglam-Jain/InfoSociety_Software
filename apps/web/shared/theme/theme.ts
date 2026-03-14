import { alpha, createTheme, darken, lighten } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export type AppThemePreset = "slate" | "emerald" | "violet";

export const themePresets: Record<AppThemePreset, { label: string; primary: string; secondary: string }> = {
  slate: {
    label: "Charcoal",
    primary: "#1f2937",
    secondary: "#c9772a"
  },
  emerald: {
    label: "Emerald",
    primary: "#047857",
    secondary: "#c2410c"
  },
  violet: {
    label: "Rose",
    primary: "#be123c",
    secondary: "#c2410c"
  }
};

export const defaultThemePreset: AppThemePreset = "violet";
export const defaultThemeMode: PaletteMode = "light";

type AppThemeOptions = {
  preset: AppThemePreset;
  mode: PaletteMode;
};

export function createAppTheme({ preset, mode }: AppThemeOptions) {
  const paletteTokens = themePresets[preset];
  const primaryMain = paletteTokens.primary;
  const secondaryMain = paletteTokens.secondary;

  const primaryLight = lighten(primaryMain, mode === "light" ? 0.28 : 0.18);
  const primaryDark = darken(primaryMain, mode === "light" ? 0.22 : 0.38);
  const secondaryLight = lighten(secondaryMain, mode === "light" ? 0.22 : 0.14);
  const secondaryDark = darken(secondaryMain, mode === "light" ? 0.18 : 0.36);

  const paper = mode === "light" ? "#ffffff" : "#0f172a";
  const defaultBg = mode === "light" ? "#f8fafb" : "#0a1224";
  const textPrimary = mode === "light" ? "#1f2937" : "#e2e8f0";
  const textSecondary = mode === "light" ? "#475569" : "#94a3b8";
  const divider = mode === "light" ? "#d5e0ea" : alpha("#94a3b8", 0.22);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark
      },
      secondary: {
        main: secondaryMain,
        light: secondaryLight,
        dark: secondaryDark
      },
      success: {
        main: mode === "light" ? "#2e7d4e" : "#22c55e"
      },
      background: {
        default: defaultBg,
        paper
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary
      },
      divider
    },
    shape: {
      borderRadius: 14
    },
    typography: {
      fontFamily: 'var(--font-body), "Trebuchet MS", sans-serif',
      h1: {
        fontFamily: 'var(--font-heading), sans-serif',
        fontWeight: 700,
        letterSpacing: "-0.02em"
      },
      h2: {
        fontFamily: 'var(--font-heading), sans-serif',
        fontWeight: 700,
        letterSpacing: "-0.02em"
      },
      h3: {
        fontFamily: 'var(--font-heading), sans-serif',
        fontWeight: 650
      },
      h4: {
        fontFamily: 'var(--font-heading), sans-serif',
        fontWeight: 650
      },
      button: {
        letterSpacing: "0.01em"
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            "--brand-800": primaryDark,
            "--brand-700": primaryMain,
            "--brand-500": primaryLight,
            "--accent-500": secondaryMain,
            "--accent-600": secondaryDark,
            "--ink-900": textPrimary,
            "--ink-700": textSecondary,
            "--surface-0": defaultBg,
            "--surface-1": paper,
            "--surface-2": mode === "light" ? "#f9fbfd" : "#111c33",
            "--surface-border": divider,
            "--shadow-soft": mode === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(2, 6, 23, 0.55)",
            "--shadow-lift": mode === "light" ? "rgba(15, 23, 42, 0.16)" : "rgba(2, 6, 23, 0.7)",
            "--app-bg-0": mode === "light" ? "#f8fafd" : "#0b1220",
            "--app-bg-1": mode === "light" ? "#f3f7fb" : "#0f172a",
            "--app-bg-2": mode === "light" ? "#f4f7fb" : "#0b1220",
            "--app-grid": mode === "light" ? "rgba(15, 23, 42, 0.035)" : "rgba(148, 163, 184, 0.06)"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            boxShadow: mode === "light" ? "0 8px 24px rgba(16, 43, 66, 0.08)" : "0 10px 28px rgba(2, 6, 23, 0.55)"
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: "none",
            fontWeight: 700
          },
          contained: {
            boxShadow: mode === "light" ? "0 6px 16px rgba(14, 57, 89, 0.18)" : "0 8px 18px rgba(2, 6, 23, 0.6)"
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: mode === "light" ? "rgba(255,255,255,0.92)" : alpha("#0b1220", 0.65)
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${alpha(divider, mode === "light" ? 1 : 0.7)}`
          },
          head: {
            backgroundColor: mode === "light" ? "#f3f7fb" : alpha("#0b1220", 0.55),
            color: mode === "light" ? "#20435f" : textPrimary,
            fontWeight: 700
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 8
          }
        }
      }
    }
  });
}

export const appTheme = createAppTheme({ preset: defaultThemePreset, mode: defaultThemeMode });
