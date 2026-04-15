"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid,
  Typography,
  Stack,
  Box,
  Alert,
  Skeleton,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSuperadminCopy } from "@/shared/i18n/superadmin-copy";
import type { AuthUser, MonitoringOverview } from "@/shared/types";

function fmt(value: number, localeTag: string) {
  return value.toLocaleString(localeTag);
}

function fmtCurrency(value: number, localeTag: string, copy: ReturnType<typeof getSuperadminCopy>) {
  if (value >= 10000000) return `${copy.currency.symbol}${(value / 10000000).toFixed(1)}${copy.currency.croreSuffix}`;
  if (value >= 100000) return `${copy.currency.symbol}${(value / 100000).toFixed(1)}${copy.currency.lakhSuffix}`;
  return `${copy.currency.symbol}${fmt(value, localeTag)}`;
}

function StatusChip({ status, copy }: { status: string; copy: ReturnType<typeof getSuperadminCopy> }) {
  const theme = useTheme();
  const config = {
    ACTIVE: {
      label: copy.analytics.statusActive,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
      bg: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
      color: theme.palette.mode === "dark" ? theme.palette.success.light : theme.palette.success.dark
    },
    PENDING: {
      label: copy.analytics.statusPending,
      icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 14 }} />,
      bg: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.2 : 0.14),
      color: theme.palette.mode === "dark" ? theme.palette.warning.light : theme.palette.warning.dark
    },
    SUSPENDED: {
      label: copy.analytics.statusSuspended,
      icon: <PauseCircleRoundedIcon sx={{ fontSize: 14 }} />,
      bg: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
      color: theme.palette.mode === "dark" ? theme.palette.error.light : theme.palette.error.dark
    }
  }[status] ?? { label: status, icon: null, bg: alpha(theme.palette.text.secondary, 0.12), color: theme.palette.text.secondary };

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

