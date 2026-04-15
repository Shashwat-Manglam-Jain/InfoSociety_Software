import { alpha, createTheme, darken, lighten } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import type { AppLocale } from "@/shared/i18n/translations";

export type AppThemePreset = "executive" | "verdant" | "graphite";

type ThemePresetDefinition = {
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  lightHero: [string, string, string];
  darkHero: [string, string, string];
  lightSurface: [string, string, string];
  darkSurface: [string, string, string];
};

export const themePresets: Record<AppThemePreset, ThemePresetDefinition> = {
  executive: {
    label: "Executive Blue",
    primary: "#1447e6",
    secondary: "#0f766e",
    accent: "#f59e0b",
    lightHero: ["#0f2f78", "#1447e6", "#0f766e"],
    darkHero: ["#081a44", "#10358a", "#0d5c57"],
    lightSurface: ["#f8fbff", "#eef5ff", "#f0fdfa"],
    darkSurface: ["#081120", "#0c172a", "#0d1d22"]
  },
  verdant: {
    label: "Verdant Teal",
    primary: "#0f766e",
    secondary: "#2563eb",
    accent: "#fb7185",
    lightHero: ["#0b3f3c", "#0f766e", "#2563eb"],
    darkHero: ["#062b29", "#0a5450", "#1d4ed8"],
    lightSurface: ["#f5fffd", "#ecfdf5", "#eff6ff"],
    darkSurface: ["#071615", "#0b1d1c", "#0b1628"]
  },
  graphite: {
    label: "Graphite Copper",
    primary: "#334155",
    secondary: "#c2410c",
    accent: "#0ea5e9",
    lightHero: ["#172554", "#334155", "#c2410c"],
    darkHero: ["#0f172a", "#1e293b", "#9a3412"],
    lightSurface: ["#f8fafc", "#f1f5f9", "#fff7ed"],
    darkSurface: ["#0b1020", "#141c2f", "#24160f"]
  }
};

export const defaultThemePreset: AppThemePreset = "executive";
export const defaultThemeMode: PaletteMode = "light";

type AppThemeOptions = {
  preset: AppThemePreset;
  mode: PaletteMode;
  locale: AppLocale;
};

type TypographyProfile = {
  headingFontFamily: string;
  bodyFontFamily: string;
  bodyScale: number;
  headingScale: number;
  sectionLetterSpacing: string;
  headingLetterSpacing: string;
  bodyLineHeight: number;
  headingLineHeight: number;
  buttonLetterSpacing: string;
  overlineLetterSpacing: string;
};

function formatRem(value: number) {
  return `${value.toFixed(3).replace(/\.?0+$/, "")}rem`;
}

function getTypographyProfile(preset: AppThemePreset, locale: AppLocale): TypographyProfile {
  const devanagari =
    '"Nirmala UI", "Noto Sans Devanagari", "Mangal", "Kohinoor Devanagari", sans-serif';

  if (locale === "hi" || locale === "mr") {
    const presetScale =
      preset === "verdant" ? 1.02 : preset === "graphite" ? 0.99 : 1;

    return {
      headingFontFamily: devanagari,
      bodyFontFamily: devanagari,
      bodyScale: 1.01 * presetScale,
      headingScale: 0.95 * presetScale,
      sectionLetterSpacing: "0",
      headingLetterSpacing: "0",
      bodyLineHeight: 1.68,
      headingLineHeight: 1.2,
      buttonLetterSpacing: "0",
      overlineLetterSpacing: "0.06em"
    };
  }

  if (preset === "verdant") {
    return {
      headingFontFamily: '"Segoe UI Variable Display", "Segoe UI", "Arial", sans-serif',
      bodyFontFamily: '"Segoe UI Variable Text", "Segoe UI", "Tahoma", sans-serif',
      bodyScale: 0.99,
      headingScale: 0.97,
      sectionLetterSpacing: "-0.014em",
      headingLetterSpacing: "-0.014em",
      bodyLineHeight: 1.58,
      headingLineHeight: 1.1,
      buttonLetterSpacing: "0.012em",
      overlineLetterSpacing: "0.14em"
    };
  }

  if (preset === "graphite") {
    return {
      headingFontFamily: '"Bahnschrift", "Segoe UI Semibold", "Segoe UI", sans-serif',
      bodyFontFamily: '"Segoe UI Variable Text", "Segoe UI", "Tahoma", sans-serif',
      bodyScale: 0.985,
      headingScale: 0.955,
      sectionLetterSpacing: "-0.01em",
      headingLetterSpacing: "-0.012em",
      bodyLineHeight: 1.56,
      headingLineHeight: 1.1,
      buttonLetterSpacing: "0.014em",
      overlineLetterSpacing: "0.16em"
    };
  }

  return {
    headingFontFamily: '"Segoe UI Variable Display", "Segoe UI", "Arial", sans-serif',
    bodyFontFamily: '"Segoe UI Variable Text", "Segoe UI", "Tahoma", sans-serif',
    bodyScale: 0.99,
    headingScale: 0.965,
    sectionLetterSpacing: "-0.015em",
    headingLetterSpacing: "-0.015em",
    bodyLineHeight: 1.58,
    headingLineHeight: 1.1,
    buttonLetterSpacing: "0.012em",
    overlineLetterSpacing: "0.14em"
  };
}

