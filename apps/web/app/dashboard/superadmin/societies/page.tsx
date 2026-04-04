"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getMonitoringOverview, updateSocietyAccess } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { toast } from "@/shared/ui/toast";
import type { AuthUser, MonitoringOverview } from "@/shared/types";

type OverviewSociety = MonitoringOverview["societies"][number];

function fmt(value: number) {
  return value.toLocaleString("en-IN");
}

function fmtCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${fmt(value)}`;
}

function statusStyles(status: OverviewSociety["status"]) {
  if (status === "ACTIVE") {
    return { bgcolor: alpha("#10b981", 0.12), color: "#047857" };
  }

  if (status === "SUSPENDED") {
    return { bgcolor: alpha("#ef4444", 0.12), color: "#b91c1c" };
  }

  return { bgcolor: alpha("#f59e0b", 0.12), color: "#b45309" };
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 2, borderRadius: 3, bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.15)" }}>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.4, color: "#0f172a", fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function SuperadminSocietiesExplorer() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(null);
  const [processingSocietyId, setProcessingSocietyId] = useState<string | null>(null);

  async function loadData() {
    const session = getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      router.replace("/admin");
      return;
    }

    setError(null);

    try {
      const [profile, monitoringOverview] = await Promise.all([
        getMe(session.accessToken),
        getMonitoringOverview(session.accessToken)
      ]);

      setUser(profile);
      setOverview(monitoringOverview);
    } catch (caught) {
      const status = (caught as { status?: number })?.status;
      const message = caught instanceof Error ? caught.message : "Unable to load the live society network.";

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
  }, [router]);

  const pendingCount = useMemo(
    () => overview?.societies.filter((society) => society.status === "PENDING").length ?? 0,
    [overview]
  );

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
          {
            label: "Approvals & Requests",
            href: "/dashboard/superadmin/approvals",
            slug: "approvals",
            badge: pendingCount > 0 ? String(pendingCount) : undefined,
            icon: <VerifiedUserRoundedIcon />
          },
          { label: "Platform Analytics", href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: "Network Explorer", href: "/dashboard/superadmin/societies", slug: "societies", active: true, icon: <BusinessCenterRoundedIcon /> },
          { label: "Report Generation", href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: "System UI Settings", href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [pendingCount]
  );

  const allSocieties = overview?.societies ?? [];
  const filteredSocieties = useMemo(
    () =>
      allSocieties.filter(
        (society) =>
          society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          society.code.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allSocieties, searchQuery]
  );
  const selectedSociety = useMemo(
    () => allSocieties.find((society) => society.id === selectedSocietyId) ?? null,
    [allSocieties, selectedSocietyId]
  );

  async function handleAccessChange(society: OverviewSociety, status: "ACTIVE" | "SUSPENDED", isActive: boolean) {
    const session = getSession();
    if (!session) {
      return;
    }

    setProcessingSocietyId(society.id);

    try {
      const response = await updateSocietyAccess(session.accessToken, society.id, { status, isActive });
      if (status === "ACTIVE" && response.provisionedSuperAdmin) {
        toast.success(
          `${society.name} is now approved. Recovery admin @${response.provisionedSuperAdmin.username} was created with temporary password ${response.provisionedSuperAdmin.temporaryPassword}.`
        );
      } else {
        toast.success(status === "ACTIVE" ? `${society.name} is now approved.` : `${society.name} has been suspended.`);
      }
      await loadData();
      setSelectedSocietyId(society.id);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update society access.");
    } finally {
      setProcessingSocietyId(null);
    }
  }

  if (loading) {
    return <Skeleton variant="rectangular" height="100vh" />;
  }

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={t("account.platform")}
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      t={t as any}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ pb: 8 }}>
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
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 2 }}>
            LIVE NETWORK DATA
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            Network Explorer
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, maxWidth: 840 }}>
            This view is driven by the monitoring API. Search societies, inspect approval state, and review live operational totals without any mock hierarchy.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
          <Chip label={`${fmt(allSocieties.length)} societies in monitoring scope`} sx={{ fontWeight: 900, width: "fit-content" }} />
          <Chip label={`${fmt(pendingCount)} pending approvals`} color={pendingCount > 0 ? "warning" : "default"} sx={{ fontWeight: 900, width: "fit-content" }} />
        </Stack>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
            <Box sx={{ maxWidth: 440, width: "100%" }}>
              <TextField
                fullWidth
                placeholder="Search societies by name or code..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.disabled" }} />,
                  sx: { borderRadius: 3, bgcolor: "#f8fafc", "& fieldset": { border: "none" } }
                }}
                size="small"
              />
            </Box>
            <Button variant="outlined" sx={{ borderRadius: 3, fontWeight: 800 }} onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 780 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(15,23,42,0.02)" }}>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Society</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Users</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Customers</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Accounts</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSocieties.map((society) => (
                  <TableRow
                    key={society.id}
                    hover
                    onClick={() => setSelectedSocietyId(society.id)}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "rgba(59,130,246,0.04)" } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6", fontWeight: 900 }}>
                          {society.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            {society.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                            {society.registrationState ?? "Region not provided"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", color: "#64748b" }}>
                        {society.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={society.status} size="small" sx={{ height: 24, fontSize: "0.7rem", fontWeight: 900, ...statusStyles(society.status) }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmt(society.activeUsers)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmt(society.customers)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmt(society.accounts)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmtCurrency(society.totalBalance)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="text" size="small" sx={{ fontWeight: 800, textTransform: "none" }}>
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSocieties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No societies found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(selectedSocietyId)}
        onClose={() => setSelectedSocietyId(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 620 }, p: { xs: 3, md: 4 }, bgcolor: "#f8fafc" } }}
      >
        {selectedSociety ? (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 3 }}>
                  SOCIETY ID: {selectedSociety.code}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mt: 1, letterSpacing: "-0.03em" }}>
                  {selectedSociety.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                  <Chip label={selectedSociety.status} sx={{ fontWeight: 900, ...statusStyles(selectedSociety.status) }} />
                  <Chip label={`${selectedSociety.subscriptionPlan} Plan`} sx={{ fontWeight: 900 }} />
                  <Chip label={selectedSociety.subscriptionStatus} sx={{ fontWeight: 900 }} />
                </Stack>
              </Box>
              <IconButton size="large" onClick={() => setSelectedSocietyId(null)} sx={{ bgcolor: "rgba(15,23,42,0.05)" }}>
                <CloseRoundedIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Stack>

            {selectedSociety.status !== "ACTIVE" ? (
              <Alert severity={selectedSociety.status === "SUSPENDED" ? "error" : "warning"} sx={{ mb: 3, borderRadius: 3 }}>
                {selectedSociety.status === "PENDING"
                  ? "This society is still waiting for platform approval."
                  : "This society is currently suspended and its users should not be able to log in."}
              </Alert>
            ) : null}

            <Box sx={{ mb: 4, p: 3, borderRadius: 4, bgcolor: "#fff", border: "1px solid rgba(15,23,42,0.08)" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {selectedSociety.status === "ACTIVE" ? (
                  <Button
                    variant="contained"
                    color="error"
                    disabled={processingSocietyId === selectedSociety.id}
                    onClick={() => void handleAccessChange(selectedSociety, "SUSPENDED", false)}
                    sx={{ flex: 1, fontWeight: 900, borderRadius: 3, boxShadow: "none" }}
                    startIcon={<WarningAmberRoundedIcon />}
                  >
                    {processingSocietyId === selectedSociety.id ? "Updating..." : "Suspend Society"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={processingSocietyId === selectedSociety.id}
                    onClick={() => void handleAccessChange(selectedSociety, "ACTIVE", true)}
                    sx={{ flex: 1, fontWeight: 900, borderRadius: 3, boxShadow: "none", bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
                    startIcon={<VerifiedUserRoundedIcon />}
                  >
                    {processingSocietyId === selectedSociety.id ? "Updating..." : "Approve Society"}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  sx={{ flex: 1, fontWeight: 900, borderRadius: 3 }}
                  onClick={() => router.push(selectedSociety.status === "PENDING" ? "/dashboard/superadmin/approvals" : "/dashboard/superadmin/analytics")}
                >
                  {selectedSociety.status === "PENDING" ? "Open Approval Queue" : "Open Analytics"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>
              Live Metrics
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { label: "Users", value: fmt(selectedSociety.activeUsers) },
                { label: "Customers", value: fmt(selectedSociety.customers) },
                { label: "Accounts", value: fmt(selectedSociety.accounts) },
                { label: "Transactions", value: fmt(selectedSociety.transactions) },
                { label: "Total Balance", value: fmtCurrency(selectedSociety.totalBalance) },
                { label: "Payment Volume", value: fmtCurrency(selectedSociety.successfulPaymentVolume) }
              ].map((metric) => (
                <Grid size={{ xs: 12, sm: 6 }} key={metric.label}>
                  <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: "#fff", border: "1px solid rgba(148,163,184,0.15)" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 0.6, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
                      {metric.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>
              API-backed Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Registration State" value={selectedSociety.registrationState ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Registration Number" value={selectedSociety.registrationNumber ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Registration Authority" value={selectedSociety.registrationAuthority ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Category" value={selectedSociety.category ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Billing Email" value={selectedSociety.billingEmail ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Billing Phone" value={selectedSociety.billingPhone ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailItem label="Billing Address" value={selectedSociety.billingAddress ?? "Not provided"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="Digital Payments" value={selectedSociety.acceptsDigitalPayments ? "Enabled" : "Disabled"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="UPI ID" value={selectedSociety.upiId ?? "Not provided"} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
              This drawer now shows only values returned by the monitoring API. Branches, agents, and account trees are intentionally not mocked here anymore.
            </Typography>
          </Box>
        ) : null}
      </Drawer>
    </DashboardShell>
  );
}
