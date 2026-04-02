"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Container, Grid, Typography, Stack, Box, Alert, Skeleton, Button,
  Chip, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, LinearProgress, Tabs, Tab, Avatar, Divider
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import SettingsPowerRoundedIcon from "@mui/icons-material/SettingsPowerRounded";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ActionCard, type ActionCardItem } from "@/components/dashboard/cards/action-card";
import { getMe } from "@/shared/api/client";
import { getMonitoringOverview, updateSocietyAccess } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getDashboardCopy } from "@/shared/i18n/dashboard-copy";
import { appBranding } from "@/shared/config/branding";
import { toast } from "@/shared/ui/toast";
import type { AuthUser, MonitoringOverview } from "@/shared/types";
import { modules } from "@/features/banking/module-registry";
import { getAccessibleModules } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";

const featuredModuleSlugs = ["monitoring", "users", "reports"];

function fmt(value: number) {
  return value.toLocaleString("en-IN");
}

function fmtCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${fmt(value)}`;
}

function getModuleIcon(slug: string) {
  switch (slug) {
    case "users": return <PeopleRoundedIcon color="primary" />;
    case "monitoring": return <AnalyticsRoundedIcon color="primary" />;
    case "reports": return <TrendingUpRoundedIcon color="primary" />;
    default: return <Inventory2RoundedIcon color="primary" />;
  }
}

function StatusChip({ status }: { status: string }) {
  const config = {
    ACTIVE:    { label: "Active",    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />, bg: "#dcfce7", color: "#166534" },
    PENDING:   { label: "Pending",   icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 14 }} />, bg: "#fef9c3", color: "#854d0e" },
    SUSPENDED: { label: "Suspended", icon: <PauseCircleRoundedIcon sx={{ fontSize: 14 }} />, bg: "#fee2e2", color: "#991b1b" },
  }[status] ?? { label: status, icon: null, bg: "#f1f5f9", color: "#475569" };

  return (
    <Chip
      icon={config.icon ?? undefined}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 800,
        fontSize: "0.7rem",
        height: 22,
        "& .MuiChip-icon": { color: config.color }
      }}
    />
  );
}

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const dashboardCopy = useMemo(() => getDashboardCopy(locale), [locale]);

  async function loadData() {
    const session = getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      router.replace("/login");
      return;
    }

    try {
      const [profile, overview] = await Promise.all([
        getMe(session.accessToken),
        getMonitoringOverview(session.accessToken)
      ]);
      setUser(profile);
      setMonitoringOverview(overview);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Load error");
      clearSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [router]);

  async function handleApprove(societyId: string) {
    const session = getSession();
    if (!session) return;
    setApproving(societyId);
    try {
      await updateSocietyAccess(session.accessToken, societyId, { status: "ACTIVE", isActive: true });
      toast.success("Society enrollment verified and activated.");
      void loadData();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Verification failure.");
    } finally {
      setApproving(null);
    }
  }

  const accountTypeLabel = t("account.platform");

  const pendingSocieties = useMemo(
    () => monitoringOverview?.societies.filter((s) => s.status === "PENDING") ?? [],
    [monitoringOverview]
  );

  const activeSocieties = useMemo(
    () => monitoringOverview?.societies.filter((s) => s.status === "ACTIVE") ?? [],
    [monitoringOverview]
  );

  const allSocieties = monitoringOverview?.societies ?? [];

  const customAccessibleModules = useMemo(
    () => [
      {
        heading: "EXECUTIVE SUITE",
        items: [
          { label: "Portfolio Snapshot", href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon />, active: true }
        ]
      },
      {
        heading: "PLATFORM GOVERNANCE",
        items: [
          { label: "Approvals & Requests", href: "/dashboard/superadmin/approvals", slug: "approvals", badge: pendingSocieties?.length > 0 ? String(pendingSocieties.length) : undefined, icon: <VerifiedUserRoundedIcon /> },
          { label: "Platform Analytics", href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: "Network Explorer", href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: "Report Generation", href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: "System UI Settings", href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [pendingSocieties]
  );

  const featuredActions = useMemo<ActionCardItem[]>(() => {
    return [
      {
        key: "societies",
        title: "Societies Management",
        description: "Review and manage all registered societies, branches, agents, and clients on the platform",
        href: "/dashboard/superadmin/societies",
        icon: <BusinessCenterRoundedIcon color="primary" />,
        ctaLabel: "View Societies"
      },
      {
        key: "reports",
        title: "System Reports",
        description: "Generate global platform reports and run audits",
        href: "/dashboard/superadmin/reports",
        icon: <AnalyticsRoundedIcon color="primary" />,
        ctaLabel: "Generate Reports"
      }
    ];
  }, []);

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const totalAgents = monitoringOverview?.userRoleBreakdown?.["AGENT"] ?? 0;
  const totalClients = monitoringOverview?.userRoleBreakdown?.["CLIENT"] ?? 0;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={accountTypeLabel}
      avatarDataUrl={null}
      onLogout={() => { clearSession(); router.replace("/"); }}
      t={t as any}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ pb: 5 }}>
        {/* Portfolio Snapshot */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <AnalyticsRoundedIcon sx={{ color: "primary.main", fontSize: 30 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>Platform Portfolio Snapshot</Typography>
          </Stack>
          <Grid container spacing={4}>
            {[
              { label: "Active Societies", value: monitoringOverview?.totals.societies ?? 0, icon: <BusinessCenterRoundedIcon sx={{ fontSize: 26 }} />, trend: "STABLE", color: "#3b82f6", display: String(monitoringOverview?.totals.societies ?? "...") },
              { label: "Total Members", value: monitoringOverview?.totals.customers ?? 0, icon: <PeopleRoundedIcon sx={{ fontSize: 26 }} />, trend: "+4.2% Growth", color: "#8b5cf6", display: monitoringOverview ? fmt(monitoringOverview.totals.customers) : "..." },
              { label: "System Liquidity", value: 0, icon: <MonetizationOnRoundedIcon sx={{ fontSize: 26 }} />, trend: "OPTIMAL", color: "#10b981", display: monitoringOverview ? fmtCurrency(monitoringOverview.totals.totalBalance) : "..." },
            ].map((metric, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Box sx={{ position: "relative", overflow: "hidden", p: 3, borderRadius: 4, background: `linear-gradient(135deg, ${alpha(metric.color, 0.9)} 0%, ${alpha(metric.color, 1)} 100%)`, color: "#fff", boxShadow: `0 16px 32px -12px ${alpha(metric.color, 0.5)}`, transition: "all 300ms ease", "&:hover": { transform: "translateY(-4px)", boxShadow: `0 20px 40px -12px ${alpha(metric.color, 0.7)}` } }}>
                  <Box sx={{ position: "absolute", top: -16, right: -16, opacity: 0.15 }}>
                     {metric.icon}
                  </Box>
                  <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>{metric.icon}</Box>
                      <Chip label={metric.trend} sx={{ height: 22, fontWeight: 900, fontSize: "0.7rem", bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }} />
                    </Stack>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>{metric.display}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>{metric.label}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}

            {[
              { label: "Platform Agents", value: totalAgents, icon: <PersonRoundedIcon sx={{ fontSize: 24 }} />, trend: "Active", color: "#f59e0b", display: String(totalAgents || "...") },
              { label: "Platform Clients", value: totalClients, icon: <AccountBalanceRoundedIcon sx={{ fontSize: 24 }} />, trend: "Active", color: "#06b6d4", display: String(totalClients || "...") },
              { label: "Network Uptime", value: 0, icon: <SpeedRoundedIcon sx={{ fontSize: 24 }} />, trend: "System Status", color: "#475569", display: "99.98%" },
            ].map((metric, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={`sub-${idx}`}>
                <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: "#fff", border: "1px solid rgba(148, 163, 184, 0.15)", boxShadow: "0 4px 12px -8px rgba(15, 23, 42, 0.08)" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                     <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(metric.color, 0.1), color: metric.color }}>{metric.icon}</Box>
                     <Box>
                       <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>{metric.display}</Typography>
                       <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>{metric.label}</Typography>
                     </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Financial & Access Metrics */}
          <Grid container spacing={4} sx={{ mt: 5 }}>
             <Grid item xs={12} lg={8}>
               <Box sx={{ p: 4, borderRadius: 6, bgcolor: "#fff", height: "100%", border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column" }}>
                 <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                   <Box>
                     <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>System Liquidity Trend</Typography>
                     <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>30-Day Platform AUM Evaluation</Typography>
                   </Box>
                   <Chip label="Real-time" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }} />
                 </Stack>
                 <Box sx={{ flex: 1, minHeight: 300, width: "100%" }}>
                   <ResponsiveContainer>
                     <AreaChart data={[{day: "1", balance: 50}, {day: "10", balance: 120}, {day: "20", balance: 180}, {day: "30", balance: 240}]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                       <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }} />
                       <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </Box>
               </Box>
             </Grid>
             <Grid item xs={12} lg={4}>
                <Stack spacing={4} sx={{ height: "100%" }}>
                  {/* Account Classification Graph */}
                  <Box sx={{ p: 4, borderRadius: 6, bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.06)", flex: 1, display: "flex", flexDirection: "column" }}>
                     <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>Global Account Profiles</Typography>
                     <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}>By Institutional Account Type</Typography>
                     
                     <Box sx={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={[{name: 'Savings', value: 45, color: '#3b82f6'}, {name: 'Loans', value: 30, color: '#ef4444'}, {name: 'Fixed Deposits', value: 25, color: '#8b5cf6'}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none" dataKey="value">
                              {[{name: 'Savings', value: 45, color: '#3b82f6'}, {name: 'Loans', value: 30, color: '#ef4444'}, {name: 'Fixed Deposits', value: 25, color: '#8b5cf6'}].map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8rem', fontWeight: 800 }} />
                          </PieChart>
                        </ResponsiveContainer>
                     </Box>
                  </Box>

                  {/* Platform System Health */}
                  <Box sx={{ p: 4, borderRadius: 6, bgcolor: "#fff", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 8px 24px -12px rgba(16,185,129,0.15)", position: "relative", overflow: "hidden" }}>
                    <Box sx={{ position: "absolute", top: -20, right: -20, opacity: 0.05, color: "#10b981" }}>
                       <SettingsPowerRoundedIcon sx={{ fontSize: 120 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#10b981", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <SettingsPowerRoundedIcon /> Platform Infrastructure
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, fontWeight: 700, lineHeight: 1.6 }}>
                      All core services, network relays, and inter-society ledgers are fully operational with 99.99% uptime globally.
                    </Typography>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => alert("Platform Diagnostics: OK")}
                      sx={{ bgcolor: "#dcfce7", color: "#166534", py: 1.2, fontWeight: 900, borderRadius: 3, boxShadow: "none", "&:hover": { bgcolor: "#bbf7d0", color: "#14532d", boxShadow: "none" } }}
                    >
                      Diagnose Systems
                    </Button>
                  </Box>
                </Stack>
             </Grid>
          </Grid>
        </Box>

        {/* Role Breakdown */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <PeopleRoundedIcon sx={{ color: "primary.main", fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>Platform Role Breakdown</Typography>
          </Stack>
          <Grid container spacing={3}>
            {[
              { role: "SUPER_USER", label: "Society Owners", color: "#3b82f6", icon: <BusinessCenterRoundedIcon sx={{ fontSize: 32 }} /> },
              { role: "AGENT", label: "Agents", color: "#059669", icon: <PersonRoundedIcon sx={{ fontSize: 32 }} /> },
              { role: "CLIENT", label: "Clients", color: "#8b5cf6", icon: <PeopleRoundedIcon sx={{ fontSize: 32 }} /> },
            ].map((item) => {
              const count = monitoringOverview?.userRoleBreakdown?.[item.role] ?? 0;
              const total = Object.values(monitoringOverview?.userRoleBreakdown ?? {}).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <Grid size={{ xs: 12, sm: 4 }} key={item.role}>
                  <Box sx={{ p: 4, borderRadius: 5, bgcolor: "#fff", border: `1px solid ${alpha(item.color, 0.15)}`, boxShadow: "0 4px 20px -8px rgba(15,23,42,0.06)", transition: "all 300ms ease", "&:hover": { transform: "translateY(-4px)" } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 3, bgcolor: alpha(item.color, 0.1), color: item.color }}>{item.icon}</Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>{fmt(count)}</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>{item.label}</Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: "0.75rem" }}>Share of platform network</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: item.color }}>{pct}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(item.color, 0.1),
                          "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4 }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

      </Box>
    </DashboardShell>
  );
}
