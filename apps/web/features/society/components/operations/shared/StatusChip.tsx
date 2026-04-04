"use client";

import React from "react";
import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

export type StatusTone = "success" | "warning" | "error" | "info" | "default";

export type StatusChipProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusChip({ label, tone = "default" }: StatusChipProps) {
  const colors = {
    success: { bg: alpha("#10b981", 0.12), color: "#059669" },
    warning: { bg: alpha("#f59e0b", 0.12), color: "#b45309" },
    error: { bg: alpha("#ef4444", 0.12), color: "#dc2626" },
    info: { bg: alpha("#3b82f6", 0.12), color: "#2563eb" },
    default: { bg: "#eef2ff", color: "#475569" }
  }[tone];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 800,
        bgcolor: colors.bg,
        color: colors.color,
        borderRadius: 1.5,
        border: "none",
        height: 22,
        fontSize: "0.7rem"
      }}
    />
  );
}
