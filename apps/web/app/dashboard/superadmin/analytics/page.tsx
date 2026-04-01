"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, Typography, Stack, Box, Alert, Skeleton, Button,
  Chip, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, LinearProgress, Tabs, Tab, Avatar
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
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
import { getMonitoringOverview, updateSocietyAccess } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { toast } from "@/shared/ui/toast";
import type { AuthUser, MonitoringOverview } from "@/shared/types";

function fmt(value: number) {
  return value.toLocaleString("en-IN");
}

function fmtCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${fmt(value)}`;
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

export default function SuperadminAnalyticsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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
          { label: "Portfolio Snapshot", href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }
        ]
      },
      {
        heading: "PLATFORM GOVERNANCE",
        items: [
          { label: "Approvals & Requests", href: "/dashboard/superadmin/approvals", slug: "approvals", badge: pendingSocieties?.length > 0 ? String(pendingSocieties.length) : undefined, icon: <VerifiedUserRoundedIcon /> },
          { label: "Platform Analytics", href: "/dashboard/superadmin/analytics", slug: "analytics", active: true, icon: <BarChartRoundedIcon /> },
          { label: "Network Explorer", href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: "Report Generation", href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: "System UI Settings", href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [pendingSocieties]
  );

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={t("account.platform")}
      avatarDataUrl={null}
      onLogout={() => { clearSession(); router.replace("/"); }}
      t={t as any}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ pb: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 2 }}>
            ANALYTICS & ENROLLMENTS
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            Platform Analytics
          </Typography>
        </Box>

        {/* Society Intelligence Table */}
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <AccountTreeRoundedIcon sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>Society Intelligence Data</Typography>
          </Stack>

          {/* New Interactive Master Graph requested in Analytics */}
          <Box sx={{ mb: 5, p: 4, borderRadius: 5, bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 4px 12px rgba(15,23,42,0.03)" }}>
             <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: "#0f172a" }}>Platform-Wide Financial Volume</Typography>
             <Typography variant="body2" sx={{ color: "text.secondary", mb: 4, fontWeight: 700 }}>Aggregated Transaction Velocity (Past 12 Months)</Typography>
             <Box sx={{ height: 320, width: "100%" }}>
                <ResponsiveContainer>
                  <AreaChart data={[{month:"Jan", vol:400},{month:"Feb", vol:300},{month:"Mar", vol:550},{month:"Apr", vol:450},{month:"May", vol:700},{month:"Jun", vol:650}]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: "#64748b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 900 }} />
                    <Area type="monotone" dataKey="vol" stroke="#3b82f6" strokeWidth={4} fill="url(#volColor)" />
                  </AreaChart>
                </ResponsiveContainer>
             </Box>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.12)", boxShadow: "0 4px 20px -8px rgba(15,23,42,0.06)" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  {["Society", "Plan", "Status", "Members", "Accounts", "Agents", "Balance", "Transactions", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 900, color: "#475569", fontSize: "0.85rem", letterSpacing: 1.2, textTransform: "uppercase", whiteSpace: "nowrap", py: 2.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allSocieties.map((society, idx) => (
                  <TableRow
                    key={society.id}
                    sx={{
                      "&:hover": { bgcolor: "rgba(59,130,246,0.05)" },
                      borderBottom: "1px solid rgba(148,163,184,0.15)",
                      transition: "background 150ms"
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 44, height: 44, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6", fontWeight: 900, fontSize: "1rem" }}>
                          {society.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 900, color: "#0f172a" }}>{society.name}</Typography>
                          <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 800 }}>{society.code}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={society.subscriptionPlan}
                        size="medium"
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.8rem",
                          height: 28,
                          bgcolor: society.subscriptionPlan === "PREMIUM" ? alpha("#8b5cf6", 0.15) : alpha("#64748b", 0.1),
                          color: society.subscriptionPlan === "PREMIUM" ? "#7c3aed" : "#475569"
                        }}
                      />
                    </TableCell>
                    <TableCell><StatusChip status={society.status} /></TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>{fmt(society.customers)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>{fmt(society.accounts)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: "#059669" }}>
                        {fmt(society.activeUsers)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: "#0f172a" }}>{fmtCurrency(society.totalBalance)}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={monitoringOverview && monitoringOverview.totals.totalBalance > 0
                            ? Math.min(100, (society.totalBalance / monitoringOverview.totals.totalBalance) * 100)
                            : 0}
                          sx={{
                            height: 6,
                            borderRadius: 6,
                            bgcolor: "rgba(148,163,184,0.2)",
                            "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6", borderRadius: 6 }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>{fmt(society.transactions)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ borderRadius: 3, fontWeight: 900, fontSize: "0.85rem", py: 1, px: 2, bgcolor: "#0f172a" }}
                        onClick={() => router.push("/dashboard/superadmin/societies")}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {allSocieties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 8 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800 }}>No societies found.</Typography>
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
