import { alpha, createTheme, darken, lighten } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export type AppThemePreset = "slate" | "emerald" | "violet";

export const themePresets: Record<AppThemePreset, { label: string; primary: string; secondary: string }> = {
  slate: {
    label: "Slate Gold",
    primary: "#1e3a5f",
    secondary: "#d97706"
  },
  emerald: {
    label: "Emerald Coral",
    primary: "#0f766e",
    secondary: "#ea580c"
  },
  violet: {
    label: "Royal Bloom",
    primary: "#7c3aed",
    secondary: "#ec4899"
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

  const paper = mode === "light" ? "#ffffff" : "#111c2d";
  const elevatedPaper = mode === "light" ? "#f8fbff" : "#162235";
  const defaultBg = mode === "light" ? "#f4f8fc" : "#09111f";
  const textPrimary = mode === "light" ? "#162033" : "#e6eef8";
  const textSecondary = mode === "light" ? "#5a6b85" : "#9db0ca";
  const divider = mode === "light" ? "#d7e2ee" : alpha("#9db0ca", 0.2);
  const successMain = mode === "light" ? "#1f9d63" : "#34d399";
  const warningMain = mode === "light" ? "#c77800" : "#fbbf24";
  const errorMain = mode === "light" ? "#d14343" : "#f87171";
  const infoMain = mode === "light" ? "#0f6cbd" : "#38bdf8";
  const actionHover = alpha(primaryMain, mode === "light" ? 0.05 : 0.14);
  const actionSelected = alpha(primaryMain, mode === "light" ? 0.1 : 0.2);
  const actionFocus = alpha(primaryMain, mode === "light" ? 0.14 : 0.28);
  const heroBackground =
    mode === "light"
      ? `linear-gradient(135deg, ${darken(primaryMain, 0.14)} 0%, ${primaryMain} 52%, ${secondaryMain} 100%)`
      : `linear-gradient(135deg, ${alpha(primaryDark, 0.96)} 0%, ${alpha(primaryMain, 0.94)} 52%, ${alpha(secondaryMain, 0.88)} 100%)`;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: "#ffffff"
      },
      secondary: {
        main: secondaryMain,
        light: secondaryLight,
        dark: secondaryDark,
        contrastText: mode === "light" ? "#ffffff" : "#1b1024"
      },
      success: {
        main: successMain
      },
      warning: {
        main: warningMain
      },
      error: {
        main: errorMain
      },
      info: {
        main: infoMain
      },
      background: {
        default: defaultBg,
        paper
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary
      },
      divider,
      action: {
        hover: actionHover,
        selected: actionSelected,
        focus: actionFocus
      }
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
            "--surface-2": elevatedPaper,
            "--surface-border": divider,
            "--shadow-soft": mode === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(2, 6, 23, 0.55)",
            "--shadow-lift": mode === "light" ? "rgba(15, 23, 42, 0.16)" : "rgba(2, 6, 23, 0.7)",
            "--app-bg-0": mode === "light" ? "#f6f9fc" : "#08101d",
            "--app-bg-1": mode === "light" ? "#eef4fb" : "#0d1728",
            "--app-bg-2": mode === "light" ? "#f7fafd" : "#09111f",
            "--app-grid": mode === "light" ? "rgba(15, 23, 42, 0.035)" : "rgba(157, 176, 202, 0.07)",
            "--hero-gradient": heroBackground
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            backgroundImage: "none",
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
          },
          outlined: {
            borderColor: alpha(primaryMain, mode === "light" ? 0.22 : 0.35)
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: mode === "light" ? alpha("#ffffff", 0.92) : alpha("#0b1220", 0.7)
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: paper
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${divider}`,
            backgroundImage: "none",
            backdropFilter: "blur(12px)",
            backgroundColor: alpha(paper, mode === "light" ? 0.96 : 0.92)
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
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${alpha(divider, 0.9)}`
          }
        }
      }
    }
  });
}

export const appTheme = createAppTheme({ preset: defaultThemePreset, mode: defaultThemeMode });
