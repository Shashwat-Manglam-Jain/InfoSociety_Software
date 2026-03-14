import type { Metadata } from "next";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Advertising Disclosure",
  description: "Disclosure on ad placements and monetization policy compliance.",
  alternates: {
    canonical: "/advertising-disclosure"
  }
};

export default function AdvertisingDisclosurePage() {
  return (
    <PublicContentShell
      badge="Disclosure"
      title="Advertising Disclosure"
      subtitle={`${appBranding.productShortName} may display third-party ads on selected public pages in compliance with platform and ad network policies.`}
    >
      <Stack spacing={2}>
        <Card className="surface-glass">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.7 }}>
              Ad Placement Policy
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 0.4 }}>
              Ads are clearly separated from primary product workflows.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 0.4 }}>
              No incentivized clicks, forced interactions, or deceptive UI patterns are used.
            </Typography>
            <Typography color="text.secondary">
              Users should click advertisements only when the content is genuinely relevant.
            </Typography>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.7 }}>
              Transparency Commitment
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 0.4 }}>
              Public policy pages are maintained for transparency and platform trust.
            </Typography>
            <Typography color="text.secondary">
              Ad delivery may rely on third-party cookies as described in the privacy policy.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </PublicContentShell>
  );
}
