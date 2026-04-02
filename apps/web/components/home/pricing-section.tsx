"use client";

import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

interface PricingSectionProps {
  t: any;
  pricingPlans: any[];
  handleAction: (msg: string) => void;
  homeCopy: any;
}

export function PricingSection({ t, pricingPlans, handleAction, homeCopy }: PricingSectionProps) {
  return (
    <Container id="plans" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 1, fontWeight: 700 }}>
        {t("pricing.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: "center", maxWidth: 500, mx: "auto", mb: 4 }}>
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
                  {plan.features?.map((feature: string) => (
                    <Stack key={feature} direction="row" spacing={1}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: "secondary.main", mt: 0.2 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  component={Link}
                  href="/register"
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
  );
}
