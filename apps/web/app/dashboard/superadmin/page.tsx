"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Typography, Stack, Box, Alert, Skeleton, Button, Chip, LinearProgress } from "@mui/material";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSuperadminCopy } from "@/shared/i18n/superadmin-copy";
import type { AuthUser, MonitoringOverview, Session } from "@/shared/types";

function fmt(value: number, localeTag: string) {
  return value.toLocaleString(localeTag);
}

function fmtCurrency(value: number, localeTag: string, copy: ReturnType<typeof getSuperadminCopy>) {
  if (value >= 10000000) return `${copy.currency.symbol}${(value / 10000000).toFixed(1)}${copy.currency.croreSuffix}`;
  if (value >= 100000) return `${copy.currency.symbol}${(value / 100000).toFixed(1)}${copy.currency.lakhSuffix}`;
  return `${copy.currency.symbol}${fmt(value, localeTag)}`;
}

function replaceVar(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((result, [key, value]) => result.replace(`{{${key}}}`, String(value)), template);
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
  const { t, locale } = useLanguage();
  const copy = getSuperadminCopy(locale);
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
      const message = caught instanceof Error ? caught.message : copy.common.loadError;

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

  useEffect(() => {
    void loadData();
  }, [router, copy.common.loadError]);

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
        heading: copy.nav.executiveSuite,
        items: [
          {
            label: copy.nav.portfolioSnapshot,
            href: "/dashboard/superadmin",
            slug: "dashboard",
            icon: <InsightsRoundedIcon />,
            active: true
          }
        ]
      },
      {
        heading: copy.nav.platformGovernance,
        items: [
          {
            label: copy.nav.approvalsRequests,
            href: "/dashboard/superadmin/approvals",
            slug: "approvals",
            badge: pendingSocieties.length > 0 ? String(pendingSocieties.length) : undefined,
            icon: <VerifiedUserRoundedIcon />
          },
          { label: copy.nav.platformAnalytics, href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: copy.nav.networkExplorer, href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: copy.nav.reportGeneration, href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: copy.nav.systemUiSettings, href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [copy, pendingSocieties.length]
  );

  const totalAgents = monitoringOverview?.userRoleBreakdown?.AGENT ?? 0;
  const totalClients = monitoringOverview?.userRoleBreakdown?.CLIENT ?? 0;
  const totalUsers = Object.values(monitoringOverview?.userRoleBreakdown ?? {}).reduce((a, b) => a + b, 0);
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
        { name: copy.overview.statusActive, value: activeSocieties.length, color: "#10b981" },
        { name: copy.overview.statusPending, value: pendingSocieties.length, color: "#f59e0b" },
        { name: copy.overview.statusSuspended, value: suspendedSocieties.length, color: "#ef4444" }
      ].filter((entry) => entry.value > 0),
    [activeSocieties.length, pendingSocieties.length, suspendedSocieties.length, copy.overview]
  );

  const summaryMetrics = [
    {
      label: copy.overview.activeSocieties,
      icon: <BusinessCenterRoundedIcon sx={{ fontSize: 26 }} />,
      trend:
        pendingSocieties.length > 0
          ? replaceVar(copy.overview.awaitingReview, { count: pendingSocieties.length })
          : copy.overview.stable,
      color: "#3b82f6",
      display: String(activeSocieties.length)
    },
    {
      label: copy.overview.totalMembers,
      icon: <PeopleRoundedIcon sx={{ fontSize: 26 }} />,
      trend: replaceVar(copy.overview.accounts, { count: fmt(monitoringOverview?.totals.accounts ?? 0, copy.localeTag) }),
      color: "#8b5cf6",
      display: monitoringOverview ? fmt(monitoringOverview.totals.customers, copy.localeTag) : "..."
    },
    {
      label: copy.overview.systemLiquidity,
      icon: <MonetizationOnRoundedIcon sx={{ fontSize: 26 }} />,
      trend: replaceVar(copy.overview.transactions, { count: fmt(monitoringOverview?.totals.transactions ?? 0, copy.localeTag) }),
      color: "#10b981",
      display: monitoringOverview ? fmtCurrency(monitoringOverview.totals.totalBalance, copy.localeTag, copy) : "..."
    }
  ];

  const subMetrics = [
    {
      label: copy.overview.platformAgents,
      icon: <PersonRoundedIcon sx={{ fontSize: 24 }} />,
      color: "#f59e0b",
      display: String(totalAgents)
    },
    {
      label: copy.overview.platformClients,
      icon: <AccountBalanceRoundedIcon sx={{ fontSize: 24 }} />,
      color: "#06b6d4",
      display: String(totalClients)
    },
    {
      label: copy.overview.digitalCollectionReady,
      icon: <PaymentRoundedIcon sx={{ fontSize: 24 }} />,
      color: "#475569",
      display: String(digitalCollectionReadyCount)
    }
  ];

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={accountTypeLabel}
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      t={t as never}
      accessibleModules={customAccessibleModules}
      keepSidebarVisible
    >
      <Box sx={{ pb: { xs: 4, md: 5 }, width: "100%", minWidth: 0, overflowX: "hidden" }}>
        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 4, borderRadius: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setLoading(true);
                  void loadData();
                }}
              >
                {copy.common.retry}
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        {loading && !monitoringOverview ? (
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))}
          </Grid>
        ) : null}

        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 3 }}
          >
            <AnalyticsRoundedIcon sx={{ color: "primary.main", fontSize: { xs: 26, sm: 30 } }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em", fontSize: { xs: "1.6rem", sm: "2rem" } }}
            >
              {copy.overview.portfolioTitle}
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ width: "100%", m: 0 }}>
            {summaryMetrics.map((metric, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    p: { xs: 2.25, sm: 3 },
                    borderRadius: 1,
                    background: `linear-gradient(135deg, ${alpha(metric.color, 0.9)} 0%, ${alpha(metric.color, 1)} 100%)`,
                    color: "#fff",
                    boxShadow: `0 16px 32px -12px ${alpha(metric.color, 0.5)}`,
                    transition: "all 300ms ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: `0 20px 40px -12px ${alpha(metric.color, 0.7)}` }
                  }}
                >
                  <Box sx={{ position: "absolute", top: -16, right: -16, opacity: 0.15 }}>{metric.icon}</Box>
                  <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                      <Box sx={{ p: 1, borderRadius: 1, bgcolor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>{metric.icon}</Box>
                      <Chip
                        label={metric.trend}
                        sx={{
                          maxWidth: "100%",
                          height: 22,
                          fontWeight: 900,
                          fontSize: "0.7rem",
                          bgcolor: "rgba(255,255,255,0.2)",
                          color: "#fff",
                          "& .MuiChip-label": { display: "block", overflow: "hidden", textOverflow: "ellipsis" }
                        }}
                      />
                    </Stack>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900, letterSpacing: "-0.02em", fontSize: { xs: "1.6rem", sm: "2.125rem" }, wordBreak: "break-word" }}
                      >
                        {metric.display}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>
                        {metric.label}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}

            {subMetrics.map((metric, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={`sub-${idx}`} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    bgcolor: "#fff",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    boxShadow: "0 4px 12px -8px rgba(15, 23, 42, 0.08)"
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(metric.color, 0.1), color: metric.color }}>{metric.icon}</Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em", fontSize: { xs: "1.35rem", sm: "1.5rem" }, wordBreak: "break-word" }}
                      >
                        {metric.display}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                        {metric.label}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: { xs: 3, md: 5 }, width: "100%", m: 0 }}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  p: { xs: 2.25, sm: 3, md: 4 },
                  borderRadius: 2,
                  bgcolor: "#fff",
                  height: "100%",
                  border: "1px solid rgba(148,163,184,0.15)",
                  boxShadow: "0 8px 24px -12px rgba(15,23,42,0.06)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ mb: 4 }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em", fontSize: { xs: "1.35rem", sm: "1.5rem" } }}>
                      {copy.overview.topBalancesTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      {copy.overview.topBalancesSubtitle}
                    </Typography>
                  </Box>
                  <Chip
                    label={replaceVar(copy.overview.liveRows, { count: topSocietyBalanceData.length })}
                    size="small"
                    sx={{ fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }}
                  />
                </Stack>
                <Box sx={{ flex: 1, minHeight: { xs: 240, sm: 300 }, width: "100%" }}>
                  {topSocietyBalanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topSocietyBalanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          angle={topSocietyBalanceData.length > 4 ? -20 : 0}
                          textAnchor={topSocietyBalanceData.length > 4 ? "end" : "middle"}
                          height={topSocietyBalanceData.length > 4 ? 60 : 30}
                          tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                        <Tooltip
                          formatter={(value) => fmtCurrency(Number(value ?? 0), copy.localeTag, copy)}
                          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }}
                        />
                        <Bar dataKey="balance" radius={[10, 10, 0, 0]} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: "100%", minHeight: 260, display: "grid", placeItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                        {copy.overview.noBalanceData}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
              <Stack spacing={{ xs: 2, md: 4 }} sx={{ height: "100%" }}>
                <Box
                  sx={{
                    p: { xs: 2.25, sm: 3, md: 4 },
                    borderRadius: 1,
                    bgcolor: "#fff",
                    border: "1px solid rgba(148,163,184,0.15)",
                    boxShadow: "0 8px 24px -12px rgba(15,23,42,0.06)",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em", fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    {copy.overview.statusDistributionTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}>
                    {copy.overview.statusDistributionSubtitle}
                  </Typography>

                  <Box sx={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {statusDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={statusDistribution} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={5} stroke="none" dataKey="value">
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`status-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }} />
                          <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontSize: "0.75rem", fontWeight: 800, lineHeight: 1.4 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                        {copy.overview.noSocieties}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2.25, sm: 3, md: 4 },
                    borderRadius: 2,
                    bgcolor: "#fff",
                    border: "1px solid rgba(16,185,129,0.3)",
                    boxShadow: "0 8px 24px -12px rgba(16,185,129,0.15)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, color: "#10b981", mb: 1.5, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    <SpeedRoundedIcon />
                    {copy.overview.governanceTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, fontWeight: 700, lineHeight: 1.6 }}>
                    {pendingSocieties.length > 0
                      ? replaceVar(copy.overview.governanceWaiting, {
                          pending: pendingSocieties.length,
                          digital: digitalCollectionReadyCount
                        })
                      : replaceVar(copy.overview.governanceClear, { digital: digitalCollectionReadyCount })}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() =>
                      router.push(
                        pendingSocieties.length > 0 ? "/dashboard/superadmin/approvals" : "/dashboard/superadmin/societies"
                      )
                    }
                    sx={{
                      bgcolor: "#dcfce7",
                      color: "#166534",
                      py: 1.2,
                      fontWeight: 900,
                      borderRadius: 3,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#bbf7d0", color: "#14532d", boxShadow: "none" }
                    }}
                  >
                    {pendingSocieties.length > 0 ? copy.overview.openApprovalQueue : copy.overview.reviewSocietyNetwork}
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 3 }}
          >
            <PeopleRoundedIcon sx={{ color: "primary.main", fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em", fontSize: { xs: "1.35rem", sm: "1.5rem" } }}>
              {copy.overview.roleBreakdownTitle}
            </Typography>
          </Stack>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%", m: 0 }}>
            {[
              { role: "SUPER_USER", label: copy.overview.societyOwners, color: "#3b82f6", icon: <BusinessCenterRoundedIcon sx={{ fontSize: 32 }} /> },
              { role: "AGENT", label: copy.overview.agents, color: "#059669", icon: <PersonRoundedIcon sx={{ fontSize: 32 }} /> },
              { role: "CLIENT", label: copy.overview.clients, color: "#8b5cf6", icon: <PeopleRoundedIcon sx={{ fontSize: 32 }} /> }
            ].map((item) => {
              const count = monitoringOverview?.userRoleBreakdown?.[item.role] ?? 0;
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;

              return (
                <Grid size={{ xs: 12, sm: 4 }} key={item.role} sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      p: { xs: 2.25, sm: 3, md: 4 },
                      borderRadius: 1,
                      bgcolor: "#fff",
                      border: `1px solid ${alpha(item.color, 0.15)}`,
                      boxShadow: "0 4px 20px -8px rgba(15,23,42,0.06)",
                      transition: "all 300ms ease",
                      "&:hover": { transform: "translateY(-4px)" }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, gap: 1 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(item.color, 0.1), color: item.color }}>{item.icon}</Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em", fontSize: { xs: "1.9rem", sm: "2.25rem" } }}>
                        {fmt(count, copy.localeTag)}
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                      {item.label}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: "0.75rem" }}>
                          {copy.overview.shareOfPlatform}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: item.color }}>
                          {pct}%
                        </Typography>
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
