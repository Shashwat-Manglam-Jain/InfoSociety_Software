"use client";

import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { alpha } from "@mui/material/styles";

interface CapabilitiesSectionProps {
  homeCopy: any;
}

export function CapabilitiesSection({ homeCopy }: CapabilitiesSectionProps) {
  return (
    <Box id="modules" sx={{ bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.09), py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          {homeCopy.capabilitiesTitle}
        </Typography>
        <Grid container spacing={2.2}>
          {homeCopy.capabilities?.map((cap: string) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cap}>
              <Card className="surface-glass hover-lift" sx={{ height: "100%", borderRadius: 1 }}>
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
  );
}
