"use client";

import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

const highlights = [
  "Client, agent and superuser login",
  "Society-wise monitoring dashboard",
  "Responsive web app with Material UI",
  "AdSense-ready ad slots for monetized surfaces"
];

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          background: "linear-gradient(120deg, #003f6b 10%, #005792 55%, #0075c4 100%)",
          color: "white",
          boxShadow: "0 18px 36px rgba(0, 63, 107, 0.25)"
        }}
      >
        <Chip label="Infopath Solutions" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", mb: 2 }} />
        <Typography variant="h3" sx={{ fontSize: { xs: "1.9rem", md: "2.8rem" } }}>
          Info Banking Platform
        </Typography>
        <Typography sx={{ mt: 1.2, color: "#dff0ff", maxWidth: 760 }}>
          Unified core banking system for account lifecycle, transactions, loans, reports, and cross-society monitoring.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} mt={3}>
          <Button
            component={Link}
            href="/login"
            endIcon={<ArrowForwardIcon />}
            variant="contained"
            color="secondary"
            size="large"
          >
            Start Login
          </Button>
          <Button component={Link} href="http://localhost:4000/api/docs" target="_blank" variant="outlined" sx={{ color: "white", borderColor: "#b5ddff" }}>
            API Swagger
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2} mt={2}>
        {highlights.map((item) => (
          <Grid size={{ xs: 12, md: 6 }} key={item}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {item}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
