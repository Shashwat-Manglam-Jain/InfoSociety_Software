"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import type { DesignColorScheme } from "@/shared/theme/design-system";

export type SectionHeroProps = {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  colorScheme?: DesignColorScheme;
  borderRadius?: number | string;
};

export function SectionHero({
  icon,
  eyebrow,
  title,
  description,
  actions,
  colorScheme = "blue",
  borderRadius = 1
}: SectionHeroProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const schemePalettes: Record<DesignColorScheme, { start: string; mid: string; end: string; accent: string }> = {
    blue: {
      start: isDark ? theme.palette.primary.dark : alpha(theme.palette.primary.dark, 0.96),
      mid: theme.palette.primary.main,
      end: theme.palette.secondary.main,
      accent: theme.palette.info.light
    },
    emerald: {
      start: isDark ? "#064e3b" : "#065f46",
      mid: theme.palette.success.main,
      end: theme.palette.primary.main,
      accent: theme.palette.success.light
    },
    violet: {
      start: isDark ? "#3b0764" : "#581c87",
      mid: theme.palette.secondary.dark,
      end: theme.palette.secondary.main,
      accent: theme.palette.secondary.light
    },
    rose: {
      start: isDark ? "#4c0519" : "#881337",
      mid: theme.palette.error.dark,
      end: theme.palette.error.main,
      accent: theme.palette.error.light
    },
    amber: {
      start: isDark ? "#451a03" : "#78350f",
      mid: theme.palette.warning.dark,
      end: theme.palette.warning.main,
      accent: theme.palette.warning.light
    },
    sky: {
      start: isDark ? "#082f49" : "#0c4a6e",
      mid: theme.palette.info.dark,
      end: theme.palette.info.main,
      accent: theme.palette.info.light
    }
  };
  const palette = schemePalettes[colorScheme];
  const heroGradient = `linear-gradient(135deg, ${palette.start} 0%, ${palette.mid} 55%, ${palette.end} 100%)`;
  const accentColor = palette.accent;
  const overlineSx = {
    letterSpacing: "0.14em",
    fontWeight: 900,
    color: "rgba(255,255,255,0.68)",
    display: "block",
    lineHeight: 1.2,
    fontSize: { xs: "0.68rem", md: "0.74rem" }
  } as const;
  const titleSx = {
    fontFamily: "var(--font-heading)",
    fontWeight: 900,
    letterSpacing: "-0.025em",
    lineHeight: 1.12,
    fontSize: { xs: "1.35rem", md: "1.7rem" }
  } as const;
  const descriptionSx = {
    color: "rgba(255,255,255,0.78)",
    maxWidth: { xs: "100%", lg: 640 },
    fontFamily: "var(--font-body)",
    fontSize: { xs: "0.92rem", md: "1rem" },
    lineHeight: 1.65,
    fontWeight: 500
  } as const;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.25 },
        borderRadius: borderRadius,
        position: "relative",
        overflow: "hidden",
        background: heroGradient,
        color: "#fff",
        boxShadow: isDark ? "none" : "0 8px 32px -12px rgba(15, 23, 42, 0.25)",
        mb: 2.5,
        border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.white, 0.12)}`
      }}
    >
      <Box 
        sx={{ 
          position: "absolute", 
          right: -40, 
          top: -40, 
          width: 200, 
          height: 200, 
          borderRadius: "50%", 
          background: `radial-gradient(circle, ${alpha(accentColor, 0.12)} 0%, rgba(255, 255, 255, 0) 70%)`,
          filter: "blur(30px)",
          pointerEvents: "none"
        }} 
      />

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between" alignItems={{ lg: "center" }}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              "& svg": { fontSize: "1.45rem", color: accentColor },
              boxShadow: "inset 0 0 12px rgba(255,255,255,0.05)"
            }}
          >
            {icon}
          </Box>
          <Stack spacing={0.55} sx={{ py: 0.25 }}>
            <Typography
              variant="overline"
              sx={overlineSx}
            >
              {eyebrow}
            </Typography>
            <Typography variant="h6" sx={titleSx}>
              {title}
            </Typography>
            <Typography sx={descriptionSx}>
              {description}
            </Typography>
          </Stack>
        </Stack>
        {actions && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ alignItems: "center", width: { xs: "100%", lg: "auto" } }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
