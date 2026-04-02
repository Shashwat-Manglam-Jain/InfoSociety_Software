"use client";

import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import PermIdentityRoundedIcon from "@mui/icons-material/PermIdentityRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { WorkspacePreviewCard } from "@/features/roles/components/workspace-preview-card";
import {
  getWorkspaceDefinitions,
  getWorkspaceModules,
  getWorkspaceUiCopy
} from "@/features/roles/workspace-definitions";
import { useLanguage } from "@/shared/i18n/language-provider";

const workspaceAccents = {
  client: { accent: "#0f766e", icon: <PermIdentityRoundedIcon /> },
  agent: { accent: "#b45309", icon: <SupportAgentRoundedIcon /> },
  "society-admin": { accent: "#1d4ed8", icon: <ApartmentRoundedIcon /> },
  "platform-admin": { accent: "#334155", icon: <ShieldOutlinedIcon /> }
} as const;

export function WorkspacesOverviewContent() {
  const { locale } = useLanguage();
  const workspaceUi = getWorkspaceUiCopy(locale);
  const workspaces = getWorkspaceDefinitions(locale);
  const workspaceEntries = workspaces.map((workspace) => ({
    workspace,
    visibleModules: getWorkspaceModules(workspace.slug, locale)
  }));
  const totalModuleCoverage = new Set(
    workspaceEntries.flatMap(({ visibleModules }) => visibleModules.map((module) => module.slug))
  ).size;
  const roleHighlights = workspaceEntries.map(({ workspace, visibleModules }) => ({
    ...workspaceAccents[workspace.slug],
    slug: workspace.slug,
    navLabel: workspace.navLabel,
    badge: workspace.badge,
    moduleCount: visibleModules.length,
    title: workspace.title
  }));
  const overviewStats = [
    {
      title: workspaceUi.statRoleProfilesTitle,
      value: String(workspaces.length),
      caption: workspaceUi.statRoleProfilesCaption,
      accent: "#0f766e",
      helper: workspaceUi.statRoleProfilesHelper,
      icon: <ApartmentRoundedIcon />
    },
    {
      title: workspaceUi.statModuleCoverageTitle,
      value: String(totalModuleCoverage),
      caption: workspaceUi.statModuleCoverageCaption,
      accent: "#1d4ed8",
      helper: workspaceUi.statModuleCoverageHelper,
      icon: <HubRoundedIcon />
    },
    {
      title: workspaceUi.statProvisioningTitle,
      value: workspaceUi.statProvisioningValue,
      caption: workspaceUi.statProvisioningCaption,
      accent: "#b45309",
      helper: workspaceUi.statProvisioningHelper,
      icon: <ShieldOutlinedIcon />
    }
  ];

  return (
    <PublicContentShell
      badge={workspaceUi.overviewBadge}
      title={workspaceUi.overviewTitle}
      subtitle={workspaceUi.overviewSubtitle}
      maxWidth="xl"
    >
      <Card
        className="surface-vibrant fade-rise"
        sx={{
          mb: 2.2,
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(29, 78, 216, 0.16)",
          background:
            "radial-gradient(140% 140% at 0% 0%, rgba(15, 118, 110, 0.18) 0%, rgba(255,255,255,0) 40%), radial-gradient(130% 130% at 100% 8%, rgba(29, 78, 216, 0.14) 0%, rgba(255,255,255,0) 48%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,252,0.98) 100%)",
          boxShadow: "0 30px 80px rgba(15,23,42,0.06)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.72) 100%)"
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2.2, md: 3 }, position: "relative", zIndex: 1 }}>
          <Grid container spacing={2.4} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 6.8 }}>
              <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "center" }}>
                <Chip
                  label={workspaceUi.overviewHeroBadge}
                  icon={<VerifiedUserRoundedIcon />}
                  sx={{
                    width: "fit-content",
                    bgcolor: "rgba(49, 130, 206, 0.12)",
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: 0.3
                  }}
                />
                <Typography
                  variant="h3"
                  className="section-title"
                  sx={{
                    fontSize: { xs: "2rem", md: "2.8rem" },
                    maxWidth: 720,
                    background: "linear-gradient(90deg, #1d4ed8, #0f766e)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  {workspaceUi.overviewHeroTitle}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 760, fontSize: { md: "1.02rem" }, lineHeight: 1.72 }}>
                  {workspaceUi.overviewHeroBody}
                </Typography>

                <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
                  {[
                    workspaceUi.overviewFeatureFixedRail,
                    workspaceUi.overviewFeatureSearchFirst,
                    workspaceUi.overviewFeatureOperationalCards,
                    workspaceUi.overviewFeatureLeastPrivilege
                  ].map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                        fontWeight: 700,
                        color: "#334155"
                      }}
                    />
                  ))}
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    border: "1px solid rgba(15, 118, 110, 0.14)",
                    background: "rgba(15, 118, 110, 0.06)",
                    maxWidth: 680
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    {workspaceUi.overviewIntentionLabel}
                  </Typography>
                  <Typography sx={{ mt: 0.65, fontWeight: 700, color: "#0f766e" }}>
                    {workspaceUi.overviewIntentionTitle}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.65, lineHeight: 1.65 }}>
                    {workspaceUi.overviewIntentionBody}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 5.2 }}>
              <Grid container spacing={1.1}>
                {roleHighlights.map((item) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item.slug}>
                    <Box
                      sx={{
                        p: 2,
                        height: "100%",
                        borderRadius: 4,
                        borderLeft: `4px solid ${item.accent}`,
                        background: "rgba(255,255,255,0.94)",
                        boxShadow: `0 20px 40px ${alpha(item.accent, 0.08)}`
                      }}
                    >
                      <Stack spacing={1.25} sx={{ height: "100%" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2.8,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: alpha(item.accent, 0.14),
                              color: item.accent,
                              boxShadow: `0 10px 24px ${alpha(item.accent, 0.12)}`
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Chip
                            label={workspaceUi.cardModules(item.moduleCount)}
                            size="small"
                            sx={{
                              bgcolor: alpha(item.accent, 0.12),
                              color: item.accent,
                              fontWeight: 700
                            }}
                          />
                        </Stack>
                        <Box>
                          <Typography variant="overline" sx={{ color: alpha(item.accent, 0.86), lineHeight: 1.1 }}>
                            {item.badge}
                          </Typography>
                          <Typography sx={{ mt: 0.35, fontWeight: 800, color: "#102a43" }}>
                            {item.navLabel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45, lineHeight: 1.55 }}>
                            {item.title}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.2} sx={{ mb: 2 }}>
        {overviewStats.map((item) => (
          <Grid key={item.title} size={{ xs: 12, md: 4 }}>
            <Card
              className="surface-vibrant"
              sx={{
                height: "100%",
                borderRadius: 3.2,
                border: `1px solid ${alpha(item.accent, 0.16)}`,
                boxShadow: `0 22px 40px ${alpha(item.accent, 0.1)}`
              }}
            >
              <CardContent sx={{ p: 3, display: "flex", gap: 2, alignItems: "flex-start", flexDirection: "column" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(item.accent, 0.12),
                    color: item.accent,
                    border: `1px solid ${alpha(item.accent, 0.14)}`
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" sx={{ color: alpha(item.accent, 0.86), letterSpacing: 0.08 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.8, mb: 1, letterSpacing: "-0.02em" }}>
                    {item.value}
                  </Typography>
                  <Chip
                    label={item.helper}
                    size="small"
                    sx={{
                      mb: 1,
                      bgcolor: alpha(item.accent, 0.1),
                      color: item.accent,
                      fontWeight: 700
                    }}
                  />
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.caption}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        className="surface-glass hover-lift"
        sx={{
          mb: 2.2,
          borderRadius: 3.6,
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 20px 40px rgba(15,23,42,0.08)"
        }}
      >
        <CardContent sx={{ p: { xs: 2.2, md: 2.8 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack spacing={1.1}>
                <Typography variant="overline" color="text.secondary">
                  {workspaceUi.overviewCompareLabel}
                </Typography>
                <Typography variant="h5" className="section-title" sx={{ maxWidth: 680 }}>
                  {workspaceUi.overviewCompareTitle}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.75 }}>
                  {workspaceUi.overviewCompareBody}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack direction="row" spacing={0.85} flexWrap="wrap" useFlexGap justifyContent={{ lg: "flex-end" }}>
                {[
                  workspaceUi.overviewCompareRoleSearch,
                  workspaceUi.overviewCompareNavigation,
                  workspaceUi.overviewCompareOperations
                ].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    variant="outlined"
                    sx={{ borderColor: "rgba(148, 163, 184, 0.18)", color: "#334155" }}
                  />
                ))}
                <Chip
                  label={workspaceUi.overviewCompareShowcase}
                  color="secondary"
                  icon={<ArrowOutwardRoundedIcon />}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {workspaceEntries.map(({ workspace, visibleModules }, index) => {
          return (
            <Grid size={{ xs: 12, md: 6 }} key={workspace.slug}>
              <WorkspacePreviewCard
                workspace={workspace}
                visibleModules={visibleModules}
                workspaceUi={workspaceUi}
                index={index}
                variant="detailed"
              />
            </Grid>
          );
        })}
      </Grid>
    </PublicContentShell>
  );
}
