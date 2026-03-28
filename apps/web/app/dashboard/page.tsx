"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import DomainIcon from "@mui/icons-material/Domain";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, Container, Skeleton, Stack, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { ModuleCard } from "@/components/ui/module-card";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { getAccessibleModules, resolveAccountTypeByRole } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";
import { modules, type BankingModule } from "@/features/banking/module-registry";
import { getMe } from "@/shared/api/client";
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { getUserDirectory, type UserDirectoryEntry } from "@/shared/api/users";
import { clearSession, getSession } from "@/shared/auth/session";
import { appBranding } from "@/shared/config/branding";
import { getDashboardCopy } from "@/shared/i18n/dashboard-copy";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { TranslationKey } from "@/shared/i18n/translations";
import type { AppAccountType, AuthUser, MonitoringOverview } from "@/shared/types";

const accountTypeLabelKeys: Record<AppAccountType, TranslationKey> = {
  CLIENT: "account.client",
  AGENT: "account.agent",
  SOCIETY: "account.society",
  PLATFORM: "account.platform"
};

const featuredModuleSlugsByAccountType: Record<AppAccountType, string[]> = {
  CLIENT: ["accounts", "deposits", "loans", "transactions"],
  AGENT: ["customers", "transactions", "accounts", "reports"],
  SOCIETY: ["customers", "accounts", "reports", "monitoring"],
  PLATFORM: ["monitoring", "users", "reports"]
};

type SummaryCardItem = {
  key: string;
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
};

type ActionCardItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  ctaLabel: string;
};

function formatDirectoryRole(role: string, roleLabels: Record<string, string>) {
  return roleLabels[role] ?? role;
}

function formatIndianNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function getRoleFocus(accountType: AppAccountType, dashboardCopy: ReturnType<typeof getDashboardCopy>) {
  return dashboardCopy.roleFocus[accountType];
}

function getHeroPanelTitle(accountType: AppAccountType, dashboardCopy: ReturnType<typeof getDashboardCopy>) {
  return dashboardCopy.heroPanelTitles[accountType];
}

function getHeroPanelDescription(
  accountType: AppAccountType,
  monitoringOverview: MonitoringOverview | null,
  dashboardCopy: ReturnType<typeof getDashboardCopy>
) {
  if (accountType === "PLATFORM" && monitoringOverview) {
    return dashboardCopy.heroDescriptions.platformMetrics({
      societies: formatIndianNumber(monitoringOverview.totals.societies),
      customers: formatIndianNumber(monitoringOverview.totals.customers),
      accounts: formatIndianNumber(monitoringOverview.totals.accounts)
    });
  }

  if (accountType === "SOCIETY" && monitoringOverview) {
    return dashboardCopy.heroDescriptions.societyMetrics({
      customers: formatIndianNumber(monitoringOverview.totals.customers),
      accounts: formatIndianNumber(monitoringOverview.totals.accounts),
      transactions: formatIndianNumber(monitoringOverview.totals.transactions)
    });
  }

  if (accountType === "AGENT") {
    return dashboardCopy.heroDescriptions.agent;
  }

  if (accountType === "CLIENT") {
    return dashboardCopy.heroDescriptions.client;
  }

  return dashboardCopy.heroDescriptions.fallback;
}

function getSectionSubtitle(accountType: AppAccountType, dashboardCopy: ReturnType<typeof getDashboardCopy>) {
  return dashboardCopy.priorityWorkspaceSubtitles[accountType];
}

function getServiceAreaSubtitle(accountType: AppAccountType, dashboardCopy: ReturnType<typeof getDashboardCopy>) {
  return dashboardCopy.operationalAreaSubtitles[accountType];
}

function getModuleIcon(slug: string) {
  switch (slug) {
    case "customers":
    case "users":
      return <ManageAccountsRoundedIcon color="primary" />;
    case "monitoring":
    case "reports":
      return <InsightsRoundedIcon color="primary" />;
    case "accounts":
    case "deposits":
    case "loans":
      return <AccountBalanceIcon color="primary" />;
    default:
      return <WidgetsRoundedIcon color="primary" />;
  }
}

