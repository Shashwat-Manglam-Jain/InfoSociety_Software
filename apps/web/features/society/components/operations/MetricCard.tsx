"use client";

import React from "react";
import { Chip, Paper, Stack, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type MetricCardProps = {
  label: string;
  value: string;
  caption: string;
  trend?: { value: string; positive: boolean };
};

export function MetricCard({ label, value, caption, trend }: MetricCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4.5,
        border: `1px solid ${surfaces.border}`,
        height: "100%",
        bgcolor: surfaces.paper,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDark ? "0 12px 24px -10px rgba(0, 0, 0, 0.4)" : "0 12px 24px -10px rgba(15, 23, 42, 0.12)"
        }
      }}
    >
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="baseline">
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.04em", color: isDark ? "#fff" : "#0f172a" }}>
            {value}
          </Typography>
          {trend && (
            <Chip 
              label={trend.value} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: "0.65rem", 
                fontWeight: 900, 
                bgcolor: trend.positive ? alpha(DESIGN_SYSTEM.COLORS.emerald, 0.1) : alpha(DESIGN_SYSTEM.COLORS.rose, 0.1),
                color: trend.positive ? DESIGN_SYSTEM.COLORS.emerald : DESIGN_SYSTEM.COLORS.rose,
                border: "none"
              }} 
            />
          )}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, lineHeight: 1.3 }}>
          {caption}
        </Typography>
      </Stack>
    </Paper>
  );
}
