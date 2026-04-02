"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import { AppBar, Avatar, Box, Button, Chip, Divider, IconButton, Stack, Toolbar, Typography, Tooltip, Collapse } from "@mui/material";
import { alpha } from "@mui/material/styles";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { appBranding } from "@/shared/config/branding";
import type { AuthUser } from "@/shared/types";

interface DashboardShellProps {
  children: ReactNode;
  user: AuthUser | null;
  accountTypeLabel: string;
  avatarDataUrl: string | null;
  onLogout: () => void;
  t: (key: string, options?: any) => string;
  accessibleModules?: any[];
}

export function DashboardShell({
  children,
  user,
  accountTypeLabel,
  avatarDataUrl,
  onLogout,
  t,
  accessibleModules = []
}: DashboardShellProps) {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(() => {
    // Expand all by default
    const initial: Record<number, boolean> = {};
    accessibleModules.forEach((_, i) => { initial[i] = true; });
    return initial;
  });

  const toggleGroup = (idx: number) => {
    setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    accessibleModules
      .flatMap((group: any) => group.items ?? [])
      .map((item: any) => item.href)
      .filter((href: unknown): href is string => typeof href === "string" && href.startsWith("/"))
      .forEach((href) => {
        router.prefetch(href);
      });
  }, [accessibleModules, router]);

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
        </Toolbar>
      </AppBar>

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
            borderRight: "1px solid #e2e8f0",
            background: "#ffffff",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "3px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(15, 23, 42, 0.1)", borderRadius: "10px" }
          }}
        >
          {/* User Banner */}
          <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f5f9" }}>
             <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar 
                 src={avatarDataUrl ?? undefined}
                 sx={{ width: 34, height: 34, border: "2px solid #f8fafc", bgcolor: "#0f172a", fontSize: "0.8rem", fontWeight: 1000 }}
                >
                  {user?.fullName?.[0] ?? "A"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                   <Typography sx={{ fontWeight: 1000, fontSize: "0.85rem", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName}</Typography>
                   <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: 0.5 }}>{accountTypeLabel}</Typography>
                </Box>
             </Stack>
          </Box>

          {/* Navigation Tracks */}
          <Box sx={{ flex: 1, py: 2 }}>
            {accessibleModules.map((group: any, gIdx: number) => {
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
                        sx={{
                          justifyContent: "flex-start",
                          px: 1.5,
                          py: 1.2,
                          minHeight: 44,
                          borderRadius: "10px",
                          color: item.active ? "primary.main" : "#0f172a",
                          bgcolor: item.active ? alpha("#3b82f6", 0.08) : "transparent",
                          textTransform: "none",
                          fontSize: "0.85rem",
                          fontWeight: 1000,
                          border: item.active ? "1px solid rgba(59, 130, 246, 0.15)" : "1px solid transparent",
                          boxShadow: item.active ? "0 4px 12px -2px rgba(59, 130, 246, 0.15)" : "none",
                          "& .MuiButton-startIcon": { mr: 1.5, color: item.active ? "primary.main" : "#64748b" },
                          "&:hover": {
                            bgcolor: item.active ? alpha("#3b82f6", 0.12) : "#f8fafc",
                            color: "primary.main"
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
                );
              }

              return (
                <Box key={gIdx} sx={{ mb: 1 }}>
                  <Button
                    fullWidth
                    onClick={() => toggleGroup(gIdx)}
                    sx={{
                      justifyContent: "flex-start",
                      px: 2.5,
                      py: 1,
                      color: "#64748b",
                      textTransform: "none",
                      fontWeight: 900,
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      "&:hover": { bgcolor: "transparent", color: "#0f172a" },
                      gap: 1
                    }}
                    startIcon={expandedGroups[gIdx] !== false ? <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18 }} />}
                  >
                    {group.heading}
                  </Button>
                  
                  <Collapse in={expandedGroups[gIdx] !== false}>
                    <Stack spacing={0.5} sx={{ px: 1.5, mt: 0.5 }}>
                      {group.items.map((item: any, idx: number) => (
                        <Button
                          key={idx}
                          component={Link}
                          href={item.href || "/dashboard"}
                          prefetch
                          fullWidth
                          startIcon={item.icon}
                          sx={{
                            justifyContent: "flex-start",
                            px: 1.5,
                            py: 1,
                            minHeight: 40,
                            borderRadius: "8px",
                            color: item.active ? "primary.main" : "#475569",
                            bgcolor: item.active ? alpha("#3b82f6", 0.08) : "transparent",
                            textTransform: "none",
                            fontSize: "0.85rem",
                            fontWeight: item.active ? 900 : 700,
                            border: item.active ? "1px solid rgba(59, 130, 246, 0.1)" : "1px solid transparent",
                            "& .MuiButton-startIcon": { mr: 1.5, color: item.active ? "primary.main" : "#94a3b8" },
                            "&:hover": {
                              bgcolor: item.active ? alpha("#3b82f6", 0.12) : "#f8fafc",
                              color: item.active ? "primary.main" : "#0f172a"
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

            {/* Static Security Section */}
            <Box sx={{ mt: 4 }}>
               <Button
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    px: 2.5,
                    py: 1,
                    color: "#94a3b8",
                    textTransform: "none",
                    fontWeight: 900,
                    fontSize: "0.72rem",
                    letterSpacing: "0.05em",
                    "&:hover": { bgcolor: "transparent" }
                  }}
                  startIcon={<ShieldRoundedIcon sx={{ fontSize: 16 }} />}
               >
                 SYSTEM NODES
               </Button>
               <Stack spacing={0.5} sx={{ px: 1.5, mt: 0.5 }}>
                  {[
                    { icon: <LockRoundedIcon sx={{ fontSize: 18 }} />, label: "Security Vault", href: "#" },
                    { icon: <DnsRoundedIcon sx={{ fontSize: 18 }} />, label: "Registry Hub", href: "#" }
                  ].map((item, idx) => (
                    <Button
                      key={idx}
                      fullWidth
                      startIcon={item.icon}
                      sx={{
                        justifyContent: "flex-start",
                        px: 1.5,
                        py: 1,
                        borderRadius: "8px",
                        color: "#94a3b8",
                        textTransform: "none",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        "& .MuiButton-startIcon": { mr: 1.5 },
                        "&:hover": { bgcolor: "#f1f5f9", color: "#64748b" }
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
               </Stack>
            </Box>
          </Box>

          {/* Action Log / Sidebar Footer */}
          <Box sx={{ p: 2, borderTop: "1px solid #f1f5f9", bgcolor: "#fcfdfe" }}>
            <Button
              onClick={onLogout}
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
              Terminate Pulse
            </Button>
          </Box>
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
