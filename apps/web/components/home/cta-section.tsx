"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

interface CtaSectionProps {
  homeCopy: any;
  handleAction: (msg: string) => void;
}

export function CtaSection({ homeCopy, handleAction }: CtaSectionProps) {
  return (
    <Box
      sx={{
        bgcolor: "secondary.main",
        color: "white",
        py: { xs: 6, md: 8 },
        textAlign: "center"
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          {homeCopy.ctaTitle}
        </Typography>
        <Typography sx={{ mb: 3, fontSize: "1.05rem" }}>
          {homeCopy.ctaSubtitle}
        </Typography>
        <Button
          component={Link}
          href="/register"
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            bgcolor: "background.paper",
            color: "secondary.main",
            "&:hover": { bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9) }
          }}
          onClick={() => handleAction(homeCopy.ctaToast)}
        >
          {homeCopy.ctaButton}
        </Button>
      </Container>
    </Box>
  );
}
