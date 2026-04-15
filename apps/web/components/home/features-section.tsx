"use client";

import { alpha } from "@mui/material/styles";
import { Box, Container, Typography, Grid, Card, CardContent, Stack } from "@mui/material";
import { type ReactNode } from "react";

interface FeaturesSectionProps {
  homeCopy: any;
  features: Array<{ icon: ReactNode; title: string; description: string }>;
}

export function FeaturesSection({ homeCopy, features }: FeaturesSectionProps) {
  return (
    <Box sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ textAlign: "center", alignItems: "center", mb: 5 }}>
          <Box
            className="pill-soft"
            sx={{
              px: 1.8,
              py: 0.8,
              color: "primary.main",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.76rem"
            }}
          >
            Core Advantages
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em", maxWidth: 700 }}>
            {homeCopy.featuresTitle}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
            {homeCopy.featuresSubtitle}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card
                className="surface-glass hover-lift"
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <CardContent sx={{ p: 3.2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      mb: 2.25,
                      color: "secondary.main",
                      background: (theme) =>
                        `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`,
                      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.75 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