export default function SuperadminAnalyticsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t, locale } = useLanguage();
  const copy = getSuperadminCopy(locale);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = theme.palette.mode === "dark";
  const panelBg = alpha(theme.palette.background.paper, isDark ? 0.78 : 0.96);
  const panelBorder = `1px solid ${alpha(theme.palette.divider, isDark ? 0.9 : 1)}`;
  const panelShadow = isDark ? "0 10px 28px rgba(2,6,23,0.42)" : "0 8px 24px -12px rgba(15,23,42,0.08)";
  const pageTitleSx = { fontWeight: 900, color: "text.primary", letterSpacing: "-0.025em", fontSize: { xs: "1.9rem", md: "2.35rem" } } as const;
  const sectionTitleSx = { fontWeight: 900, color: "text.primary", letterSpacing: "-0.02em", fontSize: { xs: "1.3rem", md: "1.55rem" } } as const;

  async function loadData() {
    const session = getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      router.replace("/admin");
      return;
    }

    try {
      const [profile, overview] = await Promise.all([getMe(session.accessToken), getMonitoringOverview(session.accessToken)]);
      setUser(profile);
      setMonitoringOverview(overview);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.common.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [router, copy.common.loadError]);

  const pendingSocieties = useMemo(
    () => monitoringOverview?.societies.filter((s) => s.status === "PENDING") ?? [],
    [monitoringOverview]
  );
  const allSocieties = monitoringOverview?.societies ?? [];

  const customAccessibleModules = useMemo(
    () => [
      {
        heading: copy.nav.executiveSuite,
        items: [{ label: copy.nav.portfolioSnapshot, href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }]
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
          {
            label: copy.nav.platformAnalytics,
            href: "/dashboard/superadmin/analytics",
            slug: "analytics",
            active: true,
            icon: <BarChartRoundedIcon />
          },
          { label: copy.nav.networkExplorer, href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: copy.nav.reportGeneration, href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: copy.nav.systemUiSettings, href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [copy, pendingSocieties.length]
  );

  const volumeData = useMemo(
    () => [
      { month: copy.analytics.months[0], vol: 400 },
      { month: copy.analytics.months[1], vol: 300 },
      { month: copy.analytics.months[2], vol: 550 },
      { month: copy.analytics.months[3], vol: 450 },
      { month: copy.analytics.months[4], vol: 700 },
      { month: copy.analytics.months[5], vol: 650 }
    ],
    [copy.analytics.months]
  );

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={t("account.platform")}
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      t={t as never}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ pb: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 2 }}>
            {copy.analytics.overline}
          </Typography>
          <Typography variant="h3" sx={pageTitleSx}>
            {copy.analytics.title}
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <AccountTreeRoundedIcon sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography variant="h3" sx={sectionTitleSx}>
              {copy.analytics.intelligenceTitle}
            </Typography>
          </Stack>

          <Box sx={{ mb: 5, p: 4, borderRadius: 1, bgcolor: panelBg, border: panelBorder, boxShadow: panelShadow }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: "text.primary" }}>
              {copy.analytics.volumeTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 4, fontWeight: 700 }}>
              {copy.analytics.volumeSubtitle}
            </Typography>
            <Box sx={{ height: 320, width: "100%" }}>
              <ResponsiveContainer>
                <AreaChart data={volumeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: theme.palette.text.secondary }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: theme.palette.text.secondary }} />
                  <Tooltip
                    formatter={(value) => fmtCurrency(Number(value ?? 0), copy.localeTag, copy)}
                    contentStyle={{ borderRadius: 12, border: panelBorder, boxShadow: panelShadow, fontWeight: 900, backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.96 : 0.98), color: theme.palette.text.primary }}
                  />
                  <Area type="monotone" dataKey="vol" stroke={theme.palette.primary.main} strokeWidth={4} fill="url(#volColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 1, border: panelBorder, boxShadow: panelShadow, bgcolor: panelBg }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.text.primary, isDark ? 0.12 : 0.04) }}>
                  {copy.analytics.tableHeaders.map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{ fontWeight: 900, color: "text.secondary", fontSize: "0.85rem", letterSpacing: 1.2, textTransform: "uppercase", whiteSpace: "nowrap", py: 2.5 }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allSocieties.map((society) => (
                  <TableRow
                    key={society.id}
                    sx={{
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05) },
                      borderBottom: `1px solid ${alpha(theme.palette.divider, isDark ? 0.8 : 1)}`,
                      transition: "background 150ms"
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", fontWeight: 900, fontSize: "1rem" }}>
                          {society.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 900, color: "text.primary" }}>
                            {society.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 800 }}>
                            {society.code}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={society.subscriptionPlan === "PREMIUM" ? copy.analytics.planPremium : copy.analytics.planCommon}
                        size="medium"
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.8rem",
                          height: 28,
                          bgcolor: society.subscriptionPlan === "PREMIUM" ? alpha(theme.palette.secondary.main, 0.16) : alpha(theme.palette.text.secondary, 0.1),
                          color: society.subscriptionPlan === "PREMIUM" ? theme.palette.secondary.main : theme.palette.text.secondary
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={society.status} copy={copy} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>
                        {fmt(society.customers, copy.localeTag)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>
                        {fmt(society.accounts, copy.localeTag)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: "success.main" }}>
                        {fmt(society.activeUsers, copy.localeTag)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: "text.primary" }}>
                        {fmtCurrency(society.totalBalance, copy.localeTag, copy)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            monitoringOverview && monitoringOverview.totals.totalBalance > 0
                              ? Math.min(100, (society.totalBalance / monitoringOverview.totals.totalBalance) * 100)
                              : 0
                          }
                          sx={{
                            height: 6,
                            borderRadius: 6,
                            bgcolor: alpha(theme.palette.text.secondary, 0.18),
                            "& .MuiLinearProgress-bar": { bgcolor: theme.palette.primary.main, borderRadius: 6 }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>
                        {fmt(society.transactions, copy.localeTag)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ borderRadius: 3, fontWeight: 900, fontSize: "0.85rem", py: 1, px: 2, bgcolor: "primary.main" }}
                        onClick={() => router.push("/dashboard/superadmin/societies")}
                      >
                        {copy.analytics.inspect}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {allSocieties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 8 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800 }}>
                        {copy.analytics.noSocietiesFound}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </DashboardShell>
  );
}
