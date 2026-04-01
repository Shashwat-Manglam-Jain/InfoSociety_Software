"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, Typography, Stack, Box, Alert, Skeleton, Button, TextField,
  Paper, CircularProgress, Divider
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
import { toast } from "@/shared/ui/toast";
import type { AuthUser } from "@/shared/types";

export default function SuperadminSettings() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        router.replace("/login");
        return;
      }
      try {
        const u = await getMe(session.accessToken);
        setUser(u);
      } catch (err) {
        clearSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const customAccessibleModules = useMemo(() => [
      {
        heading: "EXECUTIVE SUITE",
        items: [
          { label: "Portfolio Snapshot", href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }
        ]
      },
      {
        heading: "PLATFORM GOVERNANCE",
        items: [
          { label: "Approvals & Requests", href: "/dashboard/superadmin/approvals", slug: "approvals", icon: <VerifiedUserRoundedIcon /> },
          { label: "Platform Analytics", href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: "Network Explorer", href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: "Report Generation", href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: "System UI Settings", href: "/dashboard/superadmin/settings", slug: "settings", active: true, icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
  ], []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Platform UI configuration updated successfully!");
    }, 1200);
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
             <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
               System Configuration
             </Typography>
          </Stack>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", maxWidth: 800 }}>
            Modify global frontend attributes, brand identifiers, and public-facing text schemas.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff" }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <WebRoundedIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Public Website Content</Typography>
              </Stack>
              
              <Stack spacing={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>Platform Master Name</Typography>
                  <TextField 
                    fullWidth 
                    value={uiConfig.platformName}
                    onChange={(e) => setUiConfig({ ...uiConfig, platformName: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }} 
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>Landing Hero Headline</Typography>
                  <TextField 
                    fullWidth 
                    value={uiConfig.heroHeading}
                    onChange={(e) => setUiConfig({ ...uiConfig, heroHeading: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }} 
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>Landing Hero Subtext</Typography>
                  <TextField 
                    fullWidth 
                    multiline
                    rows={3}
                    value={uiConfig.heroSubtext}
                    onChange={(e) => setUiConfig({ ...uiConfig, heroSubtext: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }} 
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}>Public Support Email</Typography>
                  <TextField 
                    fullWidth 
                    type="email"
                    value={uiConfig.contactEmail}
                    onChange={(e) => setUiConfig({ ...uiConfig, contactEmail: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }} 
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
                    sx={{ py: 1.5, px: 4, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}
                 >
                    {saving ? "Deploying..." : "Publish Settings"}
                 </Button>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
             <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: "1px solid rgba(148,163,184,0.15)", bgcolor: "#f8fafc" }}>
               <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: "#0f172a" }}>Real-time Syncing</Typography>
               <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mb: 3 }}>
                 Changes published here are instantly cached to global CDN endpoints. Society owners and new users will immediately see the updated UI configurations.
               </Typography>
               <Alert severity="warning" sx={{ borderRadius: 3, "& .MuiAlert-message": { fontWeight: 800 } }}>
                 Modifying the Platform Master Name might affect globally issued invoices and terms agreements.
               </Alert>
             </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardShell>
  );
}
