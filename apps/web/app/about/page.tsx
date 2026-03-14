import type { Metadata } from "next";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "About",
  description: `About ${appBranding.companyName} and the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/about"
  }
};

const valueCards = [
  {
    title: "Operational Clarity",
    detail: "We design around real day-to-day society savings operations so teams can execute with fewer handoffs."
  },
  {
    title: "Platform Reliability",
    detail: "The platform is structured for role-based workflows, auditable records, and repeatable operational quality."
  },
  {
    title: "Cooperative Focus",
    detail: `${appBranding.productShortName} is built specifically for societies and cooperative groups, not generic enterprise workflows.`
  }
];

export default function AboutPage() {
  return (
    <PublicContentShell
      badge="About Infopath"
      title="A Professional Platform for Society Savings"
      subtitle={`${appBranding.companyName} builds software that helps societies run structured savings collections, interest tracking, and reporting with disciplined workflows.`}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.8 }}>
                What We Deliver
              </Typography>
              <Typography color="text.secondary" paragraph>
                {appBranding.productShortName} combines member onboarding, savings collections, interest tracking, payment workflows,
                administration, and reporting in one integrated platform.
              </Typography>
              <Typography color="text.secondary">
                The product supports clients, agents, and superusers with controlled access and workflow-oriented tools so
                institutions can scale operations with consistent controls.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Product Snapshot
              </Typography>
              <Stack spacing={0.8}>
                <Chip label="Web Platform" color="primary" variant="outlined" />
                <Chip label="Module-based Workflows" color="primary" variant="outlined" />
                <Chip label="Role-based Access" color="primary" variant="outlined" />
                <Chip label="Monitoring + Reporting" color="primary" variant="outlined" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.6 }}>
        {valueCards.map((item) => (
          <Grid size={{ xs: 12, md: 4 }} key={item.title}>
            <Card className="surface-glass hover-lift" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.7 }}>
                  {item.detail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PublicContentShell>
  );
}
