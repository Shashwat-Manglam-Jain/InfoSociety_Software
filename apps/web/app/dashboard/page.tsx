"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { ModuleCard } from "@/components/ui/module-card";
import { AdsenseBanner } from "@/components/ads/adsense-banner";
import { modules } from "@/features/banking/module-registry";
import { cancelPremium, getMe, getMonitoringOverview, getMySubscription, getUserDirectory, upgradeToPremium } from "@/shared/api/client";
import { clearSession, getSession, setSession } from "@/shared/auth/session";
import type { AuthUser, MonitoringOverview } from "@/shared/types";

type DirectoryUser = Awaited<ReturnType<typeof getUserDirectory>>[number];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState<"upgrade" | "cancel" | null>(null);

  useEffect(() => {
    async function loadData() {
      const session = getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getMe(session.accessToken);
        const subscription = profile.subscription ?? (await getMySubscription(session.accessToken));
        const profileWithSubscription: AuthUser = {
          ...profile,
          subscription
        };
        setUser(profileWithSubscription);
        setSession({
          ...session,
          subscriptionPlan: subscription.plan
        });

        if (profile.role === "SUPER_USER" || profile.role === "AGENT") {
          const [monitoring, users] = await Promise.all([
            getMonitoringOverview(session.accessToken),
            getUserDirectory(session.accessToken)
          ]);
          setOverview(monitoring);
          setDirectory(users);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router]);

  const greeting = useMemo(() => {
    if (!user) {
      return "Welcome";
    }

    return `Welcome, ${user.fullName}`;
  }, [user]);

  function onLogout() {
    clearSession();
    router.replace("/login");
  }

  function syncSessionPlan(plan: "FREE" | "PREMIUM") {
    const session = getSession();
    if (!session) {
      return;
    }

    setSession({
      ...session,
      subscriptionPlan: plan
    });
  }

  async function onUpgradeToPremium() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      setActionError(null);
      setBillingNotice(null);
      setBillingBusy("upgrade");
      const result = await upgradeToPremium(session.accessToken);
      setUser((previous) =>
        previous
          ? {
              ...previous,
              subscription: result.subscription
            }
          : previous
      );
      syncSessionPlan(result.subscription.plan);
      setBillingNotice(result.message);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to upgrade plan");
    } finally {
      setBillingBusy(null);
    }
  }

  async function onCancelPremium() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      setActionError(null);
      setBillingNotice(null);
      setBillingBusy("cancel");
      const result = await cancelPremium(session.accessToken);
      setUser((previous) =>
        previous
          ? {
              ...previous,
              subscription: result.subscription
            }
          : previous
      );
      syncSessionPlan(result.subscription.plan);
      setBillingNotice(result.message);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to cancel premium");
    } finally {
      setBillingBusy(null);
    }
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh" spacing={1}>
        <CircularProgress />
        <Typography>Loading dashboard...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const isPremium = user?.subscription?.plan === "PREMIUM";
  const showAds = !isPremium;

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#003f6b" }}>
        <Toolbar>
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: "#ff7a00" }}>I</Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
                Infopath Banking
              </Typography>
              <Typography variant="caption" sx={{ color: "#d4ecff" }}>
                {user?.role ?? "-"}
              </Typography>
            </Box>
          </Stack>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Card className="surface-glass fade-rise" sx={{ mb: 2, overflow: "hidden" }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1}>
                  <Typography variant="h5">{greeting}</Typography>
                  <Typography color="text.secondary">
                    Manage banking operations, monitor society activity, and execute module workflows in one place.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`Role: ${user?.role ?? "-"}`} color="primary" />
                    <Chip label={`Society: ${user?.society?.name ?? "Global"}`} variant="outlined" />
                    {user?.customerProfile?.customerCode ? (
                      <Chip label={`Customer: ${user.customerProfile.customerCode}`} color="secondary" />
                    ) : null}
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ width: "100%", maxWidth: 320, ml: "auto" }}>
                  <Image
                    src="/illustrations/insights-panel.svg"
                    alt="Illustration of monitoring dashboard"
                    width={760}
                    height={500}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="surface-glass" sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6">Subscription</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Plan: ${user?.subscription?.plan ?? "FREE"}`} color={isPremium ? "success" : "default"} />
                <Chip label={`Status: ${user?.subscription?.status ?? "ACTIVE"}`} variant="outlined" />
                <Chip
                  label={`Monthly: ₹${user?.subscription?.monthlyPrice ?? 0}`}
                  color="primary"
                  variant="outlined"
                />
                {user?.subscription?.nextBillingDate ? (
                  <Chip
                    label={`Next Billing: ${new Date(user.subscription.nextBillingDate).toLocaleDateString()}`}
                    variant="outlined"
                  />
                ) : null}
                {user?.subscription?.cancelAtPeriodEnd ? (
                  <Chip label="Cancellation Scheduled" color="warning" />
                ) : null}
              </Stack>
              {billingNotice ? <Alert severity="success">{billingNotice}</Alert> : null}
              {actionError ? <Alert severity="error">{actionError}</Alert> : null}
              {user && user.role !== "SUPER_USER" ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  {!isPremium ? (
                    <Button variant="contained" onClick={onUpgradeToPremium} disabled={billingBusy !== null}>
                      {billingBusy === "upgrade" ? "Upgrading..." : "Upgrade to Premium"}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={onCancelPremium}
                      disabled={billingBusy !== null || user?.subscription?.cancelAtPeriodEnd}
                    >
                      {billingBusy === "cancel" ? "Scheduling..." : "Cancel Premium at Period End"}
                    </Button>
                  )}
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        {overview ? (
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Societies</Typography>
                  <Typography variant="h4">{overview.totals.societies}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Customers</Typography>
                  <Typography variant="h4">{overview.totals.customers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Accounts</Typography>
                  <Typography variant="h4">{overview.totals.accounts}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Transactions</Typography>
                  <Typography variant="h4">{overview.totals.transactions}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {showAds ? (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1.2}>
                Sponsored
              </Typography>
              <AdsenseBanner />
            </CardContent>
          </Card>
        ) : null}

        {overview ? (
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={1.2}>
                    Society Monitoring
                  </Typography>
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Society</TableCell>
                          <TableCell>Users</TableCell>
                          <TableCell>Customers</TableCell>
                          <TableCell>Accounts</TableCell>
                          <TableCell>Transactions</TableCell>
                          <TableCell>Total Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {overview.societies.map((society) => (
                          <TableRow key={society.id}>
                            <TableCell>{society.name}</TableCell>
                            <TableCell>{society.activeUsers}</TableCell>
                            <TableCell>{society.customers}</TableCell>
                            <TableCell>{society.accounts}</TableCell>
                            <TableCell>{society.transactions}</TableCell>
                            <TableCell>{society.totalBalance.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={1.2}>
                    User Role Mix
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(overview.userRoleBreakdown).map(([key, value]) => (
                      <Stack key={key} direction="row" justifyContent="space-between">
                        <Typography>{key}</Typography>
                        <Chip size="small" label={value} color="primary" variant="outlined" />
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {directory.length > 0 ? (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" mb={1.2}>
                User Directory
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Society</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {directory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.fullName}</TableCell>
                        <TableCell>{item.role}</TableCell>
                        <TableCell>{item.society?.name ?? "Global"}</TableCell>
                        <TableCell>{item.isActive ? "Active" : "Disabled"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        ) : null}

        <Typography variant="h6" mb={1.2}>
          Banking Modules
        </Typography>
        <Grid container spacing={2}>
          {modules.map((module) => (
            <Grid key={module.slug} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ModuleCard module={module} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
