import type { Metadata } from "next";
import { Card, CardContent, Container, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "Advertising Disclosure",
  description: "Disclosure on ad placements and monetization policy compliance.",
  alternates: {
    canonical: "/advertising-disclosure"
  }
};

export default function AdvertisingDisclosurePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography component="h1" variant="h4" mb={1.5}>
            Advertising Disclosure
          </Typography>
          <Typography color="text.secondary" paragraph>
            This platform may show advertisements provided by Google AdSense on selected pages.
          </Typography>
          <Typography color="text.secondary" paragraph>
            Ads are clearly labeled and are not tied to incentives, forced interactions, or misleading UI patterns.
          </Typography>
          <Typography color="text.secondary">
            Users should click ads only when interested. Invalid traffic and artificial click behavior are not allowed.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
