"use client";

import Link from "next/link";
import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import {
  getWorkspaceDefinitions,
  getWorkspaceModules,
  getWorkspaceUiCopy
} from "@/features/roles/workspace-definitions";
import { useLanguage } from "@/shared/i18n/language-provider";

export function WorkspacesOverviewContent() {
  const { locale } = useLanguage();
  const workspaceUi = getWorkspaceUiCopy(locale);
  const workspaces = getWorkspaceDefinitions(locale);
  const totalModuleCoverage = new Set(
    workspaces.flatMap((workspace) => getWorkspaceModules(workspace.slug, locale).map((module) => module.slug))
  ).size;

  return (
    <PublicContentShell
      badge={workspaceUi.overviewBadge}
      title={workspaceUi.overviewTitle}
      subtitle={workspaceUi.overviewSubtitle}
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            title: workspaceUi.statRoleProfilesTitle,
            value: String(workspaces.length),
            caption: workspaceUi.statRoleProfilesCaption
          },
          {
            title: workspaceUi.statModuleCoverageTitle,
            value: String(totalModuleCoverage),
            caption: workspaceUi.statModuleCoverageCaption
          },
          {
            title: workspaceUi.statProvisioningTitle,
            value: workspaceUi.statProvisioningValue,
            caption: workspaceUi.statProvisioningCaption
          }
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, md: 4 }}>
            <Card className="surface-glass" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography variant="h5" sx={{ mb: 0.8 }}>
                  {item.value}
                </Typography>
                <Typography color="text.secondary">{item.caption}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {workspaces.map((workspace) => {
          const visibleModules = getWorkspaceModules(workspace.slug, locale);

          return (
            <Grid size={{ xs: 12, md: 6 }} key={workspace.slug}>
              <Card className="surface-glass hover-lift" sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Stack spacing={1.1} sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                      <Chip label={workspace.badge} color="primary" />
                      <Chip label={workspaceUi.cardAuthorizedModules(visibleModules.length)} variant="outlined" />
                    </Stack>

                    <Typography variant="h5">{workspace.title}</Typography>
                    <Typography color="text.secondary">{workspace.subtitle}</Typography>

                    <Typography variant="body2">
                      <strong>{workspaceUi.cardAudienceLabel}:</strong> {workspace.audience}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{workspaceUi.cardScopeLabel}:</strong> {workspace.dataScope}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{workspaceUi.cardProvisioningLabel}:</strong> {workspace.provisioningNote}
                    </Typography>

                    <Stack spacing={0.8}>
                      <Typography variant="overline" color="text.secondary">
                        {workspaceUi.cardKeyModulesLabel}
                      </Typography>
                      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        {visibleModules.slice(0, 5).map((module) => (
                          <Chip key={module.slug} label={module.name} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Stack>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                    <Button component={Link} href={workspace.href} variant="contained">
                      {workspaceUi.reviewRoleButton}
                    </Button>
                    <Button component={Link} href={workspace.primaryAction.href} variant="outlined">
                      {workspace.primaryAction.label}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </PublicContentShell>
  );
}
