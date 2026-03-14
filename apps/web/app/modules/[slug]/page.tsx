"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Button, Container, Stack, Typography } from "@mui/material";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { getAllowedModuleSlugs, resolveAccountTypeByRole } from "@/features/banking/account-access";
import { modules } from "@/features/banking/module-registry";
import { ModuleWorkspace } from "@/features/banking/operations/module-workspace";
import { getSession } from "@/shared/auth/session";
import type { Session } from "@/shared/types";

export default function ModuleDetailPage() {
  const params = useParams<{ slug: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
  }, []);

  const module = modules.find((item) => item.slug === params.slug);
  const accountType = session ? (session.accountType ?? resolveAccountTypeByRole(session.role)) : null;
  const hasAccess = accountType ? getAllowedModuleSlugs(accountType).includes(params.slug) : false;

  if (!ready) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography color="text.secondary">Loading workspace...</Typography>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">Please login to access module workspaces.</Alert>
        <Button component={Link} href="/login" sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (!module) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5">Module not found</Typography>
        <Button component={Link} href="/dashboard" sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!hasAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">This module is not available for your account type.</Alert>
        <Button component={Link} href="/dashboard" sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6">Operational Workspace</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <SettingsMenu size="small" />
            <Button component={Link} href="/dashboard" variant="outlined">
              Back to Dashboard
            </Button>
          </Stack>
        </Stack>
      </Container>
      <ModuleWorkspace slug={module.slug} name={module.name} summary={module.summary} />
    </>
  );
}
