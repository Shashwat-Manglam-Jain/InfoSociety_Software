"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, Typography, Stack, Box, Alert, Skeleton, Button,
  Chip, LinearProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser, MonitoringOverview, Session } from "@/shared/types";

function fmt(value: number) {
  return value.toLocaleString("en-IN");
}

function fmtCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${fmt(value)}`;
}

function buildShellUser(session: Session): AuthUser {
  return {
    id: session.username,
    username: session.username,
    fullName: session.fullName,
    role: "SUPER_ADMIN",
    requiresPasswordChange: session.requiresPasswordChange,
    allowedModuleSlugs: session.allowedModuleSlugs ?? [],
    society: null,
    subscription: null,
    customerProfile: null
  };
}

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const session = getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      router.replace("/admin");
      return;
    }

    setUser(buildShellUser(session));
    setError(null);

    try {
      const overview = await getMonitoringOverview(session.accessToken);
      setMonitoringOverview(overview);
    } catch (caught) {
      const status = (caught as { status?: number })?.status;
      const message = caught instanceof Error ? caught.message : "Unable to load platform monitoring.";

      if (status === 401 || status === 403) {
        clearSession();
        router.replace("/admin");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, [router]);

  const accountTypeLabel = t("account.platform");

  const pendingSocieties = useMemo(
    () => monitoringOverview?.societies.filter((s) => s.status === "PENDING") ?? [],
    [monitoringOverview]
  );
  const activeSocieties = useMemo(
    () => monitoringOverview?.societies.filter((s) => s.status === "ACTIVE" && s.isActive) ?? [],
    [monitoringOverview]
  );
  const suspendedSocieties = useMemo(
    () => monitoringOverview?.societies.filter((s) => s.status === "SUSPENDED" || !s.isActive) ?? [],
    [monitoringOverview]
  );

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
  const totalAgents = monitoringOverview?.userRoleBreakdown?.["AGENT"] ?? 0;
  const totalClients = monitoringOverview?.userRoleBreakdown?.["CLIENT"] ?? 0;
  const digitalCollectionReadyCount = useMemo(
    () => monitoringOverview?.societies.filter((society) => society.acceptsDigitalPayments).length ?? 0,
    [monitoringOverview]
  );
  const topSocietyBalanceData = useMemo(
    () =>
      [...activeSocieties]
        .sort((left, right) => right.totalBalance - left.totalBalance)
        .slice(0, 6)
        .map((society) => ({
          label: society.code,
          balance: society.totalBalance
        })),
    [activeSocieties]
  );
  const statusDistribution = useMemo(
    () =>
      [
        { name: "Active", value: activeSocieties.length, color: "#10b981" },
        { name: "Pending", value: pendingSocieties.length, color: "#f59e0b" },
        { name: "Suspended", value: suspendedSocieties.length, color: "#ef4444" }
      ].filter((entry) => entry.value > 0),
    [activeSocieties, pendingSocieties, suspendedSocieties]
  );

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
        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 4, borderRadius: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => {
                setLoading(true);
                void loadData();
              }}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        {loading && !monitoringOverview ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))}
          </Grid>
        ) : null}

        {/* Portfolio Snapshot */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <AnalyticsRoundedIcon sx={{ color: "primary.main", fontSize: 30 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>Platform Portfolio Snapshot</Typography>
          </Stack>
          <Grid container spacing={4}>
            {[
              {
                label: "Active Societies",
                value: activeSocieties.length,
                icon: <BusinessCenterRoundedIcon sx={{ fontSize: 26 }} />,
                trend: pendingSocieties.length > 0 ? `${pendingSocieties.length} Awaiting Review` : "STABLE",
                color: "#3b82f6",
                display: String(activeSocieties.length)
              },
              {
                label: "Total Members",
                value: monitoringOverview?.totals.customers ?? 0,
                icon: <PeopleRoundedIcon sx={{ fontSize: 26 }} />,
                trend: `${fmt(monitoringOverview?.totals.accounts ?? 0)} Accounts`,
                color: "#8b5cf6",
                display: monitoringOverview ? fmt(monitoringOverview.totals.customers) : "..."
              },
              {
                label: "System Liquidity",
                value: monitoringOverview?.totals.totalBalance ?? 0,
                icon: <MonetizationOnRoundedIcon sx={{ fontSize: 26 }} />,
                trend: `${fmt(monitoringOverview?.totals.transactions ?? 0)} Transactions`,
                color: "#10b981",
                display: monitoringOverview ? fmtCurrency(monitoringOverview.totals.totalBalance) : "..."
              },
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
              {
                label: "Digital Collection Ready",
                value: digitalCollectionReadyCount,
                icon: <PaymentRoundedIcon sx={{ fontSize: 24 }} />,
                trend: `${activeSocieties.length > 0 ? Math.round((digitalCollectionReadyCount / activeSocieties.length) * 100) : 0}% Coverage`,
                color: "#475569",
                display: String(digitalCollectionReadyCount)
              },
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
                     <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>Top Society Balances</Typography>
                     <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>Live liquidity by approved society</Typography>
                   </Box>
                   <Chip label={`${topSocietyBalanceData.length} Live Rows`} size="small" sx={{ fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }} />
                 </Stack>
                 <Box sx={{ flex: 1, minHeight: 300, width: "100%" }}>
                   {topSocietyBalanceData.length > 0 ? (
                     <ResponsiveContainer>
                       <BarChart data={topSocietyBalanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                         <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                         <Tooltip
                           formatter={(value: number) => fmtCurrency(value)}
                           contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }}
                         />
                         <Bar dataKey="balance" radius={[10, 10, 0, 0]} fill="#10b981" />
                       </BarChart>
                     </ResponsiveContainer>
                   ) : (
                     <Box sx={{ height: "100%", minHeight: 260, display: "grid", placeItems: "center" }}>
                       <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                         No approved society balance data is available yet.
                       </Typography>
                     </Box>
                   )}
                 </Box>
               </Box>
             </Grid>
             <Grid item xs={12} lg={4}>
                <Stack spacing={4} sx={{ height: "100%" }}>
                  {/* Live Status Graph */}
                  <Box sx={{ p: 4, borderRadius: 6, bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.06)", flex: 1, display: "flex", flexDirection: "column" }}>
                     <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>Society Status Distribution</Typography>
                     <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}>Current onboarding and access state</Typography>
                     
                     <Box sx={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {statusDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none" dataKey="value">
                                {statusDistribution.map((entry, index) => <Cell key={`status-cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }} />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.8rem", fontWeight: 800 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                            No societies are available yet.
                          </Typography>
                        )}
                     </Box>
                  </Box>

                  {/* Live Governance Snapshot */}
                  <Box sx={{ p: 4, borderRadius: 6, bgcolor: "#fff", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 8px 24px -12px rgba(16,185,129,0.15)", position: "relative", overflow: "hidden" }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#10b981", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <SpeedRoundedIcon /> Governance Snapshot
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, fontWeight: 700, lineHeight: 1.6 }}>
                      {pendingSocieties.length > 0
                        ? `${pendingSocieties.length} societies are waiting for review, and ${digitalCollectionReadyCount} societies already support digital collections.`
                        : `No approval backlog right now. ${digitalCollectionReadyCount} societies currently support digital collections.`}
                    </Typography>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => router.push(pendingSocieties.length > 0 ? "/dashboard/superadmin/approvals" : "/dashboard/superadmin/societies")}
                      sx={{ bgcolor: "#dcfce7", color: "#166534", py: 1.2, fontWeight: 900, borderRadius: 3, boxShadow: "none", "&:hover": { bgcolor: "#bbf7d0", color: "#14532d", boxShadow: "none" } }}
                    >
                      {pendingSocieties.length > 0 ? "Open Approval Queue" : "Review Society Network"}
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
