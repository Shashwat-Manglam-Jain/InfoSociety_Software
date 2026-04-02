"use client";

import Link from "next/link";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PermIdentityRoundedIcon from "@mui/icons-material/PermIdentityRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import type { WorkspaceDefinition, WorkspaceRoleSlug, WorkspaceUiCopy } from "@/features/roles/workspace-definitions";

type WorkspacePreviewCardProps = {
  workspace: WorkspaceDefinition;
  visibleModules: Array<{ slug: string; name: string }>;
  workspaceUi: WorkspaceUiCopy;
  index: number;
  variant?: "home" | "detailed";
};

type PreviewConfig = {
  accent: string;
  icon: typeof PermIdentityRoundedIcon;
  contextValue: string;
  userValue: string;
  searchPlaceholder: string;
  metricValues: string[];
  metricTones: string[];
  activeModuleIndex: number;
};

const workspaceVisuals: Record<WorkspaceRoleSlug, PreviewConfig> = {
  client: {
    accent: "#0f766e",
    icon: PermIdentityRoundedIcon,
    contextValue: "Main Branch",
    userValue: "Amit Sharma (Member)",
    searchPlaceholder: "Search account, deposit, loan, or statement...",
    metricValues: ["₹4.2L", "02", "01", "24"],
    metricTones: ["#14b8a6", "#0ea5e9", "#f59e0b", "#ec4899"],
    activeModuleIndex: 0
  },
  agent: {
    accent: "#b45309",
    icon: SupportAgentRoundedIcon,
    contextValue: "City Sub-Branch",
    userValue: "Priya Singh (Field Agent)",
    searchPlaceholder: "Search customer, account, voucher, or branch task...",
    metricValues: ["48", "₹12.4k", "12", "06"],
    metricTones: ["#14b8a6", "#f59e0b", "#0ea5e9", "#ec4899"],
    activeModuleIndex: 1
  },
  "society-admin": {
    accent: "#1d4ed8",
    icon: ApartmentRoundedIcon,
    contextValue: "Headquarters",
    userValue: "Sanjay Mehta (Admin)",
    searchPlaceholder: "Search member, branch, approval, or institution record...",
    metricValues: ["05", "2,480", "₹1.8Cr", "07"],
    metricTones: ["#14b8a6", "#0ea5e9", "#f97316", "#ec4899"],
    activeModuleIndex: 2
  },
  "platform-admin": {
    accent: "#334155",
    icon: ShieldOutlinedIcon,
    contextValue: "Governance Hub",
    userValue: "Super Admin Terminal",
    searchPlaceholder: "Search society, admin, monitoring event, or report...",
    metricValues: ["128", "09", "₹74.2k", "03"],
    metricTones: ["#0ea5e9", "#f59e0b", "#14b8a6", "#ef4444"],
    activeModuleIndex: 1
  }
};

const railIcons = [
  GridViewRoundedIcon,
  GroupsRoundedIcon,
  SavingsRoundedIcon,
  ReceiptLongRoundedIcon,
  AssessmentRoundedIcon,
  SettingsRoundedIcon
] as const;

function getMetricLabels(
  visibleModules: Array<{ slug: string; name: string }>,
  workspaceUi: WorkspaceUiCopy
) {
  const fallbackLabels = [
    workspaceUi.cardKeyModulesLabel,
    workspaceUi.cardScopeLabel,
    workspaceUi.primaryResponsibilityLabel,
    workspaceUi.cardAudienceLabel
  ];

  return Array.from({ length: 4 }, (_, index) => visibleModules[index]?.name ?? fallbackLabels[index]);
}

function buildMetricCards(
  config: PreviewConfig,
  visibleModules: Array<{ slug: string; name: string }>,
  workspaceUi: WorkspaceUiCopy
) {
  const labels = getMetricLabels(visibleModules, workspaceUi);

  return labels.map((label, index) => ({
    label,
    value: config.metricValues[index] ?? String(index + 1).padStart(2, "0"),
    tone: config.metricTones[index] ?? config.accent
  }));
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Box
      sx={{
        p: 1.4,
        borderRadius: 2.8,
        color: "#fff",
        background: `linear-gradient(135deg, ${tone} 0%, ${alpha(tone, 0.86)} 100%)`,
        boxShadow: `0 16px 34px ${alpha(tone, 0.26)}`
      }}
    >
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.82)" }} noWrap>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.6, fontWeight: 800, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

