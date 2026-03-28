"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { SettingsMenu } from "@/components/ui/settings-menu";
import { getAllowedModuleSlugs, resolveAccountTypeByRole } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";
import { modules } from "@/features/banking/module-registry";
import { ModuleWorkspace } from "@/features/banking/operations/module-workspace";
import { getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { Session } from "@/shared/types";

export default function ModuleDetailPage() {
  const params = useParams<{ slug: string }>();
  const { locale, t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
  }, []);

  const baseModule = modules.find((item) => item.slug === params.slug);
  const module = baseModule ? localizeBankingModule(baseModule, locale) : null;
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
      <Container maxWidth="lg" sx={{ pt: 2.5 }}>
        <Card className="surface-glass" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={1.5}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Service Workspace
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.4 }}>
                  {module.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.6, maxWidth: 780 }}>
                  {module.summary}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button component={Link} href="/about" variant="outlined">
                  {t("nav.about")}
                </Button>
                <Button component={Link} href="/contact" variant="outlined">
                  {t("nav.contact")}
                </Button>
                <SettingsMenu size="small" />
                <Button component={Link} href="/dashboard" variant="contained">
                  Back to Dashboard
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <ModuleWorkspace slug={module.slug} name={module.name} summary={module.summary} />
      <WorkspaceFooter />
    </>
  );
}
