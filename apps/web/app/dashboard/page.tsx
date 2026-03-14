"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
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
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AdsenseBanner } from "@/components/ads/adsense-banner";
import { ModuleCard } from "@/components/ui/module-card";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { getAccessibleModules, resolveAccountTypeByRole } from "@/features/banking/account-access";
import { modules } from "@/features/banking/module-registry";
import { appBranding } from "@/shared/config/branding";
import {
  cancelPremium,
  createPaymentRequest,
  getMe,
  getMonitoringOverview,
  getMySubscription,
  getPaymentsOverview,
  getUserDirectory,
  listCustomers,
  payPaymentRequest,
  updateSocietyAccess,
  upgradeToPremium
} from "@/shared/api/client";
import { clearSession, getSession, setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";
import type {
  AppAccountType,
  AuthUser,
  MonitoringOverview,
  PaymentMethod,
  PaymentPurpose,
  PaymentsOverview
} from "@/shared/types";

type DirectoryUser = Awaited<ReturnType<typeof getUserDirectory>>[number];
type CustomerDirectory = Awaited<ReturnType<typeof listCustomers>>["rows"];

const balanceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium"
});

const paymentMethodOptions: PaymentMethod[] = ["UPI", "DEBIT_CARD", "CREDIT_CARD", "NET_BANKING"];
const paymentPurposeOptions: Array<{ label: string; value: PaymentPurpose }> = [
  { label: "Service Charge", value: "SERVICE_CHARGE" },
  { label: "Loan Repayment", value: "LOAN_REPAYMENT" },
  { label: "Deposit Installment", value: "DEPOSIT_INSTALLMENT" }
];

function formatDate(value?: string | Date | null) {
  return value ? dateFormatter.format(new Date(value)) : "-";
}

