import type { Metadata } from "next";
import Link from "next/link";
import { Button, Stack } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: `404 | ${appBranding.productShortName}`,
  description: "Page not found"
};

export const dynamic = "force-dynamic";

export default function NotFoundPage() {
  return (
    <PublicContentShell
      badge="404"
      title="Page Not Found"
      subtitle="The page you are looking for does not exist or has been moved."
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button component={Link} href="/" variant="contained" color="primary">
          Return to home
        </Button>
        <Button component={Link} href="/contact" variant="outlined" color="primary">
          Contact support
        </Button>
      </Stack>
    </PublicContentShell>
  );
}
