"use client";

import Link from "next/link";
import { AppBar, Avatar, Box, Button, Card, CardContent, Chip, Stack, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { WorkspacePreviewCard } from "@/features/roles/components/workspace-preview-card";
import {
  getRestrictedWorkspaceModules,
  getWorkspaceDefinition,
  getWorkspaceModules,
  getWorkspaceUiCopy,
  type WorkspaceRoleSlug
} from "@/features/roles/workspace-definitions";
import { useLanguage } from "@/shared/i18n/language-provider";
import { useTheme } from "@mui/material/styles";

const workspaceAccents: Record<string, { accent: string }> = {
  client: { accent: "#0f766e" },
  agent: { accent: "#b45309" },
  "society-admin": { accent: "#1d4ed8" },
  "platform-admin": { accent: "#334155" }
} as const;

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
  const theme = useTheme();
  const workspace = getWorkspaceDefinition(role, locale);

  if (!workspace) {
    return null;
  }

  const workspaceUi = getWorkspaceUiCopy(locale);
  const visibleModules = getWorkspaceModules(workspace.slug, locale);
  const restrictedModules = getRestrictedWorkspaceModules(workspace.slug, locale);
  const workspaceAccent = workspaceAccents[workspace.slug]?.accent ?? "#1d4ed8";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Fixed AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.92)} 50%, ${alpha(theme.palette.secondary.main, 0.94)} 100%)`,
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08)",
          zIndex: 1200
        }}
      >
        <Toolbar sx={{ px: { xs: 1.6, md: 2.5 }, py: 1, minHeight: 72, justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: 0.04 }}>
            {workspace.title}
          </Typography>
          <Stack direction="row" spacing={1.2} sx={{ display: { xs: "none", md: "flex" } }}>
            <Button color="inherit" sx={{ textTransform: "capitalize", fontWeight: 600, fontSize: "0.95rem" }}>
              Documentation
            </Button>
            <Button color="inherit" sx={{ textTransform: "capitalize", fontWeight: 600, fontSize: "0.95rem" }}>
              API Reference
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Fixed Sidebar */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          top: 72,
          width: 300,
          height: "calc(100vh - 72px)",
          background: "linear-gradient(180deg, #ffffff 0%, rgba(248,250,252,0.95) 100%)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          p: 2.5,
          gap: 3,
          borderRight: "1px solid rgba(148, 163, 184, 0.14)",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha("rgba(148, 163, 184, 0.24)", 1)} transparent`,
          "&::-webkit-scrollbar": {
            width: "6px"
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent"
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(148, 163, 184, 0.24)",
            borderRadius: "3px",
            "&:hover": {
              background: "rgba(148, 163, 184, 0.36)"
            }
          },
          zIndex: 1100
        }}
      >
        {/* User Info Card */}
        <Card
          sx={{
            borderRadius: 2.4,
            border: `1px solid ${alpha(workspaceAccent, 0.14)}`,
            background: `linear-gradient(135deg, ${alpha(workspaceAccent, 0.06)} 0%, rgba(255,255,255,0.98) 100%)`
          }}
        >
          <CardContent sx={{ p: 1.8 }}>
            <Stack spacing={1.4} alignItems="center" textAlign="center">
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: workspaceAccent,
                  fontWeight: 800,
                  fontSize: "1rem",
                  border: `2px solid ${alpha(workspaceAccent, 0.16)}`
                }}
              >
                {workspace.title.charAt(0)}
              </Avatar>
              <Box>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#102a43" }}>
                  {workspace.title}
                </Typography>
                <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary", letterSpacing: 0.04 }}>
                  {workspace.navLabel}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Navigation Sections */}
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 800,
              color: "text.secondary",
              mb: 1.4,
              px: 0.8
            }}
          >
            Workspace
          </Typography>
          <Stack spacing={0.8}>
            <Button
              component={Link}
              href="#overview"
              sx={{
                justifyContent: "flex-start",
                p: "11px 14px",
                borderRadius: 1.2,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                textTransform: "capitalize",
                transition: "all 220ms ease",
                position: "relative",
                pl: 2.2,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  borderRadius: "0 2px 2px 0",
                  bgcolor: workspaceAccent,
                  opacity: 1,
                  transition: "all 220ms ease"
                },
                "&:hover": {
                  background: `${alpha(workspaceAccent, 0.08)}`
                }
              }}
            >
              Overview
            </Button>
            <Button
              component={Link}
              href="#modules"
              sx={{
                justifyContent: "flex-start",
                p: "11px 14px",
                borderRadius: 1.2,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                textTransform: "capitalize",
                transition: "all 220ms ease",
                position: "relative",
                pl: 2.2,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  borderRadius: "0 2px 2px 0",
                  bgcolor: "transparent",
                  opacity: 0,
                  transition: "all 220ms ease"
                },
                "&:hover": {
                  background: `${alpha(workspaceAccent, 0.08)}`
                }
              }}
            >
              Modules
              <Chip
                label={visibleModules.length}
                size="small"
                sx={{
                  ml: "auto",
                  bgcolor: alpha(workspaceAccent, 0.1),
                  color: workspaceAccent,
                  fontWeight: 700,
                  height: 20,
                  "& .MuiChip-label": { px: 0.8 }
                }}
              />
            </Button>
          </Stack>
        </Box>

        {/* Support Section */}
        <Box sx={{ mt: "auto" }}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 800,
              color: "text.secondary",
              mb: 1.4,
              px: 0.8
            }}
          >
            Support
          </Typography>
          <Stack spacing={0.8}>
            <Button
              component={Link}
              href="#contact"
              sx={{
                justifyContent: "flex-start",
                p: "11px 14px",
                borderRadius: 1.2,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                textTransform: "capitalize",
                transition: "all 220ms ease",
                position: "relative",
                pl: 2.2,
                "&:hover": {
                  background: `${alpha(workspaceAccent, 0.08)}`
                }
              }}
            >
              Contact
            </Button>
            <Button
              component={Link}
              href="#help"
              sx={{
                justifyContent: "flex-start",
                p: "11px 14px",
                borderRadius: 1.2,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                textTransform: "capitalize",
                transition: "all 220ms ease",
                position: "relative",
                pl: 2.2,
                "&:hover": {
                  background: `${alpha(workspaceAccent, 0.08)}`
                }
              }}
            >
              Help & FAQ
            </Button>
          </Stack>
        </Box>

        {/* Logout Button */}
        <Button
          component={Link}
          href="/login"
          sx={{
            width: "100%",
            p: "12px 14px",
            borderRadius: 1.6,
            background: `linear-gradient(135deg, ${workspaceAccent} 0%, ${alpha(workspaceAccent, 0.8)} 100%)`,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "capitalize",
            transition: "all 220ms ease",
            boxShadow: `0 8px 16px ${alpha(workspaceAccent, 0.24)}`,
            "&:hover": {
              boxShadow: `0 12px 24px ${alpha(workspaceAccent, 0.32)}`,
              transform: "translateY(-2px)"
            }
          }}
        >
          Back to Login
        </Button>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          height: "calc(100vh - 72px)",
          ml: { xs: 0, md: "300px" },
          transition: "margin-left 220ms ease"
        }}
      >
        {/* Background with gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: (theme) => `linear-gradient(180deg, ${alpha(workspaceAccent, 0.02)} 0%, ${alpha("#3182CE", 0.01)} 100%)`,
            zIndex: 0,
            pointerEvents: "none",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "800px",
              height: "800px",
              borderRadius: "50%",
              background: (theme) => `radial-gradient(circle, ${alpha(workspaceAccent, 0.08)} 0%, transparent 70%)`,
              zIndex: 0
            }
          }}
        />

        {/* Scrollable Content Container */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px"
            },
            "&::-webkit-scrollbar-track": {
              background: alpha(workspaceAccent, 0.02)
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(workspaceAccent, 0.2),
              borderRadius: "4px",
              "&:hover": {
                background: alpha(workspaceAccent, 0.3)
              }
            }
          }}
        >
          <PublicContentShell badge={workspace.badge} title={workspace.title} subtitle={workspace.subtitle}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <WorkspacePreviewCard
            workspace={workspace}
            visibleModules={visibleModules}
            workspaceUi={workspaceUi}
            index={0}
            variant="detailed"
          />
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Card
            className="surface-glass"
            sx={{
              height: "100%",
              borderRadius: 3.2,
              borderLeft: `4px solid ${workspaceAccent}`,
              boxShadow: `0 20px 40px ${alpha(workspaceAccent, 0.1)}`
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  <Chip label={workspaceUi.cardAuthorizedModules(visibleModules.length)} color="secondary" variant="outlined" />
                  <Chip label={workspaceUi.cardRestrictedCapabilities(restrictedModules.length)} variant="outlined" />
                  <Chip label={workspace.navLabel} variant="outlined" />
                </Stack>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {workspaceUi.provisioningRecommendationOverline}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.4 }}>
                    {workspaceUi.provisioningRecommendationTitle}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    {workspace.provisioningNote}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 2.8,
                    border: `1px solid ${alpha(workspaceAccent, 0.14)}`,
                    background: `linear-gradient(180deg, ${alpha(workspaceAccent, 0.06)} 0%, rgba(255,255,255,0.98) 100%)`
                  }}
                >
                  <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.88), letterSpacing: 0.08, fontWeight: 700 }}>
                    {workspaceUi.typicalResponsibilitiesTitle}
                  </Typography>
                  <DetailList items={workspace.dailyWork.slice(0, 3)} />
                </Box>

                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 2.8,
                    border: `1px solid ${alpha(workspaceAccent, 0.14)}`,
                    background: `linear-gradient(180deg, ${alpha(workspaceAccent, 0.06)} 0%, rgba(255,255,255,0.98) 100%)`
                  }}
                >
                  <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.88), letterSpacing: 0.08, fontWeight: 700 }}>
                    {workspaceUi.restrictedCapabilitiesTitle}
                  </Typography>
                  <DetailList items={workspace.hiddenFromRole.slice(0, 3)} tone="neutral" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            className="surface-glass"
            sx={{
              height: "100%",
              borderRadius: 3.2,
              border: `1px solid ${alpha(workspaceAccent, 0.12)}`
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.86), letterSpacing: 0.08, fontWeight: 700 }}>
                {workspaceUi.roleProfileOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.5, mt: 0.6, color: "#102a43" }}>
                {workspaceUi.roleProfileTitle}
              </Typography>
              <Stack spacing={1.2}>
                <Box>
                  <Typography variant="body2" sx={{ color: alpha(workspaceAccent, 0.88), fontWeight: 700, mb: 0.3 }}>
                    {workspaceUi.audienceLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workspace.audience}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: alpha(workspaceAccent, 0.88), fontWeight: 700, mb: 0.3 }}>
                    {workspaceUi.dataScopeLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workspace.dataScope}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: alpha(workspaceAccent, 0.88), fontWeight: 700, mb: 0.3 }}>
                    {workspaceUi.primaryResponsibilityLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workspace.primaryResponsibility}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 1.8 }}>
                <DetailList items={workspace.visibleHighlights} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            className="surface-glass"
            sx={{
              height: "100%",
              borderRadius: 3.2,
              border: `1px solid ${alpha(workspaceAccent, 0.12)}`
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.86), letterSpacing: 0.08, fontWeight: 700 }}>
                {workspaceUi.operatingAuthorityOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.5, mt: 0.6, color: "#102a43" }}>
                {workspaceUi.operatingAuthorityTitle}
              </Typography>
              <DetailList items={workspace.adminTools} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            className="surface-glass"
            sx={{
              height: "100%",
              borderRadius: 3.2,
              border: `1px solid ${alpha(workspaceAccent, 0.12)}`
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.86), letterSpacing: 0.08, fontWeight: 700 }}>
                {workspaceUi.modulePortfolioOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.8, mt: 0.6, color: "#102a43" }}>
                {workspaceUi.modulePortfolioTitle}
              </Typography>
              <Grid container spacing={1.5}>
                {visibleModules.map((module) => (
                  <Grid key={module.slug} size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 2.8,
                        border: `1px solid ${alpha(workspaceAccent, 0.16)}`,
                        background: `linear-gradient(180deg, ${alpha(workspaceAccent, 0.06)} 0%, rgba(255,255,255,0.98) 100%)`,
                        transition: "all 220ms ease",
                        "&:hover": {
                          border: `1px solid ${alpha(workspaceAccent, 0.24)}`,
                          boxShadow: `0 16px 32px ${alpha(workspaceAccent, 0.12)}`
                        }
                      }}
                    >
                      <Typography fontWeight={700} sx={{ color: "#102a43" }}>
                        {module.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6, mb: 1.2, lineHeight: 1.6 }}>
                        {module.summary}
                      </Typography>
                      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={workspaceUi.moduleApiCount(module.endpoints.length)}
                          sx={{
                            bgcolor: alpha(workspaceAccent, 0.1),
                            color: workspaceAccent,
                            fontWeight: 700
                          }}
                        />
                        <Chip
                          size="small"
                          label={module.endpoints[0]}
                          sx={{ borderColor: alpha(workspaceAccent, 0.18), color: workspaceAccent }}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            className="surface-glass"
            sx={{
              height: "100%",
              borderRadius: 3.2,
              border: `1px solid ${alpha(workspaceAccent, 0.12)}`
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.86), letterSpacing: 0.08, fontWeight: 700 }}>
                {workspaceUi.operatingModelOverline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1.8, mt: 0.6, color: "#102a43" }}>
                {workspaceUi.operatingModelTitle}
              </Typography>
              <DetailList items={workspace.dailyWork} />

              <Typography variant="overline" sx={{ mt: 2.2, mb: 1.2, color: alpha(workspaceAccent, 0.86), letterSpacing: 0.08, fontWeight: 700 }}>
                {workspaceUi.restrictedCapabilitiesTitle}
              </Typography>
              <DetailList items={workspace.hiddenFromRole} tone="neutral" />

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2, mb: 1 }}>
                {workspaceUi.restrictedModuleFamiliesLabel}
              </Typography>
              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                {restrictedModules.slice(0, 6).map((module) => (
                  <Chip
                    key={module.slug}
                    label={module.name}
                    size="small"
                    sx={{
                      borderColor: alpha(workspaceAccent, 0.18),
                      color: "text.secondary"
                    }}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        className="surface-vibrant fade-rise"
        sx={{
          borderRadius: 3.2,
          border: `1px solid ${alpha(workspaceAccent, 0.16)}`,
          background: `radial-gradient(140% 140% at 0% 0%, ${alpha(workspaceAccent, 0.18)} 0%, rgba(255,255,255,0) 40%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,252,0.98) 100%)`,
          boxShadow: `0 30px 80px rgba(15,23,42,0.06)`
        }}
      >
        <CardContent sx={{ p: { xs: 2.4, md: 3.2 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: alpha(workspaceAccent, 0.86), letterSpacing: 0.08, fontWeight: 700 }}>
                {workspaceUi.provisioningRecommendationOverline}
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.6, mb: 0.8, color: "#102a43" }}>
                {workspaceUi.provisioningRecommendationTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 480, lineHeight: 1.7 }}>
                {workspace.provisioningNote} {workspaceUi.provisioningRecommendationBodySuffix}
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
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
        </Box>
      </Box>
    </Box>
  );
}
