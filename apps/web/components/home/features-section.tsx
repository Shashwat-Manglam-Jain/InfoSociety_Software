"use client";

import { Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { type ReactNode } from "react";

interface FeaturesSectionProps {
  homeCopy: any;
  features: Array<{ icon: ReactNode; title: string; description: string }>;
}

export function FeaturesSection({ homeCopy, features }: FeaturesSectionProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 1, fontWeight: 700 }}>
        {homeCopy.featuresTitle}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: "center", maxWidth: 600, mx: "auto", mb: 4 }}>
        {homeCopy.featuresSubtitle}
      </Typography>

      <Grid container spacing={3}>
        {features.map((feature, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card className="surface-glass hover-lift" sx={{ height: "100%", textAlign: "center", borderRadius: 3 }}>
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
  );
}
