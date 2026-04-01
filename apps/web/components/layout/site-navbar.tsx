"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getDefaultDashboardPath, getSession, subscribeToSession } from "@/shared/auth/session";
import { appBranding } from "@/shared/config/branding";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { Session } from "@/shared/types";
import type { TranslationKey } from "@/shared/i18n/translations";

type NavLink = {
  href: string;
  labelKey: TranslationKey;
};

const navLinks: NavLink[] = [
  { href: "/", labelKey: "nav.societies" },
  { href: "/#plans", labelKey: "nav.plans" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contact", labelKey: "nav.contact" }
];


const workspaceRoutePrefixes = ["/dashboard", "/modules", "/admin"];

function isWorkspaceRoute(pathname: string) {
  return workspaceRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isActiveNav(pathname: string, href: string) {
  // Hash links map to home sections, so active state should follow the home route.
  if (href.includes("#")) {
    return pathname === "/";
  }

  return pathname === href;
}

export function SiteNavbar() {
  const pathname = usePathname() ?? "/";
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const hideNavbar = isWorkspaceRoute(pathname);

  useEffect(() => {
    const syncSession = () => {
      setSessionState(getSession());
    };

    syncSession();
    setMobileOpen(false);

    return subscribeToSession(syncSession);
  }, []);

  const authActions = useMemo(() => {
    if (session) {
      return [{ href: getDefaultDashboardPath(session.accountType), labelKey: "nav.dashboard" as const }];
    }

    return [{ href: "/login", labelKey: "nav.login" as const }];
  }, [session]);

  if (hideNavbar) {
    return null;
  }


  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.94),
        backdropFilter: "blur(8px)",
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        color: "text.primary",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "2px",
          background: (theme) =>
            `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0)} 0%, ${alpha(theme.palette.secondary.main, 0.5)} 50%, ${alpha(theme.palette.secondary.main, 0)} 100%)`
        }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72 }}>
          <Stack component={Link} href="/" direction="row" spacing={1} alignItems="center" sx={{ mr: 2, pr: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: (theme) =>
                  `linear-gradient(145deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.secondary.dark, 0.28)}`
              }}
            >
              <SavingsRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.05, fontWeight: 700 }}>
                {appBranding.productShortName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {appBranding.productCaption}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.7} sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => {
              const isActive = isActiveNav(pathname, link.href);

              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  color={isActive ? "secondary" : "inherit"}
                  sx={{
                    px: 1.5,
                    borderRadius: "8px",
                    border: (theme) => (isActive ? `1px solid ${alpha(theme.palette.secondary.main, 0.35)}` : "1px solid transparent"),
                    background: (theme) =>
                      isActive
                        ? `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.22)} 100%)`
                        : "transparent"
                  }}
                >
                  {t(link.labelKey)}
                </Button>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}>
            <SettingsMenu />

            {authActions.map((action) => (
              <Button
                key={action.href}
                component={Link}
                href={action.href}
                variant="outlined"
                color="secondary"
                sx={{ minWidth: 110, borderColor: "rgba(196, 49, 60, 0.75)", color: "rgba(196,49,60,0.95)" }}
              >
                {t(action.labelKey)}
              </Button>
            ))}

            {!session ? (
              <Button
                component={Link}
                href="/register"
                variant="contained"
                color="secondary"
                sx={{ minWidth: 140 }}
              >
                {t("nav.register")}
              </Button>
            ) : null}
          </Stack>

          <IconButton
            edge="end"
            aria-label="open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{ ml: "auto", display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": {
            backgroundColor: "background.paper",
            borderLeft: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`
          }
        }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Navigation
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={0.5}>
            {navLinks.map((link) => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                sx={{ justifyContent: "flex-start" }}
                color={isActiveNav(pathname, link.href) ? "secondary" : "inherit"}
                variant={isActiveNav(pathname, link.href) ? "contained" : "text"}
                onClick={() => setMobileOpen(false)}
              >
                {t(link.labelKey)}
              </Button>
            ))}
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={0.5}>
            <SettingsMenu variant="button" fullWidth />
            {authActions.map((action) => (
              <Button
                key={action.href}
                component={Link}
                href={action.href}
                variant="outlined"
                color="primary"
                sx={{ justifyContent: "flex-start" }}
                onClick={() => setMobileOpen(false)}
              >
                {t(action.labelKey)}
              </Button>
            ))}

            {!session ? (
              <>
                <Divider sx={{ my: 1 }} />
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  color="secondary"
                  sx={{ justifyContent: "flex-start", mt: 1 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.register")}
                </Button>
              </>
            ) : null}
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
}
