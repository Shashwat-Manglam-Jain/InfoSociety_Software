"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      return [
        {
          href: getDefaultDashboardPath(session.accountType, session.requiresPasswordChange, session.allowedModuleSlugs),
          labelKey: "nav.dashboard" as const
        }
      ];
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
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.78),
        backdropFilter: "blur(18px)",
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.72)}`,
        color: "text.primary",
        boxShadow: (theme) => `0 10px 40px ${alpha(theme.palette.common.black, theme.palette.mode === "light" ? 0.06 : 0.22)}`,
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
        <Toolbar disableGutters sx={{ minHeight: 76, gap: 2 }}>
          <Stack component={Link} href="/" direction="row" spacing={1.25} alignItems="center" sx={{ mr: 2, pr: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                background: (theme) =>
                  `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 52%, ${theme.palette.secondary.main} 100%)`,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                boxShadow: (theme) => `0 14px 24px ${alpha(theme.palette.primary.dark, 0.26)}`
              }}
            >
              <SavingsRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {appBranding.productShortName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {appBranding.productCaption}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            sx={{
              display: { xs: "none", md: "flex" },
              p: 0.75,
              borderRadius: 999,
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.68)
            }}
          >
            {navLinks.map((link) => {
              const isActive = isActiveNav(pathname, link.href);

              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  color={isActive ? "secondary" : "inherit"}
                  sx={{
                    px: 1.75,
                    borderRadius: "999px",
                    fontWeight: isActive ? 800 : 700,
                    color: isActive ? "text.primary" : "text.secondary",
                    border: (theme) => (isActive ? `1px solid ${alpha(theme.palette.primary.main, 0.18)}` : "1px solid transparent"),
                    background: (theme) =>
                      isActive
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`
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
                color="primary"
                sx={{
                  minWidth: 116,
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.26),
                  color: "text.primary",
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.52)
                }}
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
                sx={{
                  minWidth: 148,
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                }}
              >
                {t("nav.register")}
              </Button>
            ) : null}
          </Stack>

          <IconButton
            edge="end"
            aria-label="open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{
              ml: "auto",
              display: { xs: "inline-flex", md: "none" },
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.78)}`,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.72)
            }}
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
            backgroundImage: "var(--card-gradient)",
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
