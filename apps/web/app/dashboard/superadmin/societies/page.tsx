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
import { getSuperadminNetworkExplorerCopy } from "@/shared/i18n/superadmin-network-explorer-copy";
import { toast } from "@/shared/ui/toast";
import type { AuthUser, MonitoringOverview } from "@/shared/types";

type OverviewSociety = MonitoringOverview["societies"][number];

function fmt(value: number, localeTag = "en-IN") {
  return value.toLocaleString(localeTag);
}

function fmtCurrency(value: number, localeTag: string) {
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
  const { t, locale } = useLanguage();
  const copy = getSuperadminNetworkExplorerCopy(locale);
  const localeTag = copy.localeTag;
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
      const message = caught instanceof Error ? caught.message : copy.page.messages.loadError;

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
        heading: copy.nav.executiveSuite,
        items: [
          { label: copy.nav.portfolioSnapshot, href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }
        ]
      },
      {
        heading: copy.nav.platformGovernance,
        items: [
          {
            label: copy.nav.approvalsRequests,
            href: "/dashboard/superadmin/approvals",
            slug: "approvals",
            badge: pendingCount > 0 ? String(pendingCount) : undefined,
            icon: <VerifiedUserRoundedIcon />
          },
          { label: copy.nav.platformAnalytics, href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: copy.nav.networkExplorer, href: "/dashboard/superadmin/societies", slug: "societies", active: true, icon: <BusinessCenterRoundedIcon /> },
          { label: copy.nav.reportGeneration, href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: copy.nav.systemUiSettings, href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [copy, pendingCount]
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
          copy.page.messages.recoveryAdminCreated
            .replace("{{name}}", society.name)
            .replace("{{username}}", response.provisionedSuperAdmin.username)
            .replace("{{password}}", response.provisionedSuperAdmin.temporaryPassword)
        );
      } else {
        toast.success(
          (status === "ACTIVE" ? copy.page.messages.approveSuccess : copy.page.messages.suspendSuccess).replace("{{name}}", society.name)
        );
      }
      await loadData();
      setSelectedSocietyId(society.id);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : copy.page.messages.updateAccessError);
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
                {copy.page.retry}
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 2 }}>
            {copy.page.eyebrow}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            {copy.page.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, maxWidth: 840 }}>
            {copy.page.description}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
          <Chip label={copy.page.societiesInScope.replace("{{count}}", fmt(allSocieties.length, localeTag))} sx={{ fontWeight: 900, width: "fit-content" }} />
          <Chip label={copy.page.pendingApprovals.replace("{{count}}", fmt(pendingCount, localeTag))} color={pendingCount > 0 ? "warning" : "default"} sx={{ fontWeight: 900, width: "fit-content" }} />
        </Stack>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
            <Box sx={{ maxWidth: 440, width: "100%" }}>
              <TextField
                fullWidth
                placeholder={copy.page.searchPlaceholder}
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
              {copy.page.clearSearch}
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 780 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(15,23,42,0.02)" }}>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.society}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.code}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.status}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.users}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.customers}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.accounts}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>{copy.page.table.balance}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }} align="right">
                    {copy.page.table.actions}
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
                            {society.registrationState ?? copy.page.table.regionNotProvided}
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
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmt(society.activeUsers, localeTag)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmt(society.customers, localeTag)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmt(society.accounts, localeTag)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{fmtCurrency(society.totalBalance, localeTag)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="text" size="small" sx={{ fontWeight: 800, textTransform: "none" }}>
                        {copy.page.table.inspect}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSocieties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {copy.page.table.noResults}
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
                  {copy.page.drawer.societyId}: {selectedSociety.code}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mt: 1, letterSpacing: "-0.03em" }}>
                  {selectedSociety.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                  <Chip label={selectedSociety.status} sx={{ fontWeight: 900, ...statusStyles(selectedSociety.status) }} />
                  <Chip label={`${selectedSociety.subscriptionPlan} ${copy.page.drawer.planSuffix}`} sx={{ fontWeight: 900 }} />
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
                  ? copy.page.drawer.pendingAlert
                  : copy.page.drawer.suspendedAlert}
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
                    {processingSocietyId === selectedSociety.id ? copy.page.drawer.updating : copy.page.drawer.suspendSociety}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={processingSocietyId === selectedSociety.id}
                    onClick={() => void handleAccessChange(selectedSociety, "ACTIVE", true)}
                    sx={{ flex: 1, fontWeight: 900, borderRadius: 3, boxShadow: "none", bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
                    startIcon={<VerifiedUserRoundedIcon />}
                  >
                    {processingSocietyId === selectedSociety.id ? copy.page.drawer.updating : copy.page.drawer.approveSociety}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  sx={{ flex: 1, fontWeight: 900, borderRadius: 3 }}
                  onClick={() => router.push(selectedSociety.status === "PENDING" ? "/dashboard/superadmin/approvals" : "/dashboard/superadmin/analytics")}
                >
                  {selectedSociety.status === "PENDING" ? copy.page.drawer.openApprovalQueue : copy.page.drawer.openAnalytics}
                </Button>
              </Stack>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>
              {copy.page.drawer.liveMetrics}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { label: copy.page.table.users, value: fmt(selectedSociety.activeUsers, localeTag) },
                { label: copy.page.table.customers, value: fmt(selectedSociety.customers, localeTag) },
                { label: copy.page.table.accounts, value: fmt(selectedSociety.accounts, localeTag) },
                { label: copy.page.drawer.transactions, value: fmt(selectedSociety.transactions, localeTag) },
                { label: copy.page.drawer.totalBalance, value: fmtCurrency(selectedSociety.totalBalance, localeTag) },
                { label: copy.page.drawer.paymentVolume, value: fmtCurrency(selectedSociety.successfulPaymentVolume, localeTag) }
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
              {copy.page.drawer.apiBackedDetails}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.registrationState} value={selectedSociety.registrationState ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.registrationNumber} value={selectedSociety.registrationNumber ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.registrationAuthority} value={selectedSociety.registrationAuthority ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.category} value={selectedSociety.category ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.billingEmail} value={selectedSociety.billingEmail ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.billingPhone} value={selectedSociety.billingPhone ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailItem label={copy.page.drawer.billingAddress} value={selectedSociety.billingAddress ?? copy.page.drawer.notProvided} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.digitalPayments} value={selectedSociety.acceptsDigitalPayments ? copy.page.drawer.enabled : copy.page.drawer.disabled} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label={copy.page.drawer.upiId} value={selectedSociety.upiId ?? copy.page.drawer.notProvided} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
              {copy.page.drawer.footer}
            </Typography>
          </Box>
        ) : null}
      </Drawer>
    </DashboardShell>
  );
}
