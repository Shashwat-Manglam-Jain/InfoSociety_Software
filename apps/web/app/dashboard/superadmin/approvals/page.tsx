"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Typography, Stack, Box, Alert, Skeleton, Button, Chip, CircularProgress, Tabs, Tab } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getMonitoringOverview, updateSocietyAccess } from "@/shared/api/monitoring";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSuperadminCopy } from "@/shared/i18n/superadmin-copy";
import { getSuperadminExtraCopy } from "@/shared/i18n/superadmin-extra-copy";
import { toast } from "@/shared/ui/toast";
import type { AuthUser, MonitoringOverview } from "@/shared/types";

export default function SuperadminApprovalsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t, locale } = useLanguage();
  const navCopy = getSuperadminCopy(locale);
  const copy = getSuperadminExtraCopy(locale);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const isDark = theme.palette.mode === "dark";
  const panelBg = alpha(theme.palette.background.paper, isDark ? 0.78 : 0.96);
  const panelBorder = `1px solid ${alpha(theme.palette.divider, isDark ? 0.9 : 1)}`;
  const panelShadow = isDark ? "0 10px 28px rgba(2,6,23,0.42)" : "0 8px 24px -12px rgba(15,23,42,0.08)";
  const pageTitleSx = { fontWeight: 900, color: "text.primary", letterSpacing: "-0.025em", fontSize: { xs: "1.9rem", md: "2.35rem" } } as const;
  const sectionTitleSx = { fontWeight: 900, color: "text.primary", letterSpacing: "-0.02em", fontSize: { xs: "1.2rem", md: "1.45rem" } } as const;

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
      setError(caught instanceof Error ? caught.message : copy.approvals.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [router, copy.approvals.loadError]);

  async function handleAction(societyId: string, action: "APPROVE" | "REJECT") {
    const session = getSession();
    if (!session) return;
    setProcessing(societyId);
    try {
      const status = action === "APPROVE" ? "ACTIVE" : "SUSPENDED";
      const response = await updateSocietyAccess(session.accessToken, societyId, { status, isActive: action === "APPROVE" });
      if (action === "APPROVE" && response.provisionedSuperAdmin) {
        toast.success(copy.approvals.provisionedToast.replace("{{username}}", response.provisionedSuperAdmin.username).replace("{{password}}", response.provisionedSuperAdmin.temporaryPassword));
      } else {
        toast.success(action === "APPROVE" ? copy.approvals.approveToast : copy.approvals.rejectToast);
      }
      void loadData();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : copy.approvals.actionFailed);
    } finally {
      setProcessing(null);
    }
  }

  const pendingSocieties = useMemo(() => monitoringOverview?.societies.filter((s) => s.status === "PENDING") ?? [], [monitoringOverview]);
  const rejectedSocieties = useMemo(() => monitoringOverview?.societies.filter((s) => s.status === "SUSPENDED") ?? [], [monitoringOverview]);

  const customAccessibleModules = useMemo(
    () => [
      {
        heading: navCopy.nav.executiveSuite,
        items: [{ label: navCopy.nav.portfolioSnapshot, href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }]
      },
      {
        heading: navCopy.nav.platformGovernance,
        items: [
          { label: navCopy.nav.approvalsRequests, href: "/dashboard/superadmin/approvals", slug: "approvals", active: true, badge: pendingSocieties.length > 0 ? String(pendingSocieties.length) : undefined, icon: <VerifiedUserRoundedIcon /> },
          { label: navCopy.nav.platformAnalytics, href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: navCopy.nav.networkExplorer, href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: navCopy.nav.reportGeneration, href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: navCopy.nav.systemUiSettings, href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [navCopy, pendingSocieties.length]
  );

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const displayList = activeTab === 0 ? pendingSocieties : rejectedSocieties;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={t("account.platform")}
      avatarDataUrl={null}
      onLogout={() => { clearSession(); router.replace("/"); }}
      t={t as never}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ pb: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 2 }}>
            {copy.approvals.overline}
          </Typography>
          <Typography variant="h3" sx={pageTitleSx}>
            {copy.approvals.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}>
            {copy.approvals.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, isDark ? 0.8 : 1)}` }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label={copy.approvals.pendingTab.replace("{{count}}", String(pendingSocieties.length))} sx={{ fontWeight: 900, textTransform: "none", fontSize: { xs: "0.92rem", md: "1rem" } }} />
            <Tab label={copy.approvals.rejectedTab.replace("{{count}}", String(rejectedSocieties.length))} sx={{ fontWeight: 900, textTransform: "none", fontSize: { xs: "0.92rem", md: "1rem" } }} />
          </Tabs>
        </Box>

        {displayList.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center", borderRadius: 1, border: `1px dashed ${alpha(theme.palette.divider, 0.7)}`, bgcolor: alpha(theme.palette.background.paper, isDark ? 0.35 : 0.55) }}>
            <VerifiedUserRoundedIcon sx={{ fontSize: 64, color: alpha(theme.palette.text.secondary, 0.28), mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 800 }}>{copy.approvals.noRequestsTitle}</Typography>
            <Typography variant="body2" sx={{ color: "text.disabled", mt: 1 }}>{activeTab === 0 ? copy.approvals.noPending : copy.approvals.noRejected}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayList.map((society) => (
              <Grid size={{ xs: 12, lg: 6 }} key={society.id}>
                <Box sx={{ p: 4, borderRadius: 2, bgcolor: panelBg, border: activeTab === 0 ? `2px solid ${alpha(theme.palette.warning.main, 0.4)}` : `2px solid ${alpha(theme.palette.error.main, 0.35)}`, boxShadow: panelShadow }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: activeTab === 0 ? "warning.main" : "error.main", fontWeight: 900, letterSpacing: 1.5 }}>
                          {copy.approvals.societyId}: {society.code}
                        </Typography>
                        <Chip label={society.subscriptionPlan} size="small" sx={{ bgcolor: activeTab === 0 ? "warning.main" : "error.main", color: theme.palette.common.white, fontWeight: 900, height: 18 }} />
                      </Stack>
                      <Typography variant="h5" sx={sectionTitleSx}>{society.name}</Typography>
                      <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 800 }}>{copy.approvals.proposedMembers}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{society.customers}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 800 }}>{copy.approvals.initialAccounts}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{society.accounts}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Stack spacing={1.5}>
                      {activeTab === 0 ? (
                        <>
                          <Button variant="contained" disabled={processing === society.id} onClick={() => handleAction(society.id, "APPROVE")} sx={{ py: 1, px: 3, borderRadius: 2, fontWeight: 900, bgcolor: "success.main", boxShadow: "none", "&:hover": { bgcolor: "success.dark" } }}>
                            {processing === society.id ? <CircularProgress size={20} color="inherit" /> : copy.approvals.approve}
                          </Button>
                          <Button variant="outlined" disabled={processing === society.id} onClick={() => handleAction(society.id, "REJECT")} sx={{ py: 1, px: 3, borderRadius: 2, fontWeight: 800, borderColor: alpha(theme.palette.error.main, 0.5), color: "error.main", "&:hover": { bgcolor: alpha(theme.palette.error.main, isDark ? 0.18 : 0.08), borderColor: "error.main" } }}>
                            {copy.approvals.reject}
                          </Button>
                        </>
                      ) : (
                        <Button variant="contained" disabled={processing === society.id} onClick={() => handleAction(society.id, "APPROVE")} sx={{ py: 1, px: 3, borderRadius: 3, fontWeight: 900, bgcolor: "primary.main", boxShadow: "none", "&:hover": { bgcolor: "primary.dark" } }}>
                          {processing === society.id ? <CircularProgress size={20} color="inherit" /> : copy.approvals.reevaluate}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardShell>
  );
}
