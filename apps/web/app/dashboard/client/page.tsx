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
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SouthEastRoundedIcon from "@mui/icons-material/SouthEastRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getCustomerMe } from "@/shared/api/customers";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getDashboardCopy } from "@/shared/i18n/dashboard-copy";
import { appBranding } from "@/shared/config/branding";
import type { AuthUser } from "@/shared/types";
import { modules } from "@/features/banking/module-registry";
import { getAccessibleModules } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";

const featuredModuleSlugs = ["accounts", "deposits", "loans", "transactions"];

export default function ClientDashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { locale, t } = useLanguage();
  
  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dashboardCopy = useMemo(() => getDashboardCopy(locale), [locale]);

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session || session.role !== "CLIENT") {
        router.replace("/login");
        return;
      }

      try {
        const [userMe, custMe] = await Promise.all([
          getMe(session.accessToken),
          getCustomerMe(session.accessToken)
        ]);
        setUser(userMe);
        setProfile(custMe);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Load error");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [router]);

  const accountTypeLabel = "Verified Member";

  const accessibleModules = useMemo(
    () => getAccessibleModules(modules, "CLIENT").map((m) => localizeBankingModule(m, locale)),
    [locale]
  );

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const stats = profile?.dashboardStats || { totalInvested: 0, interestEarned: 0, totalWithdrawn: 0, netBalance: 0 };
  const agent = profile?.allottedAgent;

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
            
            {/* Member Vault Header */}
            <Box sx={{ position: "relative" }}>
              <Box sx={{ 
                position: "absolute", 
                top: -60, right: -100, 
                width: 400, height: 400, 
                background: "radial-gradient(circle, rgba(30, 58, 138, 0.05) 0%, transparent 70%)",
                zIndex: 0
              }} />
              
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center" justifyContent="space-between" sx={{ position: "relative", zIndex: 1 }}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip 
                      label="PERSONAL VAULT" 
                      size="small" 
                      sx={{ 
                        bgcolor: "#1e3a8a", 
                        color: "#fff", 
                        fontWeight: 800, 
                        px: 1 
                      }} 
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", letterSpacing: 2 }}>
                      {user?.society?.name?.toUpperCase()} · MEMBER ID: {profile?.customerCode || "PENDING"}
                    </Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>
                    Welcome, {user?.fullName?.split(" ")[0]}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1, maxWidth: 600, fontWeight: 500 }}>
                     Securely managing your financial relationship with <strong>{user?.society?.name}</strong>. Access your accounts, verify deposits, and track your growth.
                  </Typography>
                </Box>
                
                {agent && (
                  <Box sx={{ p: 2, borderRadius: 5, bgcolor: "#fff", border: "1px solid rgba(139, 92, 246, 0.2)", minWidth: 280, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha("#8b5cf6", 0.1), color: "#8b5cf6" }}><SupportAgentRoundedIcon /></Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "#8b5cf6", textTransform: "uppercase" }}>Relationship Officer</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{agent.firstName} {agent.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{agent.phone || "On Call Duty"}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Financial Performance Metrics */}
            <Grid container spacing={3}>
              {[
                { label: "Total Investment", value: `₹${stats.totalInvested.toLocaleString()}`, icon: <AccountBalanceWalletRoundedIcon />, color: "#1e3a8a", trend: "All Time" },
                { label: "Interest Earned", value: `₹${stats.interestEarned.toLocaleString()}`, icon: <TrendingUpRoundedIcon />, color: "#10b981", trend: "Accrued" },
                { label: "Total Withdrawals", value: `₹${stats.totalWithdrawn.toLocaleString()}`, icon: <SouthEastRoundedIcon />, color: "#ef4444", trend: "Debited" },
                { label: "Current Balance", value: `₹${stats.netBalance.toLocaleString()}`, icon: <ShieldRoundedIcon />, color: "#f59e0b", trend: "Net Portfolio" }
              ].map((m, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card sx={{ 
                    borderRadius: 5, 
                    border: "1px solid rgba(15, 23, 42, 0.05)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
                    transition: "transform 200ms ease",
                    "&:hover": { transform: "translateY(-4px)" }
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

            {/* Main Content Area */}
            <Grid container spacing={4}>
              {/* Financial Modules */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AccountBalanceIcon sx={{ color: "#1e3a8a" }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Financial Services</Typography>
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
                              borderColor: "#1e3a8a",
                              transform: "translateY(-4px)",
                              boxShadow: "0 20px 25px -5px rgba(30, 58, 138, 0.1)"
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2.5} alignItems="center">
                              <Avatar sx={{ 
                                bgcolor: alpha("#1e3a8a", 0.08), 
                                color: "#1e3a8a",
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

                  {/* Account Highlights Table */}
                  <Card sx={{ borderRadius: 6, border: "1px solid rgba(15, 23, 42, 0.06)" }}>
                    <Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>Active Portfolios</Typography>
                    </Box>
                    <Box sx={{ overflowX: "auto" }}>
                      <Stack divider={<Divider />}>
                        {profile?.accounts?.map((acc: any) => (
                          <Box key={acc.id} sx={{ p: 2.5, "&:hover": { bgcolor: "#f8fafc" } }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{acc.type.replace("_", " ")}</Typography>
                                <Typography variant="caption" color="text.secondary">{acc.accountNumber}</Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>₹{acc.currentBalance.toLocaleString()}</Typography>
                                <Chip label="ACTIVE" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }} />
                              </Box>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Card>
                </Stack>
              </Grid>

              {/* Sidebar: Institution & Support */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={4}>
                  {/* Digital Pass Card */}
                  <Card sx={{ 
                    borderRadius: 6, 
                    background: "linear-gradient(225deg, #1e3a8a 0%, #172554 100%)",
                    color: "#fff",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <Box sx={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, bgcolor: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.5, letterSpacing: 1 }}>VIRTUAL MEMBERSHIP</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>{user?.fullName}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>{profile?.customerCode || "MEM-00000"}</Typography>
                      
                      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" sx={{ display: "block", opacity: 0.5 }}>VALID AT</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>ALL BRANCHES</Typography>
                        </Box>
                        <ShieldRoundedIcon sx={{ opacity: 0.2, fontSize: 40 }} />
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Institution Support */}
                  <Box sx={{ p: 4, borderRadius: 6, bgcolor: alpha("#1e3a8a", 0.05), border: "2px solid", borderColor: alpha("#1e3a8a", 0.1) }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#1e3a8a", color: "#fff" }}>
                          <ContactMailOutlinedIcon />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Member Support</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                        Have questions about your accounts or society policies? Reach out to your local branch or contact our central support.
                      </Typography>
                      <Button variant="contained" fullWidth sx={{ borderRadius: 2.5, fontWeight: 800, bgcolor: "#0f172a" }}>Contact Society</Button>
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
