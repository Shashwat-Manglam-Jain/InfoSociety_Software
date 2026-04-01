"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { AdminWorkspaceSkeleton } from "@/components/ui/admin-workspace-skeleton";
import { SocietyForm } from "@/features/society/components/SocietyForm";
import { getMe } from "@/shared/api/client";
import { getSession } from "@/shared/auth/session";
import type { Society } from "@/shared/types";

const pageTitle = "Society Institutional Master";
const pageDescription =
  "Configure central society attributes, compliance identifiers, and billing settings for the current institution.";

export default function SocietySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [society, setSociety] = useState<Society | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSociety() {
      const session = getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (session.accountType !== "SOCIETY") {
        if (active) {
          setError("This page is available to society admin accounts only.");
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await getMe(session.accessToken);

        if (!active) {
          return;
        }

        if (!profile.society) {
          setError("No society record is linked to this account.");
        } else {
          setSociety(profile.society);
          setError(null);
        }
      } catch (caught) {
        if (!active) {
          return;
        }

        setError(caught instanceof Error ? caught.message : "Unable to load society settings.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSociety();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return <AdminWorkspaceSkeleton title={pageTitle} description={pageDescription} variant="society" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom>
          {pageTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {pageDescription}
        </Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : <SocietyForm society={society} onSaved={setSociety} />}
    </Container>
  );
}
