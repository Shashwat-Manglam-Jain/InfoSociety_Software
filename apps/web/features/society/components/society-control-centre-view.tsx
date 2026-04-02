"use client";

import Link from "next/link";
import { useMemo } from "react";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, Container, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import { alpha } from "@mui/material/styles";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { formatCurrency, selectSocietyModule, type SocietyControlCentreData } from "@/features/society/lib/society-control-centre";

type SocietyControlCentreViewProps = {
  data: SocietyControlCentreData;
  searchQuery: string;
  selectedModuleSlug?: string;
};

function buildModuleHref(moduleSlug: string, searchQuery: string) {
  const params = new URLSearchParams();

  params.set("module", moduleSlug);

  if (searchQuery.trim()) {
    params.set("q", searchQuery.trim());
  }

  return `/dashboard/society?${params.toString()}`;
}

export function SocietyControlCentreView({
  data,
  searchQuery,
  selectedModuleSlug
}: SocietyControlCentreViewProps) {
  const selectedModule = useMemo(
    () => selectSocietyModule(data.modules, selectedModuleSlug),
    [data.modules, selectedModuleSlug]
  );

  return (
    <>
      <Box
        sx={{
          py: { xs: 3, md: 4 },
          background: (theme) =>
            `radial-gradient(90% 120% at 0% 0%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 68%),
            radial-gradient(70% 80% at 100% 0%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 62%)`
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2.2} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 3.15 }}>
              <Stack spacing={2.1} sx={{ position: { lg: "sticky" }, top: { lg: 92 } }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(29, 78, 216, 0.14)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,252,0.98) 100%)",
                    boxShadow: "0 18px 36px rgba(29, 78, 216, 0.08)"
                  }}
                >
                  <CardContent sx={{ p: 2.2 }}>
                    <Stack spacing={1.6}>
                      <Chip label="Server Rendered" color="primary" variant="outlined" sx={{ width: "fit-content" }} />

                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main", fontWeight: 800 }}>
                          {data.ownerInitials}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                            {data.ownerName}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Society owner
                          </Typography>
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          p: 1.6,
                          borderRadius: 2.5,
                          bgcolor: "rgba(29, 78, 216, 0.05)",
                          border: "1px solid rgba(29, 78, 216, 0.12)"
                        }}
                      >
                        <Typography variant="overline" color="primary.main">
                          Society Workspace
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {data.societyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data.societyCode} · {data.subscriptionLabel}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        <Chip label={data.societyStatus} color="success" size="small" />
                        <Chip label={data.liveDataAvailable ? "Live data" : "Preview data"} size="small" variant="outlined" />
                        <Chip label={`${data.team.length} visible staff`} size="small" variant="outlined" />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 1.3 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: "block", mb: 0.6 }}>
                      All Modules
                    </Typography>
                    <Stack spacing={0.5}>
                      {data.modules.map((module) => {
                        const selected = module.slug === selectedModule.slug;

                        return (
                          <Button
                            key={module.slug}
                            component={Link}
                            href={buildModuleHref(module.slug, searchQuery)}
                            fullWidth
                            endIcon={<ChevronRightRoundedIcon />}
                            sx={{
                              justifyContent: "space-between",
                              px: 1.2,
                              py: 1.1,
                              borderRadius: 2,
                              textTransform: "none",
                              color: selected ? "primary.main" : "text.primary",
                              bgcolor: selected ? "rgba(29, 78, 216, 0.1)" : "transparent",
                              border: selected ? "1px solid rgba(29, 78, 216, 0.18)" : "1px solid transparent"
                            }}
                          >
                            <Stack alignItems="flex-start" sx={{ minWidth: 0 }}>
                              <Typography fontWeight={700} sx={{ textAlign: "left" }}>
                                {module.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "left" }}>
                                {module.summary}
                              </Typography>
                            </Stack>
                          </Button>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>

                <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 1.3 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: "block", mb: 0.8 }}>
                      Quick Actions
                    </Typography>
                    <Stack spacing={0.7}>
                      <Button component={Link} href="/dashboard/society/settings" variant="contained" fullWidth>
                        Institution Settings
                      </Button>
                      <Button component={Link} href="/dashboard/branches" variant="outlined" fullWidth>
                        Branch Management
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 8.85 }}>
              <Stack spacing={2.2}>
                <Card className="surface-vibrant" sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, xl: 8 }}>
                        <Stack spacing={1.25}>
                          <Chip label="Society Control Centre" color="secondary" variant="outlined" sx={{ width: "fit-content" }} />
                          <Typography variant="h4" className="section-title">
                            {data.societyName}
                          </Typography>
                          <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
                            Search members, move through every approved module from the left rail, and keep owner, institution, and operations data visible in one fast society workspace.
                          </Typography>
                          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                            <Chip label={`Owner: ${data.ownerName}`} />
                            <Chip label={`Code: ${data.societyCode}`} variant="outlined" />
                            <Chip label={data.digitalCollectionsEnabled ? "Digital collections enabled" : "Collections preview mode"} variant="outlined" />
                          </Stack>
                        </Stack>
                      </Grid>

                      <Grid size={{ xs: 12, xl: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: "rgba(255,255,255,0.76)",
                            border: "1px solid rgba(148, 163, 184, 0.16)"
                          }}
                        >
                          <Typography variant="overline" color="text.secondary">
                            Monitoring Note
                          </Typography>
                          <Typography sx={{ mt: 0.6, color: "text.secondary" }}>{data.monitoringCaption}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {data.previewReason ? <Alert severity="info">{data.previewReason}</Alert> : null}

                <Grid container spacing={1.5}>
                  {data.metrics.map((metric) => (
                    <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                      <Card className="surface-glass" sx={{ height: "100%", borderRadius: 3 }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {metric.label}
                          </Typography>
                          <Typography variant="h4" sx={{ mt: 0.5, mb: 0.6 }}>
                            {metric.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {metric.caption}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ md: "center" }}
                      spacing={1.5}
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography variant="h5" className="section-title">
                          Search Accounts And Members
                        </Typography>
                        <Typography color="text.secondary">
                          Search by member name, customer code, or preview account number. The page still explains the workflow clearly when live banking data is sparse.
                        </Typography>
                      </Box>
                      <Chip
                        label={data.accountResultsUseDemoData ? "Preview search results" : "Live search results"}
                        color={data.accountResultsUseDemoData ? "warning" : "success"}
                        variant="outlined"
                      />
                    </Stack>

                    <Box component="form" method="GET" action="/dashboard/society" sx={{ mb: 2.2 }}>
                      <input type="hidden" name="module" value={selectedModule.slug} />
                      <Grid container spacing={1.2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8.5 }}>
                          <TextField
                            name="q"
                            fullWidth
                            defaultValue={searchQuery}
                            placeholder="Search member, customer code, or account number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchRoundedIcon color="action" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3.5 }}>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button type="submit" fullWidth variant="contained" startIcon={<ManageSearchRoundedIcon />}>
                              Search
                            </Button>
                            <Button component={Link} href={buildModuleHref(selectedModule.slug, "")} fullWidth variant="outlined">
                              Clear
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>

                    <Grid container spacing={1.4}>
                      {data.accountResults.map((account) => (
                        <Grid key={account.id} size={{ xs: 12, md: 6, xl: 4 }}>
                          <Card
                            sx={{
                              height: "100%",
                              borderRadius: 2.8,
                              border: "1px solid rgba(148, 163, 184, 0.14)",
                              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,251,0.94) 100%)"
                            }}
                          >
                            <CardContent sx={{ p: 1.8 }}>
                              <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography fontWeight={700}>{account.fullName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {account.customerCode} · {account.accountNumber}
                                    </Typography>
                                  </Box>
                                  <Chip label={account.status} size="small" color={account.isDemo ? "warning" : "primary"} variant="outlined" />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {account.product} · {account.branch}
                                </Typography>
                                <Typography variant="h6">{formatCurrency(account.balance)}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {account.phone} · {account.note}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, xl: 7 }}>
                    <Card className="surface-glass" sx={{ height: "100%", borderRadius: 3 }}>
                      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "rgba(29, 78, 216, 0.1)",
                              color: "primary.main"
                            }}
                          >
                            <HubRoundedIcon />
                          </Box>
                          <Box>
                            <Typography variant="h5" className="section-title">
                              Module Spotlight
                            </Typography>
                            <Typography color="text.secondary">
                              The active left-rail module stays visible here before you move into the full workspace.
                            </Typography>
                          </Box>
                        </Stack>

                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid rgba(29, 78, 216, 0.14)",
                            background: "linear-gradient(180deg, rgba(29, 78, 216, 0.06) 0%, rgba(255,255,255,0.96) 100%)"
                          }}
                        >
                          <Typography variant="overline" color="primary.main">
                            Active module
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 0.4, mb: 0.9 }}>
                            {selectedModule.name}
                          </Typography>
                          <Typography color="text.secondary" sx={{ mb: 1.6 }}>
                            {selectedModule.summary}
                          </Typography>

                          <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mb: 1.6 }}>
                            {selectedModule.endpoints.slice(0, 3).map((endpoint) => (
                              <Chip key={endpoint} label={endpoint} size="small" variant="outlined" />
                            ))}
                          </Stack>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button
                              component={Link}
                              href={`/modules/${selectedModule.slug}`}
                              variant="contained"
                              endIcon={<ArrowOutwardRoundedIcon />}
                            >
                              Open module workspace
                            </Button>
                            <Button component={Link} href="/dashboard/society/settings" variant="outlined" startIcon={<SettingsSuggestRoundedIcon />}>
                              Open institution settings
                            </Button>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, xl: 5 }}>
                    <Stack spacing={2}>
                      <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
                          <Stack direction="row" spacing={1.1} alignItems="center" sx={{ mb: 1.2 }}>
                            <Avatar sx={{ bgcolor: "secondary.main", width: 42, height: 42 }}>
                              <ApartmentRoundedIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6">Society Owner Panel</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Keep the owner, institution code, and branch setup visible from the first screen.
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack spacing={1}>
                            <Typography variant="body2">
                              <strong>Owner:</strong> {data.ownerName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Society code:</strong> {data.societyCode}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Plan:</strong> {data.subscriptionLabel}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>

                      <Card className="surface-glass" sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
                          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.3 }}>
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.3,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "rgba(201, 119, 42, 0.14)",
                                color: "#b45309"
                              }}
                            >
                              <InsightsRoundedIcon />
                            </Box>
                            <Box>
                              <Typography variant="h6">Team Visibility</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Staff names stay visible even when the live directory is incomplete.
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack spacing={1}>
                            {data.team.map((member) => (
                              <Stack
                                key={member.id}
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                spacing={1}
                                sx={{
                                  p: 1.2,
                                  borderRadius: 2.2,
                                  border: "1px solid rgba(148, 163, 184, 0.16)"
                                }}
                              >
                                <Box>
                                  <Typography fontWeight={700}>{member.fullName}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.roleLabel} · {member.note}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={member.isActive ? "Active" : "Review"}
                                  size="small"
                                  color={member.isActive ? "success" : "warning"}
                                  variant={member.isActive ? "filled" : "outlined"}
                                />
                              </Stack>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <WorkspaceFooter />
    </>
  );
}