export function createAppTheme({ preset, mode, locale }: AppThemeOptions) {
  const paletteTokens = themePresets[preset];
  const typographyProfile = getTypographyProfile(preset, locale);
  const primaryMain = paletteTokens.primary;
  const secondaryMain = paletteTokens.secondary;
  const accentMain = paletteTokens.accent;

  const primaryLight = lighten(primaryMain, mode === "light" ? 0.28 : 0.18);
  const primaryDark = darken(primaryMain, mode === "light" ? 0.22 : 0.38);
  const secondaryLight = lighten(secondaryMain, mode === "light" ? 0.22 : 0.14);
  const secondaryDark = darken(secondaryMain, mode === "light" ? 0.18 : 0.36);

  const [heroStart, heroMid, heroEnd] = mode === "light" ? paletteTokens.lightHero : paletteTokens.darkHero;
  const [surfaceStart, surfaceMid, surfaceEnd] = mode === "light" ? paletteTokens.lightSurface : paletteTokens.darkSurface;
  const paper = mode === "light" ? alpha("#ffffff", 0.9) : alpha("#0f172a", 0.88);
  const elevatedPaper = mode === "light" ? "#f8fbff" : "#162235";
  const defaultBg = mode === "light" ? "#f3f7fc" : "#07111d";
  const textPrimary = mode === "light" ? "#132238" : "#e8f0fb";
  const textSecondary = mode === "light" ? "#5c6d84" : "#9eb0c8";
  const divider = mode === "light" ? "#d7e2ee" : alpha("#9db0ca", 0.2);
  const successMain = mode === "light" ? "#1f9d63" : "#34d399";
  const warningMain = mode === "light" ? "#c77800" : "#fbbf24";
  const errorMain = mode === "light" ? "#d14343" : "#f87171";
  const infoMain = mode === "light" ? accentMain : lighten(accentMain, 0.1);
  const actionHover = alpha(primaryMain, mode === "light" ? 0.05 : 0.14);
  const actionSelected = alpha(primaryMain, mode === "light" ? 0.1 : 0.2);
  const actionFocus = alpha(primaryMain, mode === "light" ? 0.14 : 0.28);
  const heroBackground = `linear-gradient(135deg, ${heroStart} 0%, ${heroMid} 52%, ${heroEnd} 100%)`;
  const pageBackground = `radial-gradient(circle at top left, ${alpha(primaryLight, mode === "light" ? 0.24 : 0.2)} 0%, transparent 34%),
    radial-gradient(circle at top right, ${alpha(secondaryLight, mode === "light" ? 0.18 : 0.16)} 0%, transparent 30%),
    linear-gradient(180deg, ${surfaceStart} 0%, ${surfaceMid} 48%, ${surfaceEnd} 100%)`;
  const sectionBackground = `linear-gradient(180deg, ${alpha(primaryLight, mode === "light" ? 0.08 : 0.14)} 0%, ${alpha(secondaryLight, mode === "light" ? 0.08 : 0.12)} 100%)`;
  const cardGradient = `linear-gradient(180deg, ${alpha("#ffffff", mode === "light" ? 0.88 : 0.04)} 0%, ${alpha(surfaceMid, mode === "light" ? 0.95 : 0.84)} 100%)`;
  const vibrantSurface = `radial-gradient(120% 120% at 0% 0%, ${alpha(primaryMain, mode === "light" ? 0.14 : 0.2)} 0%, transparent 55%),
    radial-gradient(120% 120% at 100% 10%, ${alpha(accentMain, mode === "light" ? 0.12 : 0.18)} 0%, transparent 50%),
    linear-gradient(160deg, ${alpha("#ffffff", mode === "light" ? 0.92 : 0.03)} 0%, ${alpha(surfaceMid, mode === "light" ? 0.96 : 0.82)} 100%)`;

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
      borderRadius: 8
    },
    typography: {
      htmlFontSize: 16,
      fontFamily: `var(--font-body, ${typographyProfile.bodyFontFamily})`,
      h1: {
        fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
        fontSize: formatRem(3.5 * typographyProfile.headingScale),
        fontWeight: 700,
        lineHeight: typographyProfile.headingLineHeight,
        letterSpacing: typographyProfile.headingLetterSpacing
      },
      h2: {
        fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
        fontSize: formatRem(2.85 * typographyProfile.headingScale),
        fontWeight: 700,
        lineHeight: typographyProfile.headingLineHeight,
        letterSpacing: typographyProfile.headingLetterSpacing
      },
      h3: {
        fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
        fontSize: formatRem(2.25 * typographyProfile.headingScale),
        fontWeight: 650,
        lineHeight: typographyProfile.headingLineHeight,
        letterSpacing: typographyProfile.headingLetterSpacing
      },
      h4: {
        fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
        fontSize: formatRem(1.8 * typographyProfile.headingScale),
        fontWeight: 650,
        lineHeight: typographyProfile.headingLineHeight + 0.02,
        letterSpacing: typographyProfile.headingLetterSpacing
      },
      h5: {
        fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
        fontSize: formatRem(1.4 * typographyProfile.headingScale),
        fontWeight: 650,
        lineHeight: typographyProfile.headingLineHeight + 0.05,
        letterSpacing: typographyProfile.headingLetterSpacing
      },
      h6: {
        fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
        fontSize: formatRem(1.18 * typographyProfile.headingScale),
        fontWeight: 650,
        lineHeight: typographyProfile.headingLineHeight + 0.08,
        letterSpacing: typographyProfile.headingLetterSpacing
      },
      subtitle1: {
        fontSize: formatRem(1.05 * typographyProfile.bodyScale),
        lineHeight: typographyProfile.bodyLineHeight
      },
      subtitle2: {
        fontSize: formatRem(0.95 * typographyProfile.bodyScale),
        lineHeight: typographyProfile.bodyLineHeight
      },
      body1: {
        fontSize: formatRem(1 * typographyProfile.bodyScale),
        lineHeight: typographyProfile.bodyLineHeight
      },
      body2: {
        fontSize: formatRem(0.92 * typographyProfile.bodyScale),
        lineHeight: typographyProfile.bodyLineHeight
      },
      button: {
        fontSize: formatRem(0.94 * typographyProfile.bodyScale),
        lineHeight: 1.2,
        letterSpacing: typographyProfile.buttonLetterSpacing
      },
      caption: {
        fontSize: formatRem(0.8 * typographyProfile.bodyScale),
        lineHeight: 1.45
      },
      overline: {
        fontSize: formatRem(0.76 * typographyProfile.bodyScale),
        lineHeight: 1.5,
        letterSpacing: typographyProfile.overlineLetterSpacing
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            "--brand-800": primaryDark,
            "--brand-700": primaryMain,
            "--brand-500": primaryLight,
            "--secondary-500": secondaryMain,
            "--secondary-600": secondaryDark,
            "--ink-900": textPrimary,
            "--ink-700": textSecondary,
            "--surface-0": defaultBg,
            "--surface-1": paper,
            "--surface-2": elevatedPaper,
            "--surface-border": divider,
            "--shadow-soft": mode === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(2, 6, 23, 0.55)",
            "--shadow-lift": mode === "light" ? "rgba(15, 23, 42, 0.16)" : "rgba(2, 6, 23, 0.7)",
            "--app-bg-0": surfaceStart,
            "--app-bg-1": surfaceMid,
            "--app-bg-2": surfaceEnd,
            "--app-grid": mode === "light" ? "rgba(15, 23, 42, 0.035)" : "rgba(157, 176, 202, 0.07)",
            "--font-heading": typographyProfile.headingFontFamily,
            "--font-body": typographyProfile.bodyFontFamily,
            "--font-scale-body": String(typographyProfile.bodyScale),
            "--font-scale-heading": String(typographyProfile.headingScale),
            "--font-tracking-display": typographyProfile.sectionLetterSpacing,
            "--hero-gradient": heroBackground,
            "--page-gradient": pageBackground,
            "--section-gradient": sectionBackground,
            "--card-gradient": cardGradient,
            "--vibrant-gradient": vibrantSurface,
            "--accent-400": lighten(accentMain, mode === "light" ? 0.12 : 0.02),
            "--accent-500": accentMain,
            "--accent-600": darken(accentMain, mode === "light" ? 0.08 : 0.18)
          },
          "html, body": {
            fontFamily: `var(--font-body, ${typographyProfile.bodyFontFamily})`,
            fontSize: formatRem(1 * typographyProfile.bodyScale)
          },
          "h1, h2, h3, h4, h5, h6, .section-title": {
            fontFamily: `var(--font-heading, ${typographyProfile.headingFontFamily})`,
            letterSpacing: "var(--font-tracking-display)"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            backgroundImage: cardGradient,
            backdropFilter: "blur(16px)",
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
            borderRadius: 8,
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
            borderRadius: 8,
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
            backgroundImage: cardGradient,
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
            borderRadius: 8,
            border: `1px solid ${alpha(divider, 0.9)}`
          }
        }
      }
    }
  });
}

export const appTheme = createAppTheme({ preset: defaultThemePreset, mode: defaultThemeMode, locale: "en" });