function formatRoleLabel(role?: string) {
  if (!role) {
    return "-";
  }

  return role.replaceAll("_", " ");
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accountType, setAccountType] = useState<AppAccountType>("CLIENT");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [customers, setCustomers] = useState<CustomerDirectory>([]);
  const [paymentsOverview, setPaymentsOverview] = useState<PaymentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState<"upgrade" | "cancel" | null>(null);
  const [billingMethod, setBillingMethod] = useState<PaymentMethod>("UPI");
  const [societyActionNotice, setSocietyActionNotice] = useState<string | null>(null);
  const [societyActionError, setSocietyActionError] = useState<string | null>(null);
  const [societyActionBusyId, setSocietyActionBusyId] = useState<string | null>(null);
  const [paymentsNotice, setPaymentsNotice] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [creatingPaymentRequest, setCreatingPaymentRequest] = useState(false);
  const [payingRequestId, setPayingRequestId] = useState<string | null>(null);
  const [paymentMethodByRequest, setPaymentMethodByRequest] = useState<Record<string, PaymentMethod>>({});
  const [societyConfig, setSocietyConfig] = useState({
    upiId: "",
    acceptsDigitalPayments: false
  });
  const [paymentRequestForm, setPaymentRequestForm] = useState({
    customerId: "",
    title: "",
    purpose: "SERVICE_CHARGE" as PaymentPurpose,
    amount: "",
    dueDate: "",
    description: ""
  });

  async function refreshData(accessToken: string, baseUser?: AuthUser | null, baseAccountType?: AppAccountType) {
    const [payments, monitoringResult, directoryResult, customersResult] = await Promise.all([
      getPaymentsOverview(accessToken),
      baseUser && ["SUPER_ADMIN", "SUPER_USER", "AGENT"].includes(baseUser.role) ? getMonitoringOverview(accessToken) : Promise.resolve(null),
      baseUser && ["SUPER_ADMIN", "SUPER_USER", "AGENT"].includes(baseUser.role) ? getUserDirectory(accessToken) : Promise.resolve([] as DirectoryUser[]),
      baseAccountType === "SOCIETY" || baseAccountType === "AGENT" ? listCustomers(accessToken) : Promise.resolve({ page: 1, limit: 50, total: 0, rows: [] })
    ]);

    setPaymentsOverview(payments);
    setOverview(monitoringResult);
    setDirectory(directoryResult);
    setCustomers(customersResult.rows);
    setSocietyConfig({
      upiId: payments.society?.upiId ?? "",
      acceptsDigitalPayments: payments.acceptsDigitalPayments
    });
  }

  useEffect(() => {
    let active = true;

    async function loadData() {
      const session = getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (active) {
        setAccountType(session.accountType ?? resolveAccountTypeByRole(session.role));
        setAvatarDataUrl(session.avatarDataUrl ?? null);
      }

      try {
        const profile = await getMe(session.accessToken);
        const subscription = profile.subscription ?? (await getMySubscription(session.accessToken));
        const resolvedAccountType = session.accountType ?? resolveAccountTypeByRole(profile.role);
        const profileWithSubscription: AuthUser = {
          ...profile,
          subscription
        };

        if (!active) {
          return;
        }

        setUser(profileWithSubscription);
        setAccountType(resolvedAccountType);
        setSession({
          ...session,
          accountType: resolvedAccountType,
          subscriptionPlan: subscription.plan
        });

        await refreshData(session.accessToken, profileWithSubscription, resolvedAccountType);
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load dashboard");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [router]);

  const greeting = useMemo(() => {
    if (!user) {
      return "Welcome";
    }

    if (user.role === "SUPER_ADMIN") {
      return `Welcome, Platform ${user.fullName}`;
    }

    return `Welcome, ${user.fullName}`;
  }, [user]);

  const workspaceCopy = useMemo(() => {
    if (accountType === "PLATFORM") {
      return {
        title: "Platform Superadmin Workspace",
        summary: "Approve societies, manage access plans, and track collection performance across the full platform.",
        features: ["Society Approval", "Portfolio Visibility", "Platform Controls"]
      };
    }

    if (accountType === "SOCIETY") {
      return {
        title: "Society Control Workspace",
        summary: "Run society operations, monitor members, manage plan features, and handle digital collections from one dashboard.",
        features: ["Plan Controls", "Member Collections", "Operational Monitoring"]
      };
    }

    if (accountType === "AGENT") {
      return {
        title: "Agent Operation Workspace",
        summary: "Execute day-to-day member operations, create service payment requests, and follow collections for your society.",
        features: ["Service Desk", "Collection Requests", "Daily Workflow Actions"]
      };
    }

    return {
      title: "Consumer Self-Service Workspace",
      summary: "Review your savings, see society requests, and pay dues using digital methods from the same software.",
      features: ["My Profile", "Pending Payments", "Savings & Interest Tracking"]
    };
  }, [accountType]);

  const visibleModules = useMemo(() => getAccessibleModules(modules, accountType), [accountType]);
  const quickAccessModules = useMemo(() => visibleModules.slice(0, 4), [visibleModules]);
  const isPremium = user?.subscription?.plan === "PREMIUM";
  const canManageSocietyBilling = user?.role === "SUPER_USER";
  const canCreatePaymentRequests = user?.role === "SUPER_USER" || user?.role === "AGENT";
  const canApproveSocieties = user?.role === "SUPER_ADMIN";
  const showAds = !isPremium && accountType !== "PLATFORM";

  const workspaceStats = useMemo(() => {
    const paymentTotal = paymentsOverview?.totals.totalCollectedAmount ?? 0;

    return [
      {
        label: "Accessible Modules",
        value: String(visibleModules.length),
        caption: "Role-based workspaces available now"
      },
      {
        label: "Current Plan",
        value: isPremium ? "Premium" : "Common",
        caption: user?.subscription?.scope === "SOCIETY" ? "Society-wide subscription" : "Role-based access scope"
      },
      {
        label: "Operating Scope",
        value: accountType === "PLATFORM" ? "All Societies" : user?.society?.code ?? "Consumer",
        caption: accountType === "PLATFORM" ? "Central platform administration" : user?.society?.name ?? "Member self-service"
      },
      {
        label: "Collections",
        value: balanceFormatter.format(paymentTotal),
        caption: paymentsOverview ? `${paymentsOverview.totals.completedPayments} successful digital payments` : "No payment summary"
      }
    ];
  }, [accountType, isPremium, paymentsOverview, user, visibleModules.length]);

  function onLogout() {
    clearSession();
    router.replace("/login");
  }

  async function reloadAfterAction() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    const profile = await getMe(session.accessToken);
    const subscription = profile.subscription ?? (await getMySubscription(session.accessToken));
    const resolvedAccountType = session.accountType ?? resolveAccountTypeByRole(profile.role);
    const profileWithSubscription: AuthUser = {
      ...profile,
      subscription
    };

    setUser(profileWithSubscription);
    setAccountType(resolvedAccountType);
    setSession({
      ...session,
      accountType: resolvedAccountType,
      subscriptionPlan: subscription.plan
    });

    await refreshData(session.accessToken, profileWithSubscription, resolvedAccountType);
  }

  async function onUpgradeToPremium() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      setBillingBusy("upgrade");
      setBillingNotice(null);
      setBillingError(null);
      const result = await upgradeToPremium(session.accessToken, { paymentMethod: billingMethod });
      setBillingNotice(result.message);
      toast.success("Society upgraded to Premium successfully!");
      await reloadAfterAction();
    } catch (caught) {
      const errorMsg = caught instanceof Error ? caught.message : "Unable to upgrade society plan";
      setBillingError(errorMsg);
      toast.error(errorMsg);
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
      setBillingBusy("cancel");
      setBillingNotice(null);
      setBillingError(null);
      const result = await cancelPremium(session.accessToken);
      setBillingNotice(result.message);
      toast.success("Premium subscription cancelled");
      await reloadAfterAction();
    } catch (caught) {
      const errorMsg = caught instanceof Error ? caught.message : "Unable to cancel society premium";
      setBillingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setBillingBusy(null);
    }
  }

  async function onToggleSocietyStatus(societyId: string, isActive: boolean) {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      setSocietyActionBusyId(societyId);
      setSocietyActionNotice(null);
      setSocietyActionError(null);
      await updateSocietyAccess(session.accessToken, societyId, {
        status: isActive ? "SUSPENDED" : "ACTIVE",
        isActive: !isActive
      });
      const message = isActive ? "Society suspended successfully" : "Society activated successfully";
      setSocietyActionNotice(message);
      toast.success(message);
      await reloadAfterAction();
    } catch (caught) {
      const errorMsg = caught instanceof Error ? caught.message : "Unable to update society access";
      setSocietyActionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSocietyActionBusyId(null);
    }
  }

  async function onUpdateSocietyPayments() {
    const session = getSession();
    const societyId = overview?.societies[0]?.id;

    if (!session || !societyId) {
      return;
    }

    try {
      setSocietyActionBusyId(societyId);
      setSocietyActionNotice(null);
      setSocietyActionError(null);
      await updateSocietyAccess(session.accessToken, societyId, {
        acceptsDigitalPayments: societyConfig.acceptsDigitalPayments,
        upiId: societyConfig.upiId.trim() || undefined
      });
      setSocietyActionNotice("Society payment settings updated");
      toast.success("Payment settings updated successfully");
      await reloadAfterAction();
    } catch (caught) {
      const errorMsg = caught instanceof Error ? caught.message : "Unable to update society settings";
      setSocietyActionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSocietyActionBusyId(null);
    }
  }

  async function onCreatePaymentRequest() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      setCreatingPaymentRequest(true);
      setPaymentsNotice(null);
      setPaymentsError(null);
      await createPaymentRequest(session.accessToken, {
        customerId: paymentRequestForm.customerId,
        title: paymentRequestForm.title,
        description: paymentRequestForm.description || undefined,
        purpose: paymentRequestForm.purpose,
        amount: Number(paymentRequestForm.amount),
        dueDate: paymentRequestForm.dueDate || undefined
      });
      setPaymentsNotice("Payment request created successfully");
      toast.success("Payment request created successfully");
      setPaymentRequestForm({
        customerId: "",
        title: "",
        purpose: "SERVICE_CHARGE",
        amount: "",
        dueDate: "",
        description: ""
      });
      await reloadAfterAction();
    } catch (caught) {
      setPaymentsError(caught instanceof Error ? caught.message : "Unable to create payment request");
    } finally {
      setCreatingPaymentRequest(false);
    }
  }

  async function onPayRequest(requestId: string) {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      setPayingRequestId(requestId);
      setPaymentsNotice(null);
      setPaymentsError(null);
      await payPaymentRequest(session.accessToken, requestId, paymentMethodByRequest[requestId] ?? "UPI");
      setPaymentsNotice("Payment completed successfully");
      await reloadAfterAction();
    } catch (caught) {
      setPaymentsError(caught instanceof Error ? caught.message : "Unable to complete payment");
    } finally {
      setPayingRequestId(null);
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

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: (theme) =>
            `linear-gradient(140deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 55%, ${theme.palette.secondary.light} 100%)`,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          color: "#fff"
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexGrow: 1 }}>
            <Avatar src={avatarDataUrl ?? undefined} sx={{ bgcolor: "#ff8f2e", boxShadow: "0 8px 18px rgba(14, 32, 47, 0.34)" }}>
              {user?.fullName?.[0] ?? "I"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
                {appBranding.productShortName}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.82)" }}>
                {accountType} Workspace
              </Typography>
            </Box>
	          </Stack>
	          <Stack direction="row" spacing={1} alignItems="center">
	            <SettingsMenu size="small" />
	            <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
	              Logout
	            </Button>
	          </Stack>
	        </Toolbar>
	      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          py: 3,
          minHeight: "calc(100vh - 92px)",
          background: "linear-gradient(180deg, #f8fafb 0%, #f2f4f8 55%, #ffffff 100%)",
          color: "text.primary"
        }}
      >
        <Card
          className="surface-glass fade-rise hover-lift"
          sx={{
            mb: 2,
            overflow: "hidden",
            borderRadius: 3,
            border: "1px solid rgba(52, 84, 209, 0.15)",
            boxShadow: "0 14px 24px rgba(15, 23, 42, 0.12)",
            background: "linear-gradient(135deg, rgba(232,242,255,0.94), rgba(255,255,255,0.85))"
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1}>
                  <Typography variant="h5">{greeting}</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {workspaceCopy.title}
                  </Typography>
                  <Typography color="text.secondary">{workspaceCopy.summary}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip label={`Role: ${formatRoleLabel(user?.role)}`} color="secondary" />
                    <Chip label={`Plan: ${user?.subscription?.plan ?? "FREE"}`} color="secondary" variant="outlined" />
                    <Chip label={`Scope: ${user?.subscription?.scope ?? "SOCIETY"}`} color="secondary" variant="outlined" />
                    {user?.society?.name ? <Chip label={`Society: ${user.society.name}`} variant="outlined" /> : null}
                    {workspaceCopy.features.map((feature) => (
                      <Chip key={feature} label={feature} size="small" />
                    ))}
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

        <Grid container spacing={2} mb={2}>
          {workspaceStats.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Card
                className="surface-glass hover-lift"
                sx={{
                  height: "100%",
                  minHeight: 160,
                  borderRadius: 2.5,
                  border: "1px solid rgba(145,158,171,0.25)",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.07)",
                  background: "rgba(255,255,255,0.95)"
                }}
              >
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {item.label}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.6, lineHeight: 1.1 }}>
                    {item.value}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.6 }}>
                    {item.caption}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              className="surface-glass hover-lift"
              sx={{
                height: "100%",
                minHeight: 250,
                borderRadius: 2.5,
                border: "1px solid rgba(145,158,171,0.25)",
                boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                background: "rgba(255,255,255,0.95)"
              }}
            >
              <CardContent>
                <Typography variant="h6">Quick Access</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.4, mb: 1.4 }}>
                  Move quickly across the workflows most relevant to your role.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {quickAccessModules.map((module) => (
                    <Button key={module.slug} component={Link} href={`/modules/${module.slug}`} variant="outlined">
                      {module.name}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              className="surface-glass hover-lift"
              sx={{
                height: "100%",
                minHeight: 250,
                borderRadius: 2.5,
                border: "1px solid rgba(145,158,171,0.25)",
                boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                background: "rgba(255,255,255,0.95)"
              }}
            >
              <CardContent>
                <Typography variant="h6">Subscription Snapshot</Typography>
                <Stack spacing={0.8} sx={{ mt: 1.2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subscription scope <strong>{user?.subscription?.scope ?? "SOCIETY"}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly amount <strong>{balanceFormatter.format(user?.subscription?.monthlyPrice ?? 0)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next billing <strong>{formatDate(user?.subscription?.nextBillingDate)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Experience <strong>{isPremium ? "Premium ad-free" : "Common with sponsored placements"}</strong>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card
          className="surface-glass hover-lift"
          sx={{
            mb: 2,
            minHeight: 280,
            borderRadius: 2.5,
            border: "1px solid rgba(145,158,171,0.25)",
            boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
            background: "rgba(255,255,255,0.96)"
          }}
        >
          <CardContent>
            <Stack spacing={1.2}>
              <Typography variant="h6">Society Subscription</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Plan: ${user?.subscription?.plan ?? "FREE"}`} color={isPremium ? "success" : "default"} />
                <Chip label={`Status: ${user?.subscription?.status ?? "ACTIVE"}`} variant="outlined" />
                <Chip label={`Scope: ${user?.subscription?.scope ?? "SOCIETY"}`} variant="outlined" />
                <Chip label={`Monthly: ${balanceFormatter.format(user?.subscription?.monthlyPrice ?? 0)}`} variant="outlined" />
                <Chip label={`Next Billing: ${formatDate(user?.subscription?.nextBillingDate)}`} variant="outlined" />
              </Stack>
              {billingNotice ? <Alert severity="success">{billingNotice}</Alert> : null}
              {billingError ? <Alert severity="error">{billingError}</Alert> : null}
              {canManageSocietyBilling ? (
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ md: "center" }}>
                  <TextField
                    select
                    size="small"
                    label="Preferred Payment"
                    value={billingMethod}
                    onChange={(event) => setBillingMethod(event.target.value as PaymentMethod)}
                    sx={{ minWidth: 200 }}
                  >
                    {paymentMethodOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.replaceAll("_", " ")}
                      </MenuItem>
                    ))}
                  </TextField>
                  {!isPremium ? (
                    <Button variant="contained" onClick={onUpgradeToPremium} disabled={billingBusy !== null}>
                      {billingBusy === "upgrade" ? "Activating..." : "Activate Society Premium"}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={onCancelPremium}
                      disabled={billingBusy !== null || user?.subscription?.cancelAtPeriodEnd}
                    >
                      {billingBusy === "cancel" ? "Scheduling..." : "Cancel at Period End"}
                    </Button>
                  )}
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        {showAds ? (
          <Card className="surface-glass hover-lift" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1.2}>
                Sponsored
              </Typography>
              <AdsenseBanner />
            </CardContent>
          </Card>
        ) : null}

        {paymentsOverview ? (
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card className="surface-glass hover-lift" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">Digital Payments</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.4, mb: 1.2 }}>
                    {paymentsOverview.scope === "platform"
                      ? "Track platform-wide collections and digital-payment readiness."
                      : paymentsOverview.scope === "society"
                        ? "Manage society collections and digital payment settings."
                        : "Pay your society requests securely from the same app."}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.2 }}>
                    <Chip label={`Pending: ${paymentsOverview.totals.pendingRequests}`} color="warning" />
                    <Chip label={`Completed: ${paymentsOverview.totals.completedPayments}`} color="success" />
                    <Chip label={`Pending Amount: ${balanceFormatter.format(paymentsOverview.totals.totalPendingAmount)}`} variant="outlined" />
                    <Chip label={`Collected: ${balanceFormatter.format(paymentsOverview.totals.totalCollectedAmount)}`} variant="outlined" />
                    {paymentsOverview.society?.upiId ? <Chip label={`UPI: ${paymentsOverview.society.upiId}`} variant="outlined" /> : null}
                  </Stack>
                  {paymentsNotice ? <Alert severity="success" sx={{ mb: 1.2 }}>{paymentsNotice}</Alert> : null}
                  {paymentsError ? <Alert severity="error" sx={{ mb: 1.2 }}>{paymentsError}</Alert> : null}
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Request</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Due</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentsOverview.requests.slice(0, 6).map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <Typography fontWeight={700}>{request.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.customer.fullName}
                              </Typography>
                            </TableCell>
                            <TableCell>{request.purpose.replaceAll("_", " ")}</TableCell>
                            <TableCell>{balanceFormatter.format(request.amount)}</TableCell>
                            <TableCell>{request.status}</TableCell>
                            <TableCell>{formatDate(request.dueDate)}</TableCell>
                            <TableCell>
                              {accountType === "CLIENT" && request.status === "OPEN" ? (
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                  <TextField
                                    select
                                    size="small"
                                    value={paymentMethodByRequest[request.id] ?? "UPI"}
                                    onChange={(event) =>
                                      setPaymentMethodByRequest((previous) => ({
                                        ...previous,
                                        [request.id]: event.target.value as PaymentMethod
                                      }))
                                    }
                                    sx={{ minWidth: 130 }}
                                  >
                                    {paymentsOverview.acceptedMethods.map((method) => (
                                      <MenuItem key={method} value={method}>
                                        {method.replaceAll("_", " ")}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => void onPayRequest(request.id)}
                                    disabled={payingRequestId === request.id || !paymentsOverview.acceptsDigitalPayments}
                                  >
                                    {payingRequestId === request.id ? "Processing..." : "Pay Now"}
                                  </Button>
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  {request.status === "PAID" ? "Paid" : "Managed by society"}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {paymentsOverview.requests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Typography color="text.secondary">No payment requests available.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Card className="surface-glass hover-lift" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">Recent Transactions</Typography>
                  <Stack spacing={1.1} sx={{ mt: 1.3 }}>
                    {paymentsOverview.recentTransactions.slice(0, 6).map((transaction) => (
                      <Stack key={transaction.id} direction="row" justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography fontWeight={700}>{balanceFormatter.format(transaction.amount)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.method.replaceAll("_", " ")} · {transaction.society.name}
                          </Typography>
                        </Box>
                        <Chip size="small" label={transaction.status} color={transaction.status === "SUCCESS" ? "success" : "default"} />
                      </Stack>
                    ))}
                    {paymentsOverview.recentTransactions.length === 0 ? (
                      <Typography color="text.secondary">No payment transactions recorded yet.</Typography>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {canCreatePaymentRequests ? (
          <Card className="surface-glass hover-lift" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Create Member Payment Request</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4, mb: 1.4 }}>
                Raise service charges, loan repayments, or installment requests for your members.
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Member"
                    value={paymentRequestForm.customerId}
                    onChange={(event) => setPaymentRequestForm((previous) => ({ ...previous, customerId: event.target.value }))}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {[customer.firstName, customer.lastName].filter(Boolean).join(" ")} ({customer.customerCode})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Request Title"
                    value={paymentRequestForm.title}
                    onChange={(event) => setPaymentRequestForm((previous) => ({ ...previous, title: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Purpose"
                    value={paymentRequestForm.purpose}
                    onChange={(event) =>
                      setPaymentRequestForm((previous) => ({ ...previous, purpose: event.target.value as PaymentPurpose }))
                    }
                  >
                    {paymentPurposeOptions.map((purpose) => (
                      <MenuItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={paymentRequestForm.amount}
                    onChange={(event) => setPaymentRequestForm((previous) => ({ ...previous, amount: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={paymentRequestForm.dueDate}
                    onChange={(event) => setPaymentRequestForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={paymentRequestForm.description}
                    onChange={(event) => setPaymentRequestForm((previous) => ({ ...previous, description: event.target.value }))}
                  />
                </Grid>
              </Grid>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={() => void onCreatePaymentRequest()}
                  disabled={
                    creatingPaymentRequest ||
                    !paymentsOverview?.acceptsDigitalPayments ||
                    !paymentRequestForm.customerId ||
                    !paymentRequestForm.title ||
                    !paymentRequestForm.amount
                  }
                >
                  {creatingPaymentRequest ? "Creating..." : "Create Payment Request"}
                </Button>
                {!paymentsOverview?.acceptsDigitalPayments ? (
                  <Typography variant="body2" color="text.secondary">
                    Enable digital payments for this society before raising payment requests.
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {accountType === "SOCIETY" && overview?.societies[0] ? (
          <Card className="surface-glass hover-lift" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Society Payment Settings</Typography>
              {societyActionNotice ? <Alert severity="success" sx={{ mt: 1.2 }}>{societyActionNotice}</Alert> : null}
              {societyActionError ? <Alert severity="error" sx={{ mt: 1.2 }}>{societyActionError}</Alert> : null}
              <Grid container spacing={1.5} sx={{ mt: 0.2 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Society UPI ID"
                    value={societyConfig.upiId}
                    onChange={(event) => setSocietyConfig((previous) => ({ ...previous, upiId: event.target.value }))}
                    helperText="Example: society@upi"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Digital Payments"
                    value={societyConfig.acceptsDigitalPayments ? "enabled" : "disabled"}
                    onChange={(event) =>
                      setSocietyConfig((previous) => ({
                        ...previous,
                        acceptsDigitalPayments: event.target.value === "enabled"
                      }))
                    }
                  >
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="contained"
                    sx={{ mt: { xs: 0, md: 1 } }}
                    onClick={() => void onUpdateSocietyPayments()}
                    disabled={societyActionBusyId === overview.societies[0].id}
                  >
                    {societyActionBusyId === overview.societies[0].id ? "Saving..." : "Save Payment Settings"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : null}

        {overview ? (
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="hover-lift surface-glass">
                <CardContent>
                  <Typography color="text.secondary">Societies</Typography>
                  <Typography variant="h4">{overview.totals.societies}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="hover-lift surface-glass">
                <CardContent>
                  <Typography color="text.secondary">Customers</Typography>
                  <Typography variant="h4">{overview.totals.customers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="hover-lift surface-glass">
                <CardContent>
                  <Typography color="text.secondary">Accounts</Typography>
                  <Typography variant="h4">{overview.totals.accounts}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className="hover-lift surface-glass">
                <CardContent>
                  <Typography color="text.secondary">Collected Digitally</Typography>
                  <Typography variant="h6">{balanceFormatter.format(overview.totals.successfulPaymentVolume)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {overview ? (
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card className="surface-glass">
                <CardContent>
                  <Typography variant="h6" mb={1.2}>
                    Society Monitoring
                  </Typography>
                  {societyActionNotice ? <Alert severity="success" sx={{ mb: 1.2 }}>{societyActionNotice}</Alert> : null}
                  {societyActionError ? <Alert severity="error" sx={{ mb: 1.2 }}>{societyActionError}</Alert> : null}
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Society</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Plan</TableCell>
                          <TableCell>Customers</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Digital Payments</TableCell>
                          <TableCell>Collections</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {overview.societies.map((society) => (
                          <TableRow key={society.id}>
                            <TableCell>
                              <Typography fontWeight={700}>{society.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {society.code}
                              </Typography>
                            </TableCell>
                            <TableCell>{society.status}</TableCell>
                            <TableCell>{society.subscriptionPlan}</TableCell>
                            <TableCell>{society.customers}</TableCell>
                            <TableCell>{balanceFormatter.format(society.totalBalance)}</TableCell>
                            <TableCell>{society.acceptsDigitalPayments ? "Enabled" : "Disabled"}</TableCell>
                            <TableCell>{balanceFormatter.format(society.successfulPaymentVolume)}</TableCell>
                            <TableCell>
                              {canApproveSocieties ? (
                                <Button
                                  size="small"
                                  variant={society.isActive ? "outlined" : "contained"}
                                  color={society.isActive ? "warning" : "success"}
                                  onClick={() => void onToggleSocietyStatus(society.id, society.isActive)}
                                  disabled={societyActionBusyId === society.id}
                                >
                                  {societyActionBusyId === society.id
                                    ? "Saving..."
                                    : society.isActive
                                      ? "Suspend"
                                      : "Activate"}
                                </Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Scoped view
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card className="surface-glass">
                <CardContent>
                  <Typography variant="h6" mb={1.2}>
                    User Role Mix
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(overview.userRoleBreakdown).map(([key, value]) => (
                      <Stack key={key} direction="row" justifyContent="space-between">
                        <Typography>{formatRoleLabel(key)}</Typography>
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
          <Card className="surface-glass" sx={{ mb: 2 }}>
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
                        <TableCell>{formatRoleLabel(item.role)}</TableCell>
                        <TableCell>{item.society?.name ?? "Platform"}</TableCell>
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
	          Modules ({accountType})
	        </Typography>
        <Grid container spacing={2}>
          {visibleModules.map((module) => (
            <Grid key={module.slug} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ModuleCard module={module} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
