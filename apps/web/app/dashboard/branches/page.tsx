"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { AdminWorkspaceSkeleton } from "@/components/ui/admin-workspace-skeleton";
import { BranchForm } from "@/features/branches/components/BranchForm";
import { getSession } from "@/shared/auth/session";

const pageTitle = "Branches Management";
const pageDescription =
  "Configure branch locations, service flags, and routing details for the current society workspace.";

export default function BranchesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.accountType !== "SOCIETY") {
      setError("Branch configuration is available to society admin accounts only.");
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return <AdminWorkspaceSkeleton title={pageTitle} description={pageDescription} variant="branches" />;
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

      {error ? <Alert severity="error">{error}</Alert> : <BranchForm />}
    </Container>
  );
}
