"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSocietyDashboardOverviewCopy } from "@/shared/i18n/society-dashboard-overview-copy";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

function MockBarChart({ isDark }: { isDark: boolean }) {
  const bars = [40, 65, 45, 80, 55, 90, 75];
  const max = 100;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        height: 200,
        gap: 2,
        pt: 2,
        borderBottom: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`
      }}
    >
      {bars.map((value, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            height: `${(value / max) * 100}%`,
            bgcolor: DESIGN_SYSTEM.COLORS.blue,
            borderRadius: "4px 4px 0 0",
            transition: "height 1s ease",
            opacity: 0.85,
            "&:hover": { opacity: 1 }
          }}
        />
      ))}
    </Box>
  );
}

function interpolate(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, String(value));
  }, template);
}

function formatCurrency(value: number, localeTag: string) {
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function DashboardOverview({ societyForm, transactions, agents, managedUsers }: any) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getSocietyDashboardOverviewCopy(locale);
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  void transactions;

  const todayCollection = 12500;
  const weeklyCollection = 85400;
  const monthlyCollection = 320000;
  const pendingCheques = 45000;
  const clearedCheques = 280000;

  return (
    <Stack spacing={4}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 1,
          bgcolor: isDark ? alpha(DESIGN_SYSTEM.COLORS.blue, 0.1) : alpha(DESIGN_SYSTEM.COLORS.blue, 0.05),
          border: `1px solid ${alpha(DESIGN_SYSTEM.COLORS.blue, 0.2)}`,
          display: "flex",
          alignItems: "center",
          gap: 3
        }}
      >
        <Avatar
          src={societyForm?.logoUrl}
          sx={{ width: 80, height: 80, border: `2px solid ${DESIGN_SYSTEM.COLORS.blue}` }}
        />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary", mb: 0.5 }}>
            {interpolate(copy.welcomeTitle, {
              name: societyForm?.name || copy.fallbackSocietyName
            })}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {copy.welcomeSubtitle}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.emerald, 0.1), color: DESIGN_SYSTEM.COLORS.emerald }}>
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
                  {copy.stats.today}
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {formatCurrency(todayCollection, copy.localeTag)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.sky, 0.1), color: DESIGN_SYSTEM.COLORS.sky }}>
                  <AccountBalanceWalletRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
                  {copy.stats.weekly}
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {formatCurrency(weeklyCollection, copy.localeTag)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.amber, 0.1), color: DESIGN_SYSTEM.COLORS.amber }}>
                  <PendingActionsRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
                  {copy.stats.pending}
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {formatCurrency(pendingCheques, copy.localeTag)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.emerald, 0.1), color: DESIGN_SYSTEM.COLORS.emerald }}>
                  <AssignmentTurnedInRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
                  {copy.stats.cleared}
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {formatCurrency(clearedCheques, copy.localeTag)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 1, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper, height: "100%" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              {copy.growthTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
              {copy.growthSubtitle}
            </Typography>
            <MockBarChart isDark={isDark} />
            <Stack direction="row" spacing={4} sx={{ mt: 2 }} justifyContent="space-between">
              {copy.weekDays.map((day) => (
                <Typography key={day} variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  {day}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 1, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper, height: "100%" }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.violet, 0.1), color: DESIGN_SYSTEM.COLORS.violet }}>
                <PeopleAltRoundedIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {copy.networkPulseTitle}
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase" }}>
                  {copy.networkPulseStats.agents}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: DESIGN_SYSTEM.COLORS.blue }}>
                  {agents?.length || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase" }}>
                  {copy.networkPulseStats.users}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: DESIGN_SYSTEM.COLORS.sky }}>
                  {managedUsers?.length || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase" }}>
                  {copy.networkPulseStats.monthlyCollection}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: DESIGN_SYSTEM.COLORS.emerald }}>
                  {formatCurrency(monthlyCollection, copy.localeTag)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