function SummaryCard({ item }: { item: SummaryCardItem }) {
  return (
    <Card className="surface-glass hover-lift" sx={{ height: "100%", borderRadius: 3, overflow: "hidden", position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 3,
          background: (theme) =>
            `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.72)} 0%, ${alpha(theme.palette.secondary.main, 0.72)} 100%)`
        }}
      />
      <CardContent>
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.1 : 0.18)
            }}
          >
            {item.icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.6 }}>
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
              {item.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              {item.caption}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        <Card className="surface-vibrant fade-rise" sx={{ mb: 2.5, borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 2.2, md: 3.2 } }}>
            <Grid container spacing={2.2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={1.3}>
                  <Skeleton variant="rounded" width={130} height={28} />
                  <Skeleton variant="text" width="70%" height={52} />
                  <Skeleton variant="text" width="88%" height={28} />
                  <Skeleton variant="text" width="62%" height={28} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={110} height={32} />
                    <Skeleton variant="rounded" width={140} height={32} />
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Card className="surface-glass" sx={{ borderRadius: 2.5 }}>
                  <CardContent>
                    <Skeleton variant="text" width="45%" height={24} />
                    <Skeleton variant="text" width="68%" height={36} />
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="85%" height={24} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="text" width="60%" height={38} />
                  <Skeleton variant="text" width="92%" height={22} />
                  <Skeleton variant="text" width="78%" height={22} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card className="surface-glass" sx={{ borderRadius: 3, mb: 2.5 }}>
          <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
            <Skeleton variant="text" width={220} height={40} />
            <Skeleton variant="text" width="58%" height={24} sx={{ mb: 2.2 }} />
            <Grid container spacing={2}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Skeleton variant="rounded" width={48} height={48} />
                      <Skeleton variant="text" width="68%" height={32} sx={{ mt: 1.2 }} />
                      <Skeleton variant="text" width="100%" height={24} />
                      <Skeleton variant="text" width="92%" height={24} />
                      <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function ActionCard({ item }: { item: ActionCardItem }) {
  return (
    <Card className="surface-glass hover-lift" sx={{ height: "100%", borderRadius: 3, overflow: "hidden" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2.3 }}>
        <Stack direction="row" spacing={1.1} alignItems="flex-start" sx={{ mb: 1.2 }}>
          <Box
            sx={{
              p: 1.1,
              borderRadius: 2.4,
              background: (theme) =>
                `linear-gradient(145deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.14 : 0.24)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === "light" ? 0.12 : 0.22)} 100%)`
            }}
          >
            {item.icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: "1.04rem" }}>
              {item.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.6 }}>
              {item.description}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: "auto",
            pt: 1.5,
            borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`
          }}
        >
          <Button component={Link} href={item.href} variant="contained" fullWidth>
            {item.ctaLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accountType, setAccountType] = useState<AppAccountType>("CLIENT");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [directoryEntries, setDirectoryEntries] = useState<UserDirectoryEntry[]>([]);
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dashboardCopy = useMemo(() => getDashboardCopy(locale), [locale]);

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

        if (!active) {
          return;
        }

        const resolvedAccountType = session.accountType ?? resolveAccountTypeByRole(profile.role);
        setUser(profile);
        setAccountType(resolvedAccountType);
        setError(null);
        setDirectoryEntries([]);
        setMonitoringOverview(null);

        if (resolvedAccountType === "SOCIETY" || resolvedAccountType === "PLATFORM") {
          const [directoryResult, overviewResult] = await Promise.allSettled([
            getUserDirectory(session.accessToken),
            getMonitoringOverview(session.accessToken)
          ]);

          if (!active) {
            return;
          }

          if (directoryResult.status === "fulfilled") {
            setDirectoryEntries(directoryResult.value);
          }

          if (overviewResult.status === "fulfilled") {
            setMonitoringOverview(overviewResult.value);
          }
        }
      } catch (caught) {
        if (!active) {
          return;
        }

        setError(caught instanceof Error ? caught.message : dashboardCopy.loadError);
        clearSession();
        router.replace("/login");
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
  }, [dashboardCopy.loadError, router]);

  const accountTypeLabel = t(accountTypeLabelKeys[accountType]);
  const localizedModules = useMemo(
    () => getAccessibleModules(modules, accountType).map((module) => localizeBankingModule(module, locale)),
    [accountType, locale]
  );
  const moduleLookup = useMemo(
    () => new Map(localizedModules.map((module) => [module.slug, module])),
    [localizedModules]
  );
  const isSocietyAdmin = accountType === "SOCIETY";
  const isPlatformAdmin = accountType === "PLATFORM";
  const accessCaption =
    user?.society?.name ??
    (isPlatformAdmin ? dashboardCopy.platformScopeLabel : appBranding.companyName);
  const teamSummary = useMemo(
    () => ({
      clients: directoryEntries.filter((entry) => entry.role === "CLIENT").length,
      agents: directoryEntries.filter((entry) => entry.role === "AGENT").length,
      societyAdmins: directoryEntries.filter((entry) => entry.role === "SUPER_USER").length,
      platformAdmins: directoryEntries.filter((entry) => entry.role === "SUPER_ADMIN").length,
      activeUsers: directoryEntries.filter((entry) => entry.isActive).length,
      recentEntries: directoryEntries.slice(0, 5)
    }),
    [directoryEntries]
  );

  const featuredModules = useMemo(() => {
    const desired = featuredModuleSlugsByAccountType[accountType];
    return desired
      .map((slug) => moduleLookup.get(slug))
      .filter((module): module is BankingModule => Boolean(module));
  }, [accountType, moduleLookup]);

  const featuredActions = useMemo<ActionCardItem[]>(() => {
    const moduleCards = featuredModules.map((module) => ({
      key: module.slug,
      title: module.name,
      description: module.summary,
      href: `/modules/${module.slug}`,
      icon: getModuleIcon(module.slug),
      ctaLabel: dashboardCopy.openWorkspace
    }));

    if (!isSocietyAdmin) {
      return moduleCards;
    }

    return [
      {
        key: "society-profile",
        title: dashboardCopy.institutionProfileTitle,
        description: dashboardCopy.institutionProfileDescription,
        href: "/dashboard/society",
        icon: <DomainIcon color="primary" />,
        ctaLabel: dashboardCopy.openWorkspace
      },
      {
        key: "branch-management",
        title: dashboardCopy.branchManagementTitle,
        description: dashboardCopy.branchManagementDescription,
        href: "/dashboard/branches",
        icon: <AccountBalanceIcon color="primary" />,
        ctaLabel: dashboardCopy.openWorkspace
      },
      ...moduleCards
    ];
  }, [dashboardCopy, featuredModules, isSocietyAdmin]);

  const featuredModuleSlugs = useMemo(
    () => new Set(featuredModules.map((module) => module.slug)),
    [featuredModules]
  );
  const remainingModules = useMemo(
    () => localizedModules.filter((module) => !featuredModuleSlugs.has(module.slug)),
    [featuredModuleSlugs, localizedModules]
  );

  const summaryCards = useMemo<SummaryCardItem[]>(() => {
    const cards: SummaryCardItem[] = [
      {
        key: "role",
        label: dashboardCopy.signedInRoleLabel,
        value: accountTypeLabel,
        caption: user?.fullName
          ? `${user.fullName} · ${getRoleFocus(accountType, dashboardCopy)}`
          : getRoleFocus(accountType, dashboardCopy),
        icon: <ShieldRoundedIcon color="primary" />
      },
      {
        key: "scope",
        label: isPlatformAdmin ? dashboardCopy.platformScopeLabel : dashboardCopy.institutionLabel,
        value: accessCaption,
        caption: isPlatformAdmin ? dashboardCopy.platformScopeCaption : dashboardCopy.institutionCaption,
        icon: <DomainIcon color="primary" />
      },
      {
        key: "support",
        label: dashboardCopy.supportLabel,
        value: appBranding.supportEmail,
        caption: dashboardCopy.supportCaption,
        icon: <ContactMailOutlinedIcon color="primary" />
      }
    ];

    if (accountType === "CLIENT" && user?.customerProfile?.customerCode) {
      cards.push({
        key: "customer-code",
        label: dashboardCopy.customerProfileLabel,
        value: user.customerProfile.customerCode,
        caption: dashboardCopy.customerProfileCaption,
        icon: <ManageAccountsRoundedIcon color="primary" />
      });
      return cards;
    }

    if (monitoringOverview) {
      cards.push({
        key: "snapshot",
        label: isPlatformAdmin ? dashboardCopy.portfolioSnapshotLabel : dashboardCopy.businessSnapshotLabel,
        value: isPlatformAdmin
          ? `${formatIndianNumber(monitoringOverview.totals.societies)} ${dashboardCopy.snapshotMetrics.societies.toLowerCase()} · ${formatIndianNumber(monitoringOverview.totals.customers)} ${dashboardCopy.snapshotMetrics.customers.toLowerCase()}`
          : `${formatIndianNumber(monitoringOverview.totals.customers)} ${dashboardCopy.snapshotMetrics.customers.toLowerCase()} · ${formatIndianNumber(monitoringOverview.totals.accounts)} ${dashboardCopy.snapshotMetrics.accounts.toLowerCase()}`,
        caption: isPlatformAdmin ? dashboardCopy.portfolioSnapshotCaption : dashboardCopy.businessSnapshotCaption,
        icon: <InsightsRoundedIcon color="primary" />
      });
    }

    return cards;
  }, [accessCaption, accountType, accountTypeLabel, dashboardCopy, isPlatformAdmin, monitoringOverview, user]);

  function onLogout() {
    clearSession();
    router.replace("/login");
  }

  if (loading) {
    return <DashboardSkeleton />;
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
          color: "#fff",
          backdropFilter: "blur(18px)",
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.92)} 52%, ${alpha(theme.palette.secondary.main, 0.94)} 100%)`
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 1.5, flexWrap: "wrap", py: 1.2 }}>
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Avatar
              src={avatarDataUrl ?? undefined}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.14),
                boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.common.black, 0.24)}`
              }}
            >
              {user?.fullName?.[0] ?? "I"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1} noWrap>
                {appBranding.productShortName}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.82)" }} noWrap>
                {t("dashboard.workspace.caption", { accountType: accountTypeLabel })}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button component={Link} href="/about" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.16)" }} variant="outlined">
              {t("nav.about")}
            </Button>
            <Button component={Link} href="/contact" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.16)" }} variant="outlined">
              {t("nav.contact")}
            </Button>
            <SettingsMenu size="small" />
            <Button
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              variant="contained"
              sx={{
                color: "#fff",
                px: 1.6,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.86)} 0%, ${alpha(theme.palette.secondary.main, 0.98)} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                  background: (theme) =>
                    `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.94)} 0%, ${alpha(theme.palette.secondary.main, 1)} 100%)`
                }
              }}
            >
              {t("dashboard.logout")}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: "relative",
          py: { xs: 3, md: 4 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: (theme) =>
              `radial-gradient(80% 60% at 0% 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.12 : 0.18)} 0%, transparent 70%),
              radial-gradient(65% 55% at 100% 10%, ${alpha(theme.palette.secondary.main, theme.palette.mode === "light" ? 0.1 : 0.16)} 0%, transparent 72%)`,
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative" }}>
          <Card
            className="surface-vibrant fade-rise"
            sx={{
              mb: 2.5,
              overflow: "hidden",
              borderRadius: 3,
              background: (theme) =>
                `linear-gradient(145deg, ${alpha(theme.palette.background.paper, theme.palette.mode === "light" ? 0.96 : 0.9)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === "light" ? 0.8 : 0.84)} 100%)`
            }}
          >
            <CardContent sx={{ p: { xs: 2.2, md: 3.2 } }}>
              <Grid container spacing={2.2} alignItems="center">
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Stack spacing={1.4}>
                    <Chip label={t("dashboard.hero.badge")} color="secondary" variant="outlined" sx={{ width: "fit-content" }} />

                    <Box>
                      <Typography variant="h4" className="section-title" sx={{ mb: 0.8 }}>
                        {t("dashboard.hero.greeting", { name: user?.fullName ?? appBranding.productShortName })}
                      </Typography>
                      <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                        {getRoleFocus(accountType, dashboardCopy)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
                      <Chip label={accountTypeLabel} color="primary" />
                      {user?.society?.code ? <Chip label={user.society.code} variant="outlined" /> : null}
                      {user?.society?.name ? <Chip label={user.society.name} variant="outlined" /> : null}
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 2.5,
                      background: (theme) =>
                        `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.08 : 0.18)} 0%, ${alpha(theme.palette.background.paper, 0.72)} 100%)`
                    }}
                  >
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {appBranding.productName}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 0.8 }}>
                        {getHeroPanelTitle(accountType, dashboardCopy)}
                      </Typography>
                      <Typography color="text.secondary">{getHeroPanelDescription(accountType, monitoringOverview, dashboardCopy)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {summaryCards.map((item) => (
              <Grid key={item.key} size={{ xs: 12, sm: 6, xl: 3 }}>
                <SummaryCard item={item} />
              </Grid>
            ))}
          </Grid>

          {featuredActions.length > 0 ? (
            <Card className="surface-glass" sx={{ mb: 2.5, borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
                <Stack spacing={0.8} sx={{ mb: 2.2 }}>
                  <Typography variant="h5" className="section-title">
                    {dashboardCopy.priorityWorkspaceTitle}
                  </Typography>
                  <Typography color="text.secondary">{getSectionSubtitle(accountType, dashboardCopy)}</Typography>
                </Stack>

                <Grid container spacing={2}>
                  {featuredActions.map((item) => (
                    <Grid key={item.key} size={{ xs: 12, md: 6, xl: 4 }}>
                      <ActionCard item={item} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ) : null}

          {(isSocietyAdmin || isPlatformAdmin) && (directoryEntries.length > 0 || monitoringOverview) ? (
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card className="surface-glass" sx={{ height: "100%", borderRadius: 3 }}>
                  <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
                    <Stack spacing={0.8} sx={{ mb: 2 }}>
                      <Typography variant="h5" className="section-title">
                        {isPlatformAdmin ? dashboardCopy.teamTitles.platform : dashboardCopy.teamTitles.society}
                      </Typography>
                      <Typography color="text.secondary">
                        {isPlatformAdmin ? dashboardCopy.teamSubtitles.platform : dashboardCopy.teamSubtitles.society}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      <Chip label={`${teamSummary.clients} ${dashboardCopy.teamCounts.clients}`} color="primary" />
                      <Chip label={`${teamSummary.agents} ${dashboardCopy.teamCounts.agents}`} color="primary" variant="outlined" />
                      <Chip label={`${teamSummary.societyAdmins} ${dashboardCopy.teamCounts.societyAdmins}`} variant="outlined" />
                      {isPlatformAdmin ? <Chip label={`${teamSummary.platformAdmins} ${dashboardCopy.teamCounts.platformAdmins}`} variant="outlined" /> : null}
                      <Chip label={`${teamSummary.activeUsers} ${dashboardCopy.teamCounts.activeUsers}`} color="secondary" variant="outlined" />
                    </Stack>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {dashboardCopy.recentAccessRecords}
                    </Typography>
                    <Stack spacing={1.1}>
                      {teamSummary.recentEntries.map((entry) => (
                        <Stack
                          key={entry.id}
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          justifyContent="space-between"
                          sx={{
                            p: 1.4,
                            borderRadius: 2,
                            border: "1px solid rgba(148, 163, 184, 0.16)",
                            bgcolor: "rgba(255,255,255,0.02)"
                          }}
                        >
                          <Box>
                            <Typography fontWeight={700}>{entry.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDirectoryRole(entry.role, dashboardCopy.directoryRoleLabels)}
                              {entry.society?.name ? ` · ${entry.society.name}` : ""}
                            </Typography>
                          </Box>
                          <Chip
                            label={entry.isActive ? dashboardCopy.activityStatus.active : dashboardCopy.activityStatus.inactive}
                            color={entry.isActive ? "success" : "default"}
                            size="small"
                            variant={entry.isActive ? "filled" : "outlined"}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Card className="surface-glass" sx={{ height: "100%", borderRadius: 3 }}>
                  <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
                    <Stack spacing={0.8} sx={{ mb: 2 }}>
                      <Typography variant="h5" className="section-title">
                        {dashboardCopy.snapshotTitle}
                      </Typography>
                      <Typography color="text.secondary">
                        {isPlatformAdmin ? dashboardCopy.snapshotSubtitles.platform : dashboardCopy.snapshotSubtitles.society}
                      </Typography>
                    </Stack>

                    <Grid container spacing={1.5}>
                      {[
                        {
                          label: isPlatformAdmin ? dashboardCopy.snapshotMetrics.societies : dashboardCopy.snapshotMetrics.customers,
                          value: monitoringOverview ? String(isPlatformAdmin ? monitoringOverview.totals.societies : monitoringOverview.totals.customers) : "0"
                        },
                        {
                          label: dashboardCopy.snapshotMetrics.accounts,
                          value: monitoringOverview ? String(monitoringOverview.totals.accounts) : "0"
                        },
                        {
                          label: dashboardCopy.snapshotMetrics.transactions,
                          value: monitoringOverview ? String(monitoringOverview.totals.transactions) : "0"
                        },
                        {
                          label: dashboardCopy.snapshotMetrics.collectedVolume,
                          value: monitoringOverview ? `₹${formatIndianNumber(Math.round(monitoringOverview.totals.successfulPaymentVolume))}` : "₹0"
                        }
                      ].map((item) => (
                        <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                          <Box className="surface-glass" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.label}
                            </Typography>
                            <Typography variant="h5" sx={{ mt: 0.6 }}>
                              {item.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : null}

          <Card className="surface-glass" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
              <Stack spacing={0.8} sx={{ mb: 2.2 }}>
                <Typography variant="h5" className="section-title">
                  {dashboardCopy.operationalAreaTitle}
                </Typography>
                <Typography color="text.secondary">{getServiceAreaSubtitle(accountType, dashboardCopy)}</Typography>
              </Stack>

              <Grid container spacing={2}>
                {(remainingModules.length > 0 ? remainingModules : localizedModules).map((module) => (
                  <Grid key={module.slug} size={{ xs: 12, md: 6, xl: 4 }}>
                    <ModuleCard module={module} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <WorkspaceFooter />
    </>
  );
}
