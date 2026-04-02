"use client";

import { MouseEvent, useState } from "react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import {
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useLanguage } from "@/shared/i18n/language-provider";
import { useAppTheme } from "@/shared/theme/app-theme-provider";
import type { AppThemePreset } from "@/shared/theme/theme";

export type SettingsMenuVariant = "icon" | "button";

type SettingsMenuProps = {
  variant?: SettingsMenuVariant;
  label?: string;
  size?: "small" | "medium";
  fullWidth?: boolean;
};

export function SettingsMenu({ variant = "icon", label, size = "small", fullWidth }: SettingsMenuProps) {
  const { preset, presets, mode, setPreset, toggleMode } = useAppTheme();
  const { locale, localeOptions, setLocale, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const triggerLabel = label ?? `${t("settings.theme")} · ${t("settings.language")}`;

  function onOpen(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function onClose() {
    setAnchorEl(null);
  }

  return (
    <>
      {variant === "button" ? (
        <Button
          variant="outlined"
          onClick={onOpen}
          startIcon={<PaletteOutlinedIcon />}
          fullWidth={fullWidth}
          sx={{ justifyContent: fullWidth ? "flex-start" : undefined }}
        >
          {triggerLabel}
        </Button>
      ) : (
        <Tooltip title={triggerLabel}>
          <IconButton
            aria-label="theme and language settings"
            onClick={onOpen}
            color="inherit"
            sx={{
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8)
            }}
            size={size}
          >
            <PaletteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.02em" }}>
            {t("settings.theme")}
          </Typography>
        </MenuItem>

        {Object.entries(presets).map(([key, value]) => (
          <MenuItem
            key={key}
            selected={preset === (key as AppThemePreset)}
            onClick={() => {
              setPreset(key as AppThemePreset);
              onClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: value.primary
                }}
              />
            </ListItemIcon>
            <ListItemText>{value.label}</ListItemText>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem
          onClick={() => {
            toggleMode();
            onClose();
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {mode === "dark" ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            <Typography variant="body2">{mode === "dark" ? t("settings.light_mode") : t("settings.dark_mode")}</Typography>
          </Stack>
        </MenuItem>

        <Divider />

        <MenuItem disabled>
          <Stack direction="row" spacing={1} alignItems="center">
            <TranslateOutlinedIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.02em" }}>
              {t("settings.language")}
            </Typography>
          </Stack>
        </MenuItem>

        {localeOptions.map((option) => (
          <MenuItem
            key={option.code}
            selected={locale === option.code}
            onClick={() => {
              setLocale(option.code);
              onClose();
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
