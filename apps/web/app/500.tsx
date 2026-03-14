import type { Metadata } from "next";
import Link from "next/link";
import { Button, Stack } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: `500 | ${appBranding.productShortName}`,
  description: "Internal server error"
};

export const dynamic = "force-dynamic";

export default function InternalServerError() {
  return (
    <PublicContentShell
      badge="500"
      title="Internal Server Error"
      subtitle="Sorry, something went wrong on our end. Please try again in a moment."
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button component={Link} href="/" variant="contained" color="primary">
          Go back to homepage
        </Button>
        <Button component={Link} href="/contact" variant="outlined" color="primary">
          Contact support
        </Button>
      </Stack>
    </PublicContentShell>
  );
}
