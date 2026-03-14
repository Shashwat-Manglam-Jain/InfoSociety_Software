"use client";

import Link from "next/link";
import { Alert, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { appBranding } from "@/shared/config/branding";

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Card className="surface-vibrant fade-rise hover-lift" sx={{ overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={1.4}>
            <Typography variant="h4" className="section-title">
              Something went wrong
            </Typography>
            <Typography color="text.secondary">
              An unexpected error has occurred. Please refresh the page or return to the homepage.
            </Typography>
            <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
              {error.message}
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button component={Link} href="/" variant="contained" color="primary">
                Return to home
              </Button>
              <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
                Refresh page
              </Button>
              <Button component={Link} href="/contact" variant="text" color="primary">
                Contact support
              </Button>
            </Stack>
            {error.digest ? (
              <Typography variant="caption" color="text.secondary">
                {appBranding.productShortName} error digest: {error.digest}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
