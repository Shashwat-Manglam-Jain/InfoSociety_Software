"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, Typography, Stack, Box, Alert, Skeleton, Button, TextField,
  Paper, CircularProgress, Divider
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getSession, clearSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSuperadminSettingsCopy } from "@/shared/i18n/superadmin-settings-copy";
import { toast } from "@/shared/ui/toast";
import type { AuthUser } from "@/shared/types";

export default function SuperadminSettings() {
  const router = useRouter();
  const theme = useTheme();
  const { t, locale } = useLanguage();
  const copy = getSuperadminSettingsCopy(locale);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isDark = theme.palette.mode === "dark";
  const panelBg = alpha(theme.palette.background.paper, isDark ? 0.78 : 0.96);
  const panelBorder = `1px solid ${alpha(theme.palette.divider, isDark ? 0.9 : 1)}`;
  const panelShadow = isDark ? "0 10px 28px rgba(2,6,23,0.42)" : "0 8px 24px -12px rgba(15,23,42,0.08)";
  const pageTitleSx = { fontWeight: 900, color: "text.primary", letterSpacing: "-0.025em", fontSize: { xs: "1.9rem", md: "2.35rem" } } as const;
  const sectionTitleSx = { fontWeight: 900, color: "text.primary", letterSpacing: "-0.02em", fontSize: { xs: "1.2rem", md: "1.45rem" } } as const;

  // Mock initial UI state
  const [uiConfig, setUiConfig] = useState({
    platformName: "Capital Trust Co-operative",
    heroHeading: "Empowering Next-Generation Societies",
    heroSubtext: "Secure, reliable, and compliant financial infrastructure built for institutional growth.",
    contactEmail: "admin@capitaltrust.org"
  });

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
      } catch (err) {
        clearSession();
        router.replace("/admin");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const customAccessibleModules = useMemo(() => [
      {
        heading: copy.modules.headings.executive,
        items: [
          { label: copy.modules.portfolioSnapshot, href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }
        ]
      },
      {
        heading: copy.modules.headings.governance,
        items: [
          { label: copy.modules.approvals, href: "/dashboard/superadmin/approvals", slug: "approvals", icon: <VerifiedUserRoundedIcon /> },
          { label: copy.modules.analytics, href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: copy.modules.networkExplorer, href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: copy.modules.reports, href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: copy.modules.settings, href: "/dashboard/superadmin/settings", slug: "settings", active: true, icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
  ], [copy]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(copy.settings.notifications.success);
    }, 1000);
  };

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;

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
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <SettingsSuggestRoundedIcon sx={{ color: "primary.main", fontSize: 40 }} />
             <Typography variant="h3" sx={pageTitleSx}>
               {copy.settings.title}
             </Typography>
          </Stack>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", maxWidth: 800 }}>
            {copy.settings.description}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 1, border: panelBorder, bgcolor: panelBg, boxShadow: panelShadow }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <WebRoundedIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography variant="h5" sx={sectionTitleSx}>{copy.settings.sections.publicWebsite}</Typography>
              </Stack>
              
              <Stack spacing={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>{copy.settings.fields.platformName}</Typography>
                  <TextField 
                    fullWidth 
                    value={uiConfig.platformName}
                    onChange={(e) => setUiConfig({ ...uiConfig, platformName: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontWeight: 700 } }} 
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>{copy.settings.fields.heroHeading}</Typography>
                  <TextField 
                    fullWidth 
                    value={uiConfig.heroHeading}
                    onChange={(e) => setUiConfig({ ...uiConfig, heroHeading: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontWeight: 700 } }} 
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>{copy.settings.fields.heroSubtext}</Typography>
                  <TextField 
                    fullWidth 
                    multiline
                    rows={3}
                    value={uiConfig.heroSubtext}
                    onChange={(e) => setUiConfig({ ...uiConfig, heroSubtext: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontWeight: 700 } }} 
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>{copy.settings.fields.contactEmail}</Typography>
                  <TextField 
                    fullWidth 
                    type="email"
                    value={uiConfig.contactEmail}
                    onChange={(e) => setUiConfig({ ...uiConfig, contactEmail: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontWeight: 700 } }} 
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 4 }} />

              <Stack direction="row" justifyContent="flex-end">
                 <Button
                    variant="contained"
                    size="large"
                    disabled={saving}
                    onClick={handleSave}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveAltRoundedIcon />}
                    sx={{ py: 1.5, px: 4, borderRadius: 3, fontWeight: 900, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
                 >
                    {saving ? copy.common.deploying : copy.settings.publishButton}
                 </Button>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
             <Paper elevation={0} sx={{ p: 4, borderRadius: 1.5, border: panelBorder, bgcolor: alpha(theme.palette.background.default, isDark ? 0.35 : 0.55), boxShadow: panelShadow }}>
               <Typography variant="h6" sx={sectionTitleSx}>{copy.settings.info.syncTitle}</Typography>
               <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mb: 3 }}>
                 {copy.settings.info.syncDesc}
               </Typography>
               <Alert severity="warning" sx={{ borderRadius: 2, "& .MuiAlert-message": { fontWeight: 800 } }}>
                 {copy.settings.info.nameWarning}
               </Alert>
             </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardShell>
  );
}
