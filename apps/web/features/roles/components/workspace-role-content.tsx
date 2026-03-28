"use client";

import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import {
  getRestrictedWorkspaceModules,
  getWorkspaceDefinition,
  getWorkspaceModules,
  getWorkspaceUiCopy,
  type WorkspaceRoleSlug
} from "@/features/roles/workspace-definitions";
import { useLanguage } from "@/shared/i18n/language-provider";

function DetailList({ items, tone = "accent" }: { items: string[]; tone?: "accent" | "neutral" }) {
  return (
    <Stack spacing={0.2}>
      {items.map((item, index) => (
        <Box
          key={item}
          sx={{
            display: "flex",
            gap: 1.2,
            alignItems: "flex-start",
            py: 1,
            borderBottom: index === items.length - 1 ? "none" : "1px solid rgba(148, 163, 184, 0.14)"
          }}
        >
          <Box
            sx={{
              mt: 0.85,
              width: 8,
              height: 8,
              borderRadius: "999px",
              flexShrink: 0,
              bgcolor: tone === "accent" ? "secondary.main" : "rgba(148, 163, 184, 0.9)"
            }}
          />
          <Typography color="text.secondary">{item}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

export function WorkspaceRoleContent({ role }: { role: WorkspaceRoleSlug }) {
  const { locale } = useLanguage();
  const workspace = getWorkspaceDefinition(role, locale);

  if (!workspace) {
    return null;
  }

  const workspaceUi = getWorkspaceUiCopy(locale);
  const visibleModules = getWorkspaceModules(workspace.slug, locale);
  const restrictedModules = getRestrictedWorkspaceModules(workspace.slug, locale);

  return (
    <PublicContentShell badge={workspace.badge} title={workspace.title} subtitle={workspace.subtitle}>
      <Card className="surface-glass" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap" useFlexGap justifyContent="space-between">
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip label={workspaceUi.cardAuthorizedModules(visibleModules.length)} color="secondary" variant="outlined" />
              <Chip label={workspaceUi.cardRestrictedCapabilities(restrictedModules.length)} variant="outlined" />
              <Chip label={workspace.navLabel} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {workspace.provisioningNote}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {workspaceUi.roleProfileOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {workspaceUi.roleProfileTitle}
              </Typography>
              <Stack spacing={0.9}>
                <Typography color="text.secondary">
                  <strong>{workspaceUi.audienceLabel}:</strong> {workspace.audience}
                </Typography>
                <Typography color="text.secondary">
                  <strong>{workspaceUi.dataScopeLabel}:</strong> {workspace.dataScope}
                </Typography>
                <Typography color="text.secondary">
                  <strong>{workspaceUi.primaryResponsibilityLabel}:</strong> {workspace.primaryResponsibility}
                </Typography>
              </Stack>
              <Box sx={{ mt: 1.2 }}>
                <DetailList items={workspace.visibleHighlights} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {workspaceUi.operatingAuthorityOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {workspaceUi.operatingAuthorityTitle}
              </Typography>
              <DetailList items={workspace.adminTools} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {workspaceUi.modulePortfolioOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {workspaceUi.modulePortfolioTitle}
              </Typography>
              <Grid container spacing={1.5}>
                {visibleModules.map((module) => (
                  <Grid key={module.slug} size={{ xs: 12, sm: 6 }}>
                    <Box className="surface-glass" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography fontWeight={700}>{module.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6, mb: 1 }}>
                        {module.summary}
                      </Typography>
                      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={workspaceUi.moduleApiCount(module.endpoints.length)} color="secondary" variant="outlined" />
                        <Chip size="small" label={module.endpoints[0]} variant="outlined" />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card className="surface-glass" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {workspaceUi.operatingModelOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                {workspaceUi.operatingModelTitle}
              </Typography>
              <DetailList items={workspace.dailyWork} />

              <Typography variant="subtitle1" sx={{ mt: 1.8, mb: 1 }}>
                {workspaceUi.restrictedCapabilitiesTitle}
              </Typography>
              <DetailList items={workspace.hiddenFromRole} tone="neutral" />

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.8, mb: 0.8 }}>
                {workspaceUi.restrictedModuleFamiliesLabel}
              </Typography>
              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                {restrictedModules.slice(0, 6).map((module) => (
                  <Chip key={module.slug} label={module.name} size="small" />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card className="surface-vibrant">
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.4}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                {workspaceUi.provisioningRecommendationOverline}
              </Typography>
              <Typography variant="h6">{workspaceUi.provisioningRecommendationTitle}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                {workspace.provisioningNote} {workspaceUi.provisioningRecommendationBodySuffix}
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button component={Link} href={workspace.primaryAction.href} variant="contained">
                {workspace.primaryAction.label}
              </Button>
              <Button component={Link} href={workspace.secondaryAction.href} variant="outlined">
                {workspace.secondaryAction.label}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PublicContentShell>
  );
}
