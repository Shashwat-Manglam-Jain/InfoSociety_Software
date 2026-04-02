"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Container, Grid, Typography, Card, CardContent, Stack, Box, Alert, 
  Skeleton, Chip, Button, IconButton, Divider, Avatar, Tooltip
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// Icons
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import DomainIcon from "@mui/icons-material/Domain";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getAgentOverview } from "@/shared/api/administration";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getDashboardCopy } from "@/shared/i18n/dashboard-copy";
import { appBranding } from "@/shared/config/branding";
import type { AuthUser } from "@/shared/types";
import { modules } from "@/features/banking/module-registry";
import { getAccessibleModules } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";

const featuredModuleSlugs = ["customers", "transactions", "accounts", "reports"];

export default function AgentDashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { locale, t } = useLanguage();
  
  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dashboardCopy = useMemo(() => getDashboardCopy(locale), [locale]);

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session || session.role !== "AGENT") {
        router.replace("/login");
        return;
      }

      try {
        const [profile, stats] = await Promise.all([
          getMe(session.accessToken),
          getAgentOverview(session.accessToken)
        ]);
        setUser(profile);
        setOverview(stats);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Load error");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [router]);

  const accountTypeLabel = "Field Operations Agent";

  const accessibleModules = useMemo(
    () => getAccessibleModules(modules, "AGENT").map((m) => localizeBankingModule(m, locale)),
    [locale]
  );

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={accountTypeLabel}
      avatarDataUrl={null}
      onLogout={() => { clearSession(); router.replace("/"); }}
      t={t as any}
      accessibleModules={accessibleModules}
    >
      <Box sx={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        pt: 4, pb: 8 
      }}>
        <Container maxWidth="xl">
          <Stack spacing={4}>
            
            {/* Agent Workstation Header */}
            <Box sx={{ position: "relative" }}>
              <Box sx={{ 
                position: "absolute", 
                top: -60, right: -100, 
                width: 400, height: 400, 
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
                zIndex: 0
              }} />
              
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center" justifyContent="space-between" sx={{ position: "relative", zIndex: 1 }}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip 
                      label="ACTIVE STATION" 
                      size="small" 
                      sx={{ 
                        bgcolor: "#10b981", 
                        color: "#fff", 
                        fontWeight: 800, 
                        px: 1 
                      }} 
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", letterSpacing: 2 }}>
                      {user?.society?.name?.toUpperCase()} · OPERATIVE ID: {user?.id?.substring(0, 8)}
                    </Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>
                    Agent Workstation
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1, maxWidth: 600, fontWeight: 500 }}>
                     Welcome back, {user?.fullName}. You are managing <strong>{overview?.totalClients || 0} allotted members</strong> in your sector today.
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2.5, borderRadius: 5, bgcolor: "#fff", border: "1px solid rgba(16, 185, 129, 0.2)", minWidth: 260, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                   <Stack spacing={1.5}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: "#10b981", textTransform: "uppercase", letterSpacing: 1 }}>Shift Summary</Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                         <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                         <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>₹{(overview?.todayCollection || 0).toLocaleString()}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>COLLECTED TODAY</Typography>
                      <Button fullWidth variant="contained" sx={{ bgcolor: "#10b981", fontWeight: 800, borderRadius: 2.5, "&:hover": { bgcolor: "#059669" } }}>
                         Submit Daily Report
                      </Button>
                   </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Operative Metrics */}
            <Grid container spacing={3}>
              {[
                { label: "Assigned Clients", value: overview?.totalClients || 0, icon: <GroupsRoundedIcon />, color: "#10b981", trend: "Active Registry" },
                { label: "Daily Collections", value: `₹${(overview?.todayCollection || 0).toLocaleString()}`, icon: <PaymentsRoundedIcon />, color: "#3b82f6", trend: "Processed Today" },
                { label: "Pending Tasks", value: "05", icon: <AssignmentTurnedInRoundedIcon />, color: "#f59e0b", trend: "Requires Action" },
                { label: "Shift Performance", value: "94%", icon: <InsightsRoundedIcon />, color: "#8b5cf6", trend: "Efficiency Rating" }
              ].map((m, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card sx={{ 
                    borderRadius: 5, 
                    border: "1px solid rgba(15, 23, 42, 0.05)",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: alpha(m.color, 0.1), color: m.color, display: "flex" }}>
                            {m.icon}
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled" }}>{m.trend.toUpperCase()}</Typography>
                        </Stack>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>{m.value}</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>{m.label}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Main Work Surface */}
            <Grid container spacing={4}>
              {/* Primary Modules */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <WidgetsRoundedIcon sx={{ color: "#10b981" }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Assigned Operations</Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    {accessibleModules.filter(m => featuredModuleSlugs.includes(m.slug)).map((module) => (
                      <Grid size={{ xs: 12, md: 6 }} key={module.slug}>
                        <Card 
                          component={Link}
                          href={`/modules/${module.slug}`}
                          sx={{ 
                            textDecoration: "none",
                            borderRadius: 5, 
                            border: "1px solid rgba(15, 23, 42, 0.05)",
                            transition: "all 300ms ease",
                            "&:hover": { 
                              borderColor: "#10b981",
                              transform: "translateY(-4px)",
                              boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1)"
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2.5} alignItems="center">
                              <Avatar sx={{ 
                                bgcolor: alpha("#10b981", 0.08), 
                                color: "#10b981",
                                width: 56, height: 56,
                                borderRadius: 3
                              }}>
                                <WidgetsRoundedIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                  {module.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500, lineHeight: 1.4 }}>
                                  {module.summary}
                                </Typography>
                              </Box>
                              <IconButton size="small" sx={{ bgcolor: "#f1f5f9" }}>
                                <ArrowForwardRoundedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Field Strategy Map Placeholder */}
                  <Box sx={{ 
                    mt: 2, p: 4, borderRadius: 6, bgcolor: "#0f172a", color: "#fff",
                    backgroundImage: "radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%)"
                  }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
                       <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>Member Coverage Strategy</Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 1, lineHeight: 1.6 }}>
                             Review your assigned geographic area to optimize collection routes and member onboarding sessions.
                          </Typography>
                          <Button variant="contained" sx={{ mt: 3, bgcolor: "#10b981", fontWeight: 800, borderRadius: 2.5 }}>View Interactive Map</Button>
                       </Box>
                       <Avatar sx={{ width: 120, height: 120, bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <DomainIcon sx={{ fontSize: 50, opacity: 0.3 }} />
                       </Avatar>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              {/* Sidebar: Activity & Support */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={4}>
                  {/* Recent Activity Mini-log */}
                  <Card sx={{ borderRadius: 6, border: "1px solid rgba(15, 23, 42, 0.1)", bgcolor: "#fff" }}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                         <HistoryRoundedIcon sx={{ color: "text.disabled" }} />
                         <Typography variant="h6" sx={{ fontWeight: 900 }}>Activity Log</Typography>
                      </Stack>
                      <Stack spacing={3}>
                        {[
                          { title: "Member Payment", time: "12m ago", desc: "Collected ₹500 from Rahul V." },
                          { title: "KYC Verified", time: "45m ago", desc: "Approved Anuj Sharma's ID" },
                          { title: "Station Sync", time: "2h ago", desc: "Synced records with main office" }
                        ].map((log, k) => (
                          <Box key={k} sx={{ position: "relative", pl: 3, "&::before": { content: '""', position: "absolute", left: 0, top: 0, bottom: -12, width: 2, bgcolor: "#f1f5f9" } }}>
                            <Box sx={{ position: "absolute", left: -4, top: 4, width: 10, height: 10, borderRadius: "50%", bgcolor: "#10b981" }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{log.title}</Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 800 }}>{log.time}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>{log.desc}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Support Overlay */}
                  <Box sx={{ p: 4, borderRadius: 6, bgcolor: alpha("#10b981", 0.05), border: "2px solid", borderColor: alpha("#10b981", 0.1) }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#10b981", color: "#fff" }}>
                          <SupportAgentRoundedIcon />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Shift Support</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                        Direct line to your branch manager for overrides and on-field policy clarifications.
                      </Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2.5, fontWeight: 800, bgcolor: "#0f172a" }}>Call Supervisor</Button>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

          </Stack>
        </Container>
      </Box>
    </DashboardShell>
  );
}
