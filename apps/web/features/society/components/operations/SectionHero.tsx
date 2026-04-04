"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { DESIGN_SYSTEM, DesignColorScheme } from "@/shared/theme/design-system";

export type SectionHeroProps = {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  colorScheme?: DesignColorScheme;
};

export function SectionHero({
  icon,
  eyebrow,
  title,
  description,
  actions,
  colorScheme = "blue"
}: SectionHeroProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const gradients = isDark ? DESIGN_SYSTEM.GRADIENTS.DARK : DESIGN_SYSTEM.GRADIENTS.LIGHT;
  const accentColor = DESIGN_SYSTEM.COLORS[colorScheme];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.25 },
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        background: gradients[colorScheme],
        color: "#fff",
        boxShadow: isDark ? "none" : "0 8px 32px -12px rgba(15, 23, 42, 0.25)",
        mb: 2.5,
        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.12)"}`
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

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between" alignItems={{ lg: "center" }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 900, color: "rgba(255,255,255,0.65)", mb: 0, display: "block", lineHeight: 1.1, fontSize: '0.65rem' }}>
              {eyebrow}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, mb: 0.5, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>
              {title}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.68)", maxWidth: { xs: "100%", lg: 640 }, fontSize: "0.85rem", lineHeight: 1.45, fontWeight: 500 }}>
              {description}
            </Typography>
          </Box>
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
