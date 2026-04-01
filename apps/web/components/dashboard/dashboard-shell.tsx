"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { AppBar, Avatar, Box, Button, Chip, Divider, IconButton, Stack, Toolbar, Typography, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
            `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.98)} 0%, ${alpha(theme.palette.primary.main, 0.96)} 50%, ${alpha(theme.palette.secondary.main, 0.98)} 100%)`,
          zIndex: (theme) => theme.zIndex.drawer - 1,
          boxShadow: `0 8px 32px rgba(15, 23, 42, 0.12)`
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 2, flexWrap: "nowrap", py: 0, px: { xs: 1.5, md: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
              }}
            >
              <SavingsRoundedIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={900} lineHeight={1.1} noWrap sx={{ letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                {appBranding.productShortName}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.72)", fontWeight: 700, fontSize: "0.68rem", letterSpacing: 0.5 }} noWrap>
                {accountTypeLabel.toUpperCase()} ENVIRONMENT
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>

            <SettingsMenu size="small" />
            
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.12)", my: 1.5 }} />

            <Stack direction="row" spacing={1} alignItems="center">
               <Avatar
                src={avatarDataUrl ?? undefined}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontWeight: 800,
                  fontSize: "0.9rem"
                }}
              >
                {user?.fullName?.[0] ?? "U"}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" } }}>
                 <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{user?.fullName?.split(" ")[0]}</Typography>
                 <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>EXECUTIVE</Typography>
              </Box>
            </Stack>

            <IconButton 
              onClick={onLogout}
              sx={{ 
                color: "#fff", 
                bgcolor: "rgba(255,255,255,0.05)",
                "&:hover": { bgcolor: "rgba(196, 49, 60, 0.9)", color: "#fff" }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        display: "flex", 
        height: "100vh", 
        overflow: "hidden", 
        pt: "72px" 
      }}>
        {/* Scrollable Left Sidebar */}
        <Box
          sx={{
            width: { xs: 0, md: 300 },
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            borderRight: "1px solid rgba(148, 163, 184, 0.12)",
            background: "linear-gradient(180deg, #ffffff 0%, rgba(248,250,252,0.98) 100%)",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            px: 2,
            py: 2,
            gap: 2,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.08)", borderRadius: "10px" }
          }}
        >
          {/* User Identity Card - always visible */}
          <Box sx={{ 
            flexShrink: 0,
            p: 2, 
            borderRadius: 3, 
            bgcolor: "#0f172a", 
            color: "#fff",
            boxShadow: "0 8px 16px -6px rgba(15, 23, 42, 0.2)",
          }}>
             <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: "nowrap" }}>
                <Avatar 
                 src={avatarDataUrl ?? undefined}
                 sx={{ width: 36, height: 36, flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)", bgcolor: "rgba(255,255,255,0.15)", fontSize: "0.85rem", fontWeight: 900 }}
                >
                  {user?.fullName?.[0] ?? "A"}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                   <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", lineHeight: 1.25, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName ?? "Admin"}</Typography>
                   <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{accountTypeLabel}</Typography>
                </Box>
             </Stack>
          </Box>

          {/* Navigation Tracks */}
          <Stack spacing={4}>
            {accessibleModules.length > 0 && accessibleModules[0].heading ? (
              accessibleModules.map((group: any, gIdx: number) => (
                <Box key={gIdx}>
                  <Typography variant="overline" sx={{ px: 1, color: "text.disabled", fontWeight: 900, letterSpacing: 2 }}>{group.heading}</Typography>
                  <Stack spacing={1} sx={{ mt: 1.5 }}>
                    {group.items.map((item: any, idx: number) => (
                      <Button
                        key={idx}
                        component={Link}
                        href={item.href || "/dashboard"}
                        fullWidth
                        startIcon={item.icon || <InsightsRoundedIcon />}
                        sx={{
                          justifyContent: "flex-start",
                          p: "12px 16px",
                          borderRadius: "12px",
                          color: item.active ? "primary.main" : "#64748b",
                          bgcolor: item.active ? alpha("#3b82f6", 0.08) : "transparent",
                          border: item.active ? "1px solid rgba(59, 130, 246, 0.12)" : "1px solid transparent",
                          textTransform: "none",
                          fontSize: "0.92rem",
                          fontWeight: item.active ? 800 : 600,
                          transition: "all 200ms ease",
                          "&:hover": {
                            bgcolor: alpha("#3b82f6", 0.05),
                            color: "primary.main"
                          }
                        }}
                      >
                        {item.label || item.name}
                        {item.badge && (
                           <Chip label={item.badge} size="small" sx={{ ml: "auto", height: 18, fontSize: "0.65rem", fontWeight: 900, bgcolor: "rgba(15, 23, 42, 0.06)" }} />
                        )}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              ))
            ) : (
              <Box>
                <Typography variant="overline" sx={{ px: 1, color: "text.disabled", fontWeight: 900, letterSpacing: 2 }}>COMMANDS</Typography>
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {(accessibleModules.length > 0 ? accessibleModules : [
                    { label: "Executive Desk", href: "/dashboard", active: true, icon: <InsightsRoundedIcon /> }
                  ]).map((item: any, idx: number) => (
                      <Button
                        key={idx}
                        component={Link}
                        href={item.href || "/dashboard"}
                        fullWidth
                        startIcon={item.icon || <InsightsRoundedIcon />}
                        sx={{
                          justifyContent: "flex-start",
                          p: "12px 16px",
                          borderRadius: "12px",
                          color: item.active ? "primary.main" : "#64748b",
                          bgcolor: item.active ? alpha("#3b82f6", 0.08) : "transparent",
                          border: item.active ? "1px solid rgba(59, 130, 246, 0.12)" : "1px solid transparent",
                          textTransform: "none",
                          fontSize: "0.92rem",
                          fontWeight: item.active ? 800 : 600,
                          transition: "all 200ms ease",
                          "&:hover": {
                            bgcolor: alpha("#3b82f6", 0.05),
                            color: "primary.main"
                          }
                        }}
                      >
                        {item.label || item.name}
                        {item.badge && (
                           <Chip label={item.badge} size="small" sx={{ ml: "auto", height: 18, fontSize: "0.65rem", fontWeight: 900, bgcolor: "rgba(15, 23, 42, 0.06)" }} />
                        )}
                      </Button>
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="overline" sx={{ px: 1, color: "text.disabled", fontWeight: 900, letterSpacing: 2 }}>SECURITY</Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {[
                  { icon: <ShieldRoundedIcon />, label: "Security Center", href: "/dashboard/superadmin/security" },
                  { icon: <AccountBalanceIcon />, label: "Settlements", href: "/dashboard/superadmin/settlements" }
                ].map((item, idx) => (
                  <Button
                    key={idx}
                    component={Link}
                    href={item.href}
                    fullWidth
                    startIcon={item.icon}
                    sx={{
                      justifyContent: "flex-start",
                      p: "12px 16px",
                      borderRadius: "12px",
                      color: "#64748b",
                      textTransform: "none",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "rgba(15, 23, 42, 0.03)", color: "text.primary" }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* Sidebar Footer with Logout Action */}
          <Box sx={{ mt: "auto", pt: 4, borderTop: "1px solid rgba(148, 163, 184, 0.12)" }}>
            <Button
              onClick={onLogout}
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              sx={{
                py: 1.5,
                borderRadius: "14px",
                fontWeight: 800,
                color: "#c6313c",
                borderColor: "rgba(198, 49, 60, 0.2)",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(198, 49, 60, 0.05)",
                  borderColor: "#c6313c"
                }
              }}
            >
              Terminate Session
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
            bgcolor: "#f8fafc",
            p: { xs: 2.5, md: 5 },
            position: "relative",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.12)", borderRadius: "10px" }
          }}
        >
          <Box sx={{ maxWidth: 1440, mx: "auto" }}>
             {children}
             <WorkspaceFooter />
          </Box>
        </Box>
      </Box>
    </>
  );
}
