"use client";

import { Alert, Box, Button, Card, CardContent, Chip, Container, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import type { BillingPlansResponse } from "@/shared/types";

type PricingPlan = BillingPlansResponse["plans"][number] & {
  highlighted?: boolean;
};

interface PricingSectionProps {
  t: any;
  pricingPlans: PricingPlan[];
  pricingLoading: boolean;
  pricingError: string | null;
  handleAction: (msg: string) => void;
  homeCopy: any;
}

function formatPlanPrice(monthlyPrice: number) {
  if (monthlyPrice <= 0) {
    return "₹0";
  }

  return `₹${monthlyPrice.toLocaleString("en-IN")}/mo`;
}

export function PricingSection({ t, pricingPlans, pricingLoading, pricingError, handleAction, homeCopy }: PricingSectionProps) {
  return (
    <Container id="plans" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 1, fontWeight: 700 }}>
        {t("pricing.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: "center", maxWidth: 500, mx: "auto", mb: 4 }}>
        {t("pricing.subtitle")}
      </Typography>

      {pricingError && !pricingLoading && pricingPlans.length === 0 ? (
        <Alert severity="warning" sx={{ maxWidth: 900, mx: "auto", mb: 4, borderRadius: 1 }}>
          {pricingError}
        </Alert>
      ) : null}

      <Grid container spacing={3} maxWidth={900} mx="auto" sx={{ overflow: "visible", position: "relative" }}>
        {pricingLoading
          ? [1, 2].map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item} sx={{ overflow: "visible", position: "relative" }}>
                <Card sx={{ height: "100%", minHeight: 320, borderRadius: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width={140} height={38} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width={110} height={48} sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                      <Skeleton variant="rounded" width={110} height={28} />
                      <Skeleton variant="rounded" width={100} height={28} />
                    </Stack>
                    <Skeleton variant="rounded" width="100%" height={42} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : null}

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
                  {plan.name}
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1.5 }}>
                  {plan.description}
                </Typography>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                  {formatPlanPrice(plan.monthlyPrice)}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                  <Chip
                    label={plan.adsEnabled ? "Ads Enabled" : "Ad-free"}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label={plan.monthlyPrice > 0 ? "Paid Plan" : "Starter Plan"}
                    size="small"
                    color={plan.highlighted ? "secondary" : "default"}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip label="Society Access" size="small" sx={{ fontWeight: 800 }} />
                </Stack>
                <Button
                  component={Link}
                  href="/register"
                  variant={plan.highlighted ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => handleAction(homeCopy.pricingSelection(plan.name))}
                >
                  {t("pricing.get_started")}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
