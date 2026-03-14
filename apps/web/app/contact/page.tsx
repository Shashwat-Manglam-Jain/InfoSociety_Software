import type { Metadata } from "next";
import { Card, CardContent, Link, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${appBranding.companyName} support and business team.`,
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return (
    <PublicContentShell
      badge="Support"
      title="Contact the Infopath Team"
      subtitle="For onboarding, implementation planning, support, and partnerships, use the channels below."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.8 }}>
                General Support
              </Typography>
              <Typography color="text.secondary">
                Email: <Link href="mailto:support@infopath.local">support@infopath.local</Link>
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.7 }}>
                Hours: Monday to Saturday, 9:30 AM to 6:30 PM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.8 }}>
                Sales and Partnerships
              </Typography>
              <Typography color="text.secondary">
                Email: <Link href="mailto:business@infopath.local">business@infopath.local</Link>
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.7 }}>
                Scope: Enterprise onboarding, pricing, and deployment planning
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.8 }}>
                Office
              </Typography>
              <Typography color="text.secondary">{appBranding.companyName}</Typography>
              <Typography color="text.secondary">Society Operations Center</Typography>
              <Typography color="text.secondary">India</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card className="surface-glass" sx={{ mt: 2 }}>
        <CardContent>
          <Stack spacing={0.6}>
            <Typography variant="h6">Response Commitment</Typography>
            <Typography color="text.secondary">Support requests are triaged by priority and role impact.</Typography>
            <Typography color="text.secondary">
              For production incidents, include organization name, role, endpoint/module, and timestamp.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </PublicContentShell>
  );
}
