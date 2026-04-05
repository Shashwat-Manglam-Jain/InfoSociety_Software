"use client";

import { useMemo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  getAccessibleModules,
  getRequiredModuleSlugs,
  sanitizeAllowedModuleSlugs
} from "@/features/banking/account-access";
import { modules } from "@/features/banking/module-registry";
import type { AppAccountType } from "@/shared/types";

type UserAccessSelectorProps = {
  accountType: Extract<AppAccountType, "AGENT" | "CLIENT" | "SOCIETY">;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  title?: string;
  helperText?: string;
};

export function UserAccessSelector({
  accountType,
  value,
  onChange,
  disabled = false,
  title = "MODULE ACCESS",
  helperText = "Select the workspaces this user can open after login."
}: UserAccessSelectorProps) {
  const selected = useMemo(() => sanitizeAllowedModuleSlugs(accountType, value), [accountType, value]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const requiredSet = useMemo(() => new Set(getRequiredModuleSlugs(accountType)), [accountType]);
  const options = useMemo(() => getAccessibleModules(modules, accountType), [accountType]);

  function toggle(slug: string) {
    if (disabled) {
      return;
    }

    const next = new Set<string>(selectedSet);

    if (next.has(slug)) {
      if (requiredSet.has(slug)) {
        return;
      }

      if (next.size === 1) {
        return;
      }
      next.delete(slug);
    } else {
      next.add(slug);
    }

    onChange(Array.from(next));
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        bgcolor: "#f8fafc"
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: "0.08em" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary" }}>
        {helperText}
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
        {options.map((module) => {
          const active = selectedSet.has(module.slug);
          const required = requiredSet.has(module.slug);

          return (
            <Chip
              key={module.slug}
              label={required ? `${module.name} (required)` : module.name}
              clickable={!disabled && !required}
              onClick={() => toggle(module.slug)}
              variant={active ? "filled" : "outlined"}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                bgcolor: active ? alpha("#2563eb", 0.12) : "#fff",
                color: active ? "#1d4ed8" : "#475569",
                borderColor: active ? alpha("#2563eb", 0.3) : "rgba(148, 163, 184, 0.35)",
                "&:hover": {
                  bgcolor: active ? alpha("#2563eb", 0.16) : "#eef2ff"
                },
                opacity: disabled ? 0.72 : 1,
                cursor: disabled || required ? "default" : "pointer"
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