function DetailPanel({
  accent,
  label,
  value
}: {
  accent: string;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        p: 1.4,
        borderRadius: 2.6,
        border: `1px solid ${alpha(accent, 0.12)}`,
        background: `linear-gradient(180deg, ${alpha(accent, 0.06)} 0%, rgba(255,255,255,0.98) 100%)`
      }}
    >
      <Typography
        variant="overline"
        sx={{
          display: "block",
          color: alpha(accent, 0.88),
          lineHeight: 1.2,
          mb: 0.65
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function WorkspacePreviewCard({
  workspace,
  visibleModules,
  workspaceUi,
  index,
  variant = "home"
}: WorkspacePreviewCardProps) {
  const config = workspaceVisuals[workspace.slug];
  const Icon = config.icon;
  const isHome = variant === "home";
  
  // For home, we show fewer modules and metrics to keep it compact
  const railModules = isHome ? [] : visibleModules.slice(0, variant === "detailed" ? 6 : 5);
  const spotlightModules = isHome ? visibleModules.slice(0, 2) : visibleModules.slice(0, variant === "detailed" ? 4 : 3);
  const metricCards = buildMetricCards(config, visibleModules, workspaceUi).slice(0, isHome ? 2 : 4);
  
  const moduleCountLabel =
    variant === "detailed" ? workspaceUi.cardAuthorizedModules(visibleModules.length) : workspaceUi.cardModules(visibleModules.length);

  return (
    <Card
      className="hover-lift"
      sx={{
        height: "100%",
        overflow: "hidden",
        position: "relative",
        borderRadius: isHome ? 3.5 : 4,
        border: `1px solid ${alpha(config.accent, 0.16)}`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,254,0.98) 100%)",
        boxShadow: `0 18px 38px ${alpha(config.accent, 0.08)}`,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(120% 90% at 100% 0%, ${alpha(config.accent, 0.14)} 0%, rgba(255,255,255,0) 54%)`
        }
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: isHome ? 2.5 : { xs: 2, md: 2.4 }
        }}
      >
        <Stack spacing={isHome ? 2 : 1.6} sx={{ flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1.25} alignItems="center">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={workspace.badge}
                size="small"
                sx={{
                  bgcolor: alpha(config.accent, 0.12),
                  color: config.accent,
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  px: 0.5
                }}
              />
              {!isHome && (
                <Chip
                  label={moduleCountLabel}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: alpha(config.accent, 0.18),
                    color: alpha(config.accent, 0.94),
                    fontSize: "0.7rem"
                  }}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              sx={{
                color: alpha(config.accent, 0.6),
                fontWeight: 800,
                letterSpacing: "0.22em"
              }}
            >
              0{index + 1}
            </Typography>
          </Stack>

          <Box
            sx={{
              p: isHome ? 0 : 1,
              borderRadius: 3.2,
              border: isHome ? "none" : `1px solid ${alpha(config.accent, 0.12)}`,
              background: isHome ? "transparent" : `linear-gradient(180deg, ${alpha(config.accent, 0.05)} 0%, rgba(255,255,255,0.98) 100%)`
            }}
          >
            <Stack direction={variant === "detailed" ? { xs: "column", lg: "row" } : "column"} spacing={isHome ? 2.5 : 1.2}>
              <Box
                sx={{
                  width: variant === "detailed" ? { xs: "100%", lg: 194 } : "100%",
                  flexShrink: 0
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: isHome ? `1px solid ${alpha(config.accent, 0.1)}` : "1px solid rgba(148, 163, 184, 0.16)",
                    background: "rgba(255,255,255,0.94)"
                  }}
                >
                  <Stack spacing={1.15}>
                    <Stack direction={isHome ? "row" : "column"} spacing={1.1} alignItems={isHome ? "center" : "flex-start"}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.4,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: config.accent,
                          color: "#fff",
                          boxShadow: `0 10px 22px ${alpha(config.accent, 0.2)}`
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            color: alpha(config.accent, 0.86),
                            lineHeight: 1.1,
                            fontSize: "0.65rem",
                            fontWeight: 800
                          }}
                        >
                          {workspace.badge}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: isHome ? "1.1rem" : "1rem" }} noWrap>
                          {workspace.navLabel}
                        </Typography>
                      </Box>
                    </Stack>

                    {!isHome && (
                      <Box
                        sx={{
                          p: 1.15,
                          borderRadius: 2.4,
                          background: alpha(config.accent, 0.06),
                          border: `1px solid ${alpha(config.accent, 0.12)}`
                        }}
                      >
                        <Typography variant="overline" sx={{ color: alpha(config.accent, 0.88), lineHeight: 1.1 }}>
                          Workspace Context
                        </Typography>
                        <Typography sx={{ fontWeight: 800, mt: 0.4 }}>{config.contextValue}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workspace.primaryResponsibility}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {!isHome && (
                  <Stack spacing={0.7} sx={{ mt: 1 }}>
                    {railModules.map((module, moduleIndex) => {
                      const RailIcon = railIcons[moduleIndex % railIcons.length];
                      const isActive = moduleIndex === Math.min(config.activeModuleIndex, railModules.length - 1);

                      return (
                        <Box
                          key={module.slug}
                          sx={{
                            p: 1,
                            borderRadius: 2.2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            border: isActive ? `1px solid ${alpha(config.accent, 0.22)}` : "1px solid rgba(148, 163, 184, 0.12)",
                            background: isActive
                              ? `linear-gradient(135deg, ${config.accent} 0%, ${alpha(config.accent, 0.92)} 100%)`
                              : "rgba(255,255,255,0.84)",
                            color: isActive ? "#fff" : "text.primary"
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1.8,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: isActive ? "rgba(255,255,255,0.18)" : alpha(config.accent, 0.08),
                              color: isActive ? "#fff" : config.accent,
                              flexShrink: 0
                            }}
                          >
                            <RailIcon sx={{ fontSize: 17 }} />
                          </Box>

                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {module.name}
                            </Typography>
                            {variant === "detailed" ? (
                              <Typography variant="caption" sx={{ color: isActive ? "rgba(255,255,255,0.78)" : "text.secondary" }} noWrap>
                                {isActive ? "Active module" : "Available module"}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack spacing={isHome ? 2 : 1.15}>
                  {!isHome && (
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                      <Box
                        sx={{
                          minWidth: 0,
                          flexGrow: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.4,
                          py: 1.15,
                          borderRadius: 2.6,
                          border: "1px solid rgba(148, 163, 184, 0.14)",
                          bgcolor: "rgba(255,255,255,0.9)"
                        }}
                      >
                        <SearchRoundedIcon sx={{ color: alpha(config.accent, 0.78) }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {config.searchPlaceholder}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Box
                          sx={{
                            px: 1.25,
                            py: 1,
                            borderRadius: 2.5,
                            border: "1px solid rgba(148, 163, 184, 0.14)",
                            bgcolor: "rgba(255,255,255,0.9)",
                            minWidth: variant === "detailed" ? 128 : 0
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                            Active Desk
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {config.contextValue}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            border: "1px solid rgba(148, 163, 184, 0.14)",
                            bgcolor: "rgba(255,255,255,0.9)",
                            display: "grid",
                            placeItems: "center",
                            color: alpha(config.accent, 0.82)
                          }}
                        >
                          <NotificationsNoneRoundedIcon fontSize="small" />
                        </Box>

                        {variant === "detailed" ? (
                          <Box
                            sx={{
                              px: 1.25,
                              py: 1,
                              borderRadius: 2.5,
                              border: "1px solid rgba(148, 163, 184, 0.14)",
                              bgcolor: "rgba(255,255,255,0.9)",
                              minWidth: 150
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                              Signed in as
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {config.userValue}
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2.5,
                              border: "1px solid rgba(148, 163, 184, 0.14)",
                              bgcolor: "rgba(255,255,255,0.9)",
                              display: "grid",
                              placeItems: "center",
                              color: alpha(config.accent, 0.82)
                            }}
                          >
                            <LogoutRoundedIcon fontSize="small" />
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  )}

                  <Box
                    sx={{
                      p: isHome ? 2 : { xs: 1.55, md: 1.85 },
                      borderRadius: 3,
                      border: isHome ? `1px solid ${alpha(config.accent, 0.08)}` : `1px solid ${alpha(config.accent, 0.12)}`,
                      background: isHome ? alpha(config.accent, 0.04) : `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, ${alpha(config.accent, 0.06)} 100%)`
                    }}
                  >
                    {!isHome && (
                      <Typography
                        variant="overline"
                        sx={{
                          display: "block",
                          color: alpha(config.accent, 0.88),
                          letterSpacing: "0.24em",
                          lineHeight: 1.2
                        }}
                      >
                        {workspace.badge}
                      </Typography>
                    )}
                    <Typography 
                      variant={isHome ? "h5" : (variant === "detailed" ? "h4" : "h5")} 
                      sx={{ mt: 0.4, fontWeight: 900, lineHeight: 1.1, color: isHome ? "#0f172a" : "inherit" }}
                    >
                      {workspace.title}
                    </Typography>
                    {!isHome && (
                      <Typography color="text.secondary" sx={{ mt: 0.85, maxWidth: 640, lineHeight: 1.65 }}>
                        {workspace.subtitle}
                      </Typography>
                    )}
                    {isHome && (
                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                          High-fidelity operational surface for {workspace.audience.toLowerCase()} including {spotlightModules.map(m => m.name).join(", ")}.
                       </Typography>
                    )}
                    {!isHome && (
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                        <Chip
                          label={workspace.primaryResponsibility}
                          size="small"
                          sx={{
                            bgcolor: alpha(config.accent, 0.12),
                            color: config.accent,
                            fontWeight: 700
                          }}
                        />
                        <Chip label={moduleCountLabel} size="small" variant="outlined" />
                      </Stack>
                    )}
                  </Box>

                  <Grid container spacing={isHome ? 1.5 : 1}>
                    {metricCards.map((metric) => (
                      <Grid key={`${workspace.slug}-${metric.label}`} size={{ xs: 6, xl: variant === "detailed" ? 3 : 6 }}>
                        <MetricCard label={metric.label} value={metric.value} tone={metric.tone} />
                      </Grid>
                    ))}
                  </Grid>

                  {!isHome && (
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, md: variant === "detailed" ? 7 : 12 }}>
                        <Box
                          sx={{
                            p: 1.4,
                            height: "100%",
                            borderRadius: 2.8,
                            border: "1px solid rgba(148, 163, 184, 0.14)",
                            bgcolor: "rgba(255,255,255,0.9)"
                          }}
                        >
                          <Typography
                            variant="overline"
                            sx={{
                              display: "block",
                              color: alpha(config.accent, 0.88),
                              lineHeight: 1.1,
                              mb: 0.8
                            }}
                          >
                            {workspaceUi.cardKeyModulesLabel}
                          </Typography>
                          <Stack spacing={0.75}>
                            {spotlightModules.map((module, moduleIndex) => (
                              <Box
                                key={module.slug}
                                sx={{
                                  px: 1,
                                  py: 0.9,
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.8,
                                  bgcolor: moduleIndex === 0 ? alpha(config.accent, 0.08) : "rgba(248,250,252,0.9)"
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: "999px",
                                    bgcolor: moduleIndex === 0 ? config.accent : alpha(config.accent, 0.34),
                                    flexShrink: 0
                                  }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: moduleIndex === 0 ? 800 : 700 }} noWrap>
                                  {module.name}
                                </Typography>
                                <ChevronRightRoundedIcon sx={{ ml: "auto", color: alpha(config.accent, 0.64), fontSize: 18 }} />
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, md: variant === "detailed" ? 5 : 12 }}>
                        <Stack spacing={1} sx={{ height: "100%" }}>
                          <DetailPanel accent={config.accent} label={workspaceUi.cardScopeLabel} value={workspace.dataScope} />
                          <DetailPanel accent={config.accent} label={workspaceUi.cardAudienceLabel} value={workspace.audience} />
                          {variant === "detailed" ? (
                            <DetailPanel
                              accent={config.accent}
                              label={workspaceUi.cardProvisioningLabel}
                              value={workspace.provisioningNote}
                            />
                          ) : null}
                        </Stack>
                      </Grid>
                    </Grid>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={1.2} sx={{ mt: isHome ? 1.5 : 2 }}>
          <Button
            component={Link}
            href={workspace.primaryAction.href}
            variant="contained"
            fullWidth
            sx={{
              height: isHome ? 50 : "auto",
              bgcolor: config.accent,
              fontWeight: 800,
              borderRadius: isHome ? 2.8 : 3,
              boxShadow: isHome ? `0 10px 20px -5px ${alpha(config.accent, 0.3)}` : "none",
              "&:hover": {
                bgcolor: config.accent,
                boxShadow: isHome ? `0 12px 24px -5px ${alpha(config.accent, 0.4)}` : "none"
              }
            }}
          >
            {isHome ? `Access ${workspace.navLabel}` : workspaceUi.reviewRoleButton}
          </Button>

          {!isHome && (
            <Button
              component={Link}
              href={workspace.primaryAction.href}
              variant="text"
              endIcon={<ArrowOutwardRoundedIcon />}
              fullWidth
              sx={{
                color: config.accent,
                justifyContent: "space-between",
                px: 0.4,
                "&:hover": {
                  bgcolor: alpha(config.accent, 0.06)
                }
              }}
            >
              {workspace.primaryAction.label}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
