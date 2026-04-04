"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { AppBar, Avatar, Box, Button, Chip, Collapse, Divider, Drawer, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { appBranding } from "@/shared/config/branding";
import type { AuthUser } from "@/shared/types";

interface DashboardShellProps {
  children: ReactNode;
  user?: AuthUser | null;
  accountTypeLabel?: string;
  avatarDataUrl?: string | null;
  onLogout?: () => void;
  t?: (key: string, options?: any) => string;
  accessibleModules?: any[];
}

function createExpandedGroupsState(accessibleModules: any[]) {
  const initial: Record<number, boolean> = {};

  accessibleModules.forEach((_, index) => {
    initial[index] = true;
  });

  return initial;
}

export function DashboardShell({
  children,
  user = null,
  accountTypeLabel = "Workspace",
  avatarDataUrl = null,
  onLogout = () => undefined,
  t = (key: string) => key,
  accessibleModules = []
}: DashboardShellProps) {
  const router = useRouter();

  const normalizedAccessibleModules = useMemo(() => {
    if (!Array.isArray(accessibleModules) || accessibleModules.length === 0) {
      return [];
    }

    const directItems: any[] = [];
    const groups: any[] = [];

    accessibleModules.forEach((entry) => {
      if (!entry) {
        return;
      }

      if (Array.isArray(entry.items)) {
        groups.push({
          ...entry,
          items: entry.items.filter(Boolean)
        });
        return;
      }

      directItems.push(entry);
    });

    if (directItems.length > 0) {
      groups.unshift({ items: directItems });
    }

    return groups.filter((group) => Array.isArray(group.items) && group.items.length > 0);
  }, [accessibleModules]);

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(() =>
    createExpandedGroupsState(normalizedAccessibleModules)
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleGroup = (idx: number) => {
    setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    setExpandedGroups((previous) => {
      const next = createExpandedGroupsState(normalizedAccessibleModules);

      Object.entries(previous).forEach(([index, isExpanded]) => {
        if (isExpanded === false && Number(index) in next) {
          next[Number(index)] = false;
        }
      });

      return next;
    });
  }, [normalizedAccessibleModules]);

  useEffect(() => {
    normalizedAccessibleModules
      .flatMap((group: any) => group.items ?? [])
      .map((item: any) => item.href)
      .filter((href: unknown): href is string => typeof href === "string" && href.startsWith("/"))
      .forEach((href) => {
        router.prefetch(href);
      });
  }, [normalizedAccessibleModules, router]);

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={avatarDataUrl ?? undefined}
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: "1.1rem",
              fontWeight: 800,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            {user?.society?.name?.[0] ?? user?.fullName?.[0] ?? "A"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.95rem",
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em"
              }}
            >
              {user?.society?.name ?? user?.fullName ?? "Platform"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mt: 0.2
              }}
            >
              {accountTypeLabel}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, py: 2 }}>
        {normalizedAccessibleModules.map((group: any, gIdx: number) => {
          if (!group.heading) {
            return (
              <Stack key={gIdx} spacing={0.5} sx={{ px: 1.5, mb: 2 }}>
                {group.items.map((item: any, idx: number) => (
                  <Button
                    key={idx}
                    component={Link}
                    href={item.href || "/dashboard"}
                    prefetch
                    fullWidth
                    startIcon={item.icon}
                    onClick={closeMobileSidebar}
                    sx={{
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1.25,
                      borderRadius: "12px",
                      color: item.active ? "primary.main" : "text.secondary",
                      bgcolor: item.active ? (theme) => alpha(theme.palette.primary.main, 0.08) : "transparent",
                      textTransform: "none",
                      fontSize: "0.875rem",
                      fontWeight: item.active ? 700 : 500,
                      position: "relative",
                      "&::before": item.active
                        ? {
                            content: '""',
                            position: "absolute",
                            left: -12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: "60%",
                            width: "4px",
                            borderRadius: "0 4px 4px 0",
                            bgcolor: "primary.main"
                          }
                        : {},
                      "& .MuiButton-startIcon": {
                        mr: 2,
                        color: item.active ? "primary.main" : "text.secondary",
                        "& svg": { fontSize: "1.3rem" }
                      },
                      "&:hover": {
                        bgcolor: item.active ? (theme) => alpha(theme.palette.primary.main, 0.12) : "action.hover",
                        color: item.active ? "primary.main" : "text.primary"
                      }
                    }}
                  >
                    <Box sx={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label || item.name}
                    </Box>
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{ ml: 1, height: 18, fontSize: "0.6rem", fontWeight: 1000, bgcolor: "action.hover", color: "text.secondary" }}
                      />
                    )}
                  </Button>
                ))}
              </Stack>
            );
          }

          return (
            <Box key={gIdx} sx={{ mb: 1.5 }}>
              <Box
                onClick={() => toggleGroup(gIdx)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  mb: 0.5,
                  "&:hover .heading-text": { color: "text.primary" }
                }}
              >
                <Typography
                  className="heading-text"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    transition: "color 0.2s"
                  }}
                >
                  {group.heading}
                </Typography>
                {expandedGroups[gIdx] !== false ? (
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "text.secondary", opacity: 0.5 }} />
                ) : (
                  <KeyboardArrowRightRoundedIcon sx={{ fontSize: 16, color: "text.secondary", opacity: 0.5 }} />
                )}
              </Box>

              <Collapse in={expandedGroups[gIdx] !== false}>
                <Stack spacing={0.5} sx={{ px: 1 }}>
                  {group.items.map((item: any, idx: number) => (
                    <Button
                      key={idx}
                      component={Link}
                      href={item.href || "/dashboard"}
                      prefetch
                      fullWidth
                      startIcon={item.icon}
                      onClick={closeMobileSidebar}
                      sx={{
                        justifyContent: "flex-start",
                        px: 1.5,
                        pl: 2,
                        py: 1,
                        borderRadius: "10px",
                        color: item.active ? "primary.main" : "text.secondary",
                        bgcolor: item.active ? (theme) => alpha(theme.palette.primary.main, 0.06) : "transparent",
                        textTransform: "none",
                        fontSize: "0.875rem",
                        fontWeight: item.active ? 600 : 500,
                        transition: "all 0.2s ease",
                        "& .MuiButton-startIcon": {
                          mr: 1.5,
                          color: item.active ? "primary.main" : "text.secondary",
                          "& svg": { fontSize: "1.2rem" }
                        },
                        "&:hover": {
                          bgcolor: item.active ? (theme) => alpha(theme.palette.primary.main, 0.08) : "action.hover",
                          color: item.active ? "primary.main" : "text.primary"
                        }
                      }}
                    >
                      <Box sx={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.label || item.name}
                      </Box>
                      {item.badge && (
                        <Chip label={item.badge} size="small" sx={{ ml: 1, height: 18, fontSize: "0.6rem", fontWeight: 1000, bgcolor: "#f1f5f9", color: "#64748b" }} />
                      )}
                    </Button>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 2, borderTop: "1px solid #f1f5f9", bgcolor: "#fcfdfe" }}>
        <Button
          onClick={() => {
            closeMobileSidebar();
            onLogout();
          }}
          variant="text"
          fullWidth
          startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.2,
            borderRadius: "10px",
            fontWeight: 900,
            color: "#94a3b8",
            textTransform: "none",
            fontSize: "0.82rem",
            "&:hover": {
              color: "#ef4444",
              bgcolor: alpha("#ef4444", 0.05)
            }
          }}
        >
          Sign out
        </Button>
      </Box>
    </>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          color: "#fff",
          backdropFilter: "blur(24px)",
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.98)} 0%, ${alpha(theme.palette.primary.main, 1)} 50%, ${alpha(theme.palette.secondary.main, 0.98)} 100%)`,
          zIndex: (theme) => theme.zIndex.drawer - 1,
          boxShadow: `0 8px 32px rgba(15, 23, 42, 0.15)`
        }}
      >
        <Toolbar sx={{ minHeight: 64, gap: 2, flexWrap: "nowrap", py: 0, px: { xs: 1.5, md: 3 } }}>
          <IconButton
            size="small"
            onClick={() => setMobileSidebarOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)"
            }}
          >
            <MenuRoundedIcon fontSize="small" />
          </IconButton>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              <SavingsRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={900} lineHeight={1.1} noWrap sx={{ letterSpacing: "-0.01em", textTransform: "uppercase" }}>
                {appBranding.productShortName}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.65)", fontWeight: 800, fontSize: "0.62rem", letterSpacing: 0.5 }} noWrap>
                {accountTypeLabel.toUpperCase()} ENV
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            <SettingsMenu size="small" />
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.15)", my: 2 }} />
            <Stack direction="row" spacing={1.2} alignItems="center">
               <Avatar
                src={avatarDataUrl ?? undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontWeight: 900,
                  fontSize: "0.8rem"
                }}
              >
                {user?.fullName?.[0] ?? "U"}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" } }}>
                 <Typography variant="caption" sx={{ fontWeight: 900, display: "block", lineHeight: 1 }}>{user?.fullName?.split(" ")[0]}</Typography>
                 <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: "0.65rem" }}>EXECUTIVE</Typography>
              </Box>
            </Stack>
            <IconButton 
              size="small"
              onClick={onLogout}
              sx={{ 
                color: "#fff", 
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "#ef4444", color: "#fff" }
              }}
            >
              <LogoutIcon fontSize="inherit" />
            </IconButton>
          </Stack>

          <IconButton
            size="small"
            onClick={onLogout}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": { bgcolor: "#ef4444", color: "#fff" }
            }}
          >
            <LogoutIcon fontSize="inherit" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        open={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        PaperProps={{
          sx: {
            width: 300,
            display: { xs: "flex", md: "none" },
            borderRight: (theme) => `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column", bgcolor: "background.paper" }}>
          {sidebarContent}
        </Box>
      </Drawer>

      <Box sx={{ 
        display: "flex", 
        height: "100vh", 
        overflow: "hidden", 
        pt: "64px" 
      }}>
        {/* VS Code Style Collapsible Left Sidebar */}
        <Box
          sx={{
            width: { xs: 0, md: 280 },
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) => theme.palette.background.paper,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "3px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1), borderRadius: "10px" }
          }}
        >
          {sidebarContent}
        </Box>

        {/* Independently Scrollable Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "100%",
            overflowY: "auto",
            bgcolor: "#fcfdfe",
            pt: { xs: 4, md: 5 },
            pb: 4,
            px: { xs: 2.5, md: 6 },
            position: "relative",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(15, 23, 42, 0.08)", borderRadius: "10px" }
          }}
        >
          <Box sx={{ maxWidth: 1600, mx: "auto" }}>
             {children}
             <Box sx={{ mt: 10 }}>
               <WorkspaceFooter />
             </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
