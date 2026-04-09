"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, Typography, Stack, Box, Skeleton, Button, TextField, MenuItem,
  Chip, Avatar, Paper, LinearProgress, Table, TableHead,
  TableRow, TableCell, TableBody, Switch, FormControlLabel
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getSession, clearSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSuperadminCopy } from "@/shared/i18n/superadmin-copy";
import { getSuperadminExtraCopy } from "@/shared/i18n/superadmin-extra-copy";
import type { AuthUser } from "@/shared/types";

const REPORTS = [
  { id: "rp-1", name: "Global Financial Audit", type: "PDF", category: "Audit", generatedAt: "2026-03-31T10:00:00Z", status: "DONE" },
  { id: "rp-2", name: "Active Societies Overview", type: "CSV", category: "Governance", generatedAt: "2026-03-30T15:45:00Z", status: "DONE" },
  { id: "rp-3", name: "Network Agent Activity", type: "XLSX", category: "Operations", generatedAt: "2026-03-29T09:15:00Z", status: "DONE" },
  { id: "rp-4", name: "Platform Risk Analysis", type: "PDF", category: "Audit", generatedAt: "2026-03-31T18:30:00Z", status: "RUNNING" }
];

export default function SuperadminReports() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const navCopy = getSuperadminCopy(locale);
  const copy = getSuperadminExtraCopy(locale);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("all_societies");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function init() {
      const session = getSession();
      if (!session || session.role !== "SUPER_ADMIN") {
        router.replace("/admin");
        return;
      }
      try {
        const u = await getMe(session.accessToken);
        setUser(u);
      } catch {
        clearSession();
        router.replace("/admin");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const customAccessibleModules = useMemo(
    () => [
      {
        heading: navCopy.nav.executiveSuite,
        items: [{ label: navCopy.nav.portfolioSnapshot, href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }]
      },
      {
        heading: navCopy.nav.platformGovernance,
        items: [
          { label: navCopy.nav.approvalsRequests, href: "/dashboard/superadmin/approvals", slug: "approvals", icon: <VerifiedUserRoundedIcon /> },
          { label: navCopy.nav.platformAnalytics, href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: navCopy.nav.networkExplorer, href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: navCopy.nav.reportGeneration, href: "/dashboard/superadmin/reports", slug: "reports", active: true, icon: <AnalyticsRoundedIcon /> },
          { label: navCopy.nav.systemUiSettings, href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
    ],
    [navCopy]
  );

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 2000);
  };

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;

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
            {copy.reports.overline}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            {copy.reports.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}>
            {copy.reports.description}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 1, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff", position: "sticky", top: 100 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: "#0f172a" }}>{copy.reports.generatorTitle}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
                {copy.reports.generatorDescription}
              </Typography>

              <Stack spacing={3}>
                <TextField select fullWidth label={copy.reports.reportType} value={reportType} onChange={(e) => setReportType(e.target.value)} variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontWeight: 700 } }}>
                  <MenuItem value="all_societies" sx={{ fontWeight: 700 }}>{copy.reports.options.allSocieties}</MenuItem>
                  <MenuItem value="pending_audits" sx={{ fontWeight: 700 }}>{copy.reports.options.pendingAudits}</MenuItem>
                  <MenuItem value="financial_audit" sx={{ fontWeight: 700 }}>{copy.reports.options.financialAudit}</MenuItem>
                  <MenuItem value="system_agents" sx={{ fontWeight: 700 }}>{copy.reports.options.systemAgents}</MenuItem>
                  <MenuItem value="custom_matrix" sx={{ fontWeight: 700 }}>{copy.reports.options.customMatrix}</MenuItem>
                </TextField>

                {reportType === "custom_matrix" && (
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, bgcolor: "rgba(15,23,42,0.02)", border: "1px dashed rgba(148,163,184,0.3)" }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, mb: 1.5, display: "block" }}>{copy.reports.customFiltersTitle}</Typography>
                    <Stack spacing={2}>
                      <TextField fullWidth size="small" label={copy.reports.targetSocietyId} placeholder={copy.reports.targetSocietyPlaceholder} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: "#fff", fontWeight: 700 } }} />
                      <TextField fullWidth size="small" label={copy.reports.agentName} placeholder={copy.reports.agentPlaceholder} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }} />
                      <TextField fullWidth size="small" label={copy.reports.clientName} placeholder={copy.reports.clientPlaceholder} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }} />
                      <TextField select fullWidth size="small" label={copy.reports.targetAccountType} defaultValue="ALL" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }}>
                        <MenuItem value="ALL" sx={{ fontWeight: 700 }}>{copy.reports.allAccounts}</MenuItem>
                        <MenuItem value="LOAN" sx={{ fontWeight: 700 }}>{copy.reports.loans}</MenuItem>
                        <MenuItem value="SAVINGS" sx={{ fontWeight: 700 }}>{copy.reports.savings}</MenuItem>
                        <MenuItem value="FIXED_DEPOSIT" sx={{ fontWeight: 700 }}>{copy.reports.fixedDeposits}</MenuItem>
                      </TextField>

                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(148,163,184,0.3)", bgcolor: "#fff" }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.primary" }}>{copy.reports.booleanToggles}</Typography>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{copy.reports.includeInactiveUsers}</Typography>} /></Grid>
                          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{copy.reports.includeClosedLoans}</Typography>} /></Grid>
                          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{copy.reports.embedKycMetadata}</Typography>} /></Grid>
                          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch size="small" defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{copy.reports.pdfHighResolution}</Typography>} /></Grid>
                        </Grid>
                      </Paper>
                    </Stack>
                  </Paper>
                )}

                <Stack direction="row" spacing={2}>
                  <TextField type="date" label={copy.reports.fromDate} fullWidth InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }} />
                  <TextField type="date" label={copy.reports.toDate} fullWidth InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }} />
                </Stack>

                <Button variant="contained" size="large" onClick={handleGenerate} disabled={generating} startIcon={<AnalyticsRoundedIcon />} sx={{ py: 1.5, borderRadius: 3, fontWeight: 900, fontSize: "1rem" }}>
                  {generating ? copy.reports.generating : copy.reports.generate}
                </Button>
                {generating && <LinearProgress sx={{ borderRadius: 4, height: 6 }} />}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ borderRadius: 1, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff", overflow: "hidden" }}>
              <Box sx={{ p: 3, borderBottom: "1px solid rgba(148,163,184,0.12)", bgcolor: "#f8fafc" }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>{copy.reports.jobsTitle}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", mt: 0.5 }}>
                  {copy.reports.jobsDescription}
                </Typography>
              </Box>

              <Table>
                <TableHead>
                  <TableRow>
                    {copy.reports.headers.map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 900, fontSize: "0.75rem", color: "text.secondary" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {REPORTS.map((rp) => (
                    <TableRow key={rp.id} sx={{ "&:hover": { bgcolor: "rgba(15,23,42,0.02)" } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36, bgcolor: rp.type === "PDF" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: rp.type === "PDF" ? "#ef4444" : "#10b981" }}>
                            {rp.type === "PDF" ? <PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} /> : <DescriptionRoundedIcon sx={{ fontSize: 18 }} />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>{rp.name}</Typography>
                            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 800 }}>{rp.type}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={rp.category} size="small" sx={{ fontWeight: 800, fontSize: "0.65rem", bgcolor: alpha("#3b82f6", 0.08), color: "#3b82f6" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(rp.generatedAt).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {rp.status === "DONE" ? (
                          <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
                            {copy.reports.download}
                          </Button>
                        ) : (
                          <Chip label={copy.reports.running} size="small" sx={{ fontWeight: 800, fontSize: "0.65rem", bgcolor: "#fef3c7", color: "#d97706" }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardShell>
  );
}
