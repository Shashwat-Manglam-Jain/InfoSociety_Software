"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import GroupsIcon from "@mui/icons-material/Groups";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import {
  getWorkspaceDefinitions,
  getWorkspaceModules,
  getWorkspaceUiCopy
} from "@/features/roles/workspace-definitions";
import { getBillingPlans } from "@/shared/api/client";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getHomePageCopy } from "@/shared/i18n/marketing-copy";
import { toast } from "@/shared/ui/toast";
import { getSession } from "@/shared/auth/session";
import { useRouter } from "next/navigation";

type PricingPlan = {
  id: "FREE" | "PREMIUM";
  price: string;
  descriptionKey: "pricing.free.description" | "pricing.premium.description";
  features: string[];
  highlighted?: boolean;
};

export default function HomePage() {
  const { locale, t } = useLanguage();
  const [premiumMonthlyPrice, setPremiumMonthlyPrice] = useState<number | null>(null);
  const router = useRouter();
  const workspaceUi = useMemo(() => getWorkspaceUiCopy(locale), [locale]);
  const workspaces = useMemo(() => getWorkspaceDefinitions(locale), [locale]);
  const homeCopy = useMemo(() => getHomePageCopy(locale), [locale]);

  const features = useMemo(
    () => [
      {
        icon: <SecurityIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
        title: homeCopy.features[0]?.title ?? "",
        description: homeCopy.features[0]?.description ?? ""
      },
      {
        icon: <SpeedIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
        title: homeCopy.features[1]?.title ?? "",
        description: homeCopy.features[1]?.description ?? ""
      },
      {
        icon: <GroupsIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
        title: homeCopy.features[2]?.title ?? "",
        description: homeCopy.features[2]?.description ?? ""
      },
      {
        icon: <AnalyticsIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
        title: homeCopy.features[3]?.title ?? "",
        description: homeCopy.features[3]?.description ?? ""
      }
    ],
    [homeCopy]
  );

  const currencyFormatter = useMemo(() => {
    const currencyLocale = locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
    return new Intl.NumberFormat(currencyLocale, { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  }, [locale]);

  const pricingPlans = useMemo<PricingPlan[]>(
    () => [
      {
        id: "FREE",
        price: "₹0",
        descriptionKey: "pricing.free.description",
        features: homeCopy.freePlanFeatures
      },
      {
        id: "PREMIUM",
        price:
          premiumMonthlyPrice === null
            ? homeCopy.premiumPriceFallback
            : `${currencyFormatter.format(premiumMonthlyPrice)}${homeCopy.premiumPerMonthSuffix}`,
        descriptionKey: "pricing.premium.description",
        features: homeCopy.premiumPlanFeatures,
        highlighted: true
      }
    ],
    [currencyFormatter, homeCopy, premiumMonthlyPrice]
  );

  useEffect(() => {
    if (getSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const response = await getBillingPlans();
        if (!active) return;

        const premium = response.plans.find((plan) => plan.id === "PREMIUM");
        if (!premium) return;

        setPremiumMonthlyPrice(premium.monthlyPrice);
      } catch {
        // Keep fallback pricing copy when API is unavailable.
      }
    }

    void loadPlans();

    return () => {
      active = false;
    };
  }, [currencyFormatter]);

  const handleAction = (message: string) => {
    toast.success(message);
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 45%, ${theme.palette.secondary.light} 100%)`,
          color: "white",
          py: { xs: 6, md: 10 },
          overflow: "hidden",
          position: "relative"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {homeCopy.heroBadge}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  mt: 1,
                  mb: 2,
                  fontWeight: 800,
                  lineHeight: 1.2
                }}
              >
                {homeCopy.heroTitle}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  mb: 3,
                  color: "rgba(255,255,255,0.9)",
                  maxWidth: 480
                }}
              >
                {homeCopy.heroDescription}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={Link}
                  href="/register?type=CLIENT&plan=FREE"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleAction(homeCopy.registerToast)}
                >
                  {homeCopy.heroPrimaryAction}
                </Button>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  size="large"
                  sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)" }}
                  onClick={() => handleAction(homeCopy.loginToast)}
                >
                  {homeCopy.heroSecondaryAction}
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  p: 3,
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)" }}>
                  {homeCopy.heroPanelTitle}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.92)", mt: 0.4, mb: 2.2, maxWidth: 440 }}>
                  {homeCopy.heroPanelDescription}
                </Typography>
                <Stack spacing={2}>
                  {homeCopy.capabilities.slice(0, 3).map((cap) => (
                    <Stack key={cap} direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ color: "#4ECB71" }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{cap}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            mb: 1,
            fontWeight: 700
          }}
        >
          {homeCopy.featuresTitle}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            textAlign: "center",
            maxWidth: 600,
            mx: "auto",
            mb: 4
          }}
        >
          {homeCopy.featuresSubtitle}
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card
                className="surface-glass hover-lift"
                sx={{
                  height: "100%",
                  textAlign: "center",
                  borderRadius: 3
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Capabilities Highlight */}
      <Box id="modules" sx={{ bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.09), py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            {homeCopy.capabilitiesTitle}
          </Typography>
          <Grid container spacing={2.2}>
            {homeCopy.capabilities.map((cap) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cap}>
                <Card className="surface-glass hover-lift" sx={{ height: "100%", borderRadius: 2.5 }}>
                  <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 2.2 }}>
                    <CheckCircleIcon sx={{ color: "secondary.main", flexShrink: 0, mt: 0.2 }} />
                    <Typography>{cap}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container id="workspaces" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            mb: 1,
            fontWeight: 700
          }}
        >
          {workspaceUi.homeSectionTitle}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            textAlign: "center",
            maxWidth: 720,
            mx: "auto",
            mb: 4
          }}
        >
          {workspaceUi.homeSectionSubtitle}
        </Typography>

        <Grid container spacing={3}>
          {workspaces.map((workspace) => {
            const visibleModules = getWorkspaceModules(workspace.slug, locale);

            return (
              <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={workspace.slug}>
                <Card
                  className="surface-glass hover-lift"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 1.2 }}>
                      <Chip label={workspace.badge} color="primary" size="small" />
                      <Chip label={workspaceUi.cardModules(visibleModules.length)} variant="outlined" size="small" />
                    </Stack>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {workspace.title}
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1.4 }}>
                      {workspace.subtitle}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.8 }}>
                      <strong>{workspaceUi.cardScopeLabel}:</strong> {workspace.dataScope}
                    </Typography>
                    <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                      {visibleModules.slice(0, 3).map((module) => (
                        <Chip key={module.slug} label={module.name} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button component={Link} href={workspace.href} variant="contained" fullWidth>
                        {workspaceUi.reviewRoleButton}
                      </Button>
                      <Button component={Link} href={workspace.primaryAction.href} variant="outlined" fullWidth>
                        {workspace.primaryAction.label}
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Container id="plans" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            mb: 1,
            fontWeight: 700
          }}
        >
          {t("pricing.title")}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            textAlign: "center",
            maxWidth: 500,
            mx: "auto",
            mb: 4
          }}
        >
          {t("pricing.subtitle")}
        </Typography>

        <Grid container spacing={3} maxWidth={900} mx="auto" sx={{ overflow: "visible", position: "relative" }}>
          {pricingPlans.map((plan) => (
            <Grid size={{ xs: 12, md: 6 }} key={plan.id} sx={{ overflow: "visible", position: "relative" }}>
              <Card
                sx={(theme) => ({
                  height: "100%",
                  minHeight: 360,
                  border: plan.highlighted
                    ? `2px solid ${alpha(theme.palette.secondary.main, theme.palette.mode === "light" ? 0.55 : 0.7)}`
                    : `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  bgcolor: plan.highlighted
                    ? alpha(theme.palette.secondary.main, theme.palette.mode === "light" ? 0.12 : 0.2)
                    : alpha(theme.palette.background.paper, theme.palette.mode === "light" ? 0.9 : 0.5),
                  position: "relative",
                  overflow: "visible",
                  transform: plan.highlighted ? "translateY(-4px)" : "none",
                  boxShadow: plan.highlighted ? `0 18px 40px ${alpha(theme.palette.secondary.dark, 0.22)}` : "0 10px 20px rgba(15,23,42,0.08)",
                  zIndex: plan.highlighted ? 3 : 1
                })}
              >
                {plan.highlighted && (
                  <Chip
                    label={t("pricing.recommended")}
                    color="secondary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -16,
                      left: 16,
                      zIndex: 99,
                      boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                      bgcolor: "secondary.dark",
                      color: "white"
                    }}
                  />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {plan.id === "PREMIUM" ? t("pricing.premium.title") : t("pricing.free.title")}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1.5 }}>
                    {t(plan.descriptionKey)}
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                    {plan.price}
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2.5 }}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: "secondary.main", mt: 0.2 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    component={Link}
                    href={plan.highlighted ? "/register?type=SOCIETY&plan=PREMIUM" : "/register?type=CLIENT&plan=FREE"}
                    variant={plan.highlighted ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => handleAction(homeCopy.pricingSelection(plan.id === "PREMIUM" ? t("pricing.premium.title") : t("pricing.free.title")))}
                  >
                    {t("pricing.get_started")}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "secondary.main",
          color: "white",
          py: { xs: 6, md: 8 },
          textAlign: "center"
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            {homeCopy.ctaTitle}
          </Typography>
          <Typography sx={{ mb: 3, fontSize: "1.05rem" }}>
            {homeCopy.ctaSubtitle}
          </Typography>
          <Button
            component={Link}
            href="/register"
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              bgcolor: "background.paper",
              color: "secondary.main",
              "&:hover": { bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9) }
            }}
            onClick={() => handleAction(homeCopy.ctaToast)}
          >
            {homeCopy.ctaButton}
          </Button>
        </Container>
      </Box>

    </>
  );
}
