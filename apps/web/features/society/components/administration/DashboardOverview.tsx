"use client";

import React from "react";
import { 
  Box, 
  Paper, 
  Stack, 
  Typography, 
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
  IconButton,
  Button,
  Grid
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

// A simple mock chart to avoid heavy dependencies
function MockBarChart({ isDark }: { isDark: boolean }) {
  const bars = [40, 65, 45, 80, 55, 90, 75];
  const max = 100;
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 2, pt: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#cbd5e1'}` }}>
      {bars.map((val, i) => (
        <Box key={i} sx={{ 
            flex: 1, 
            height: `${(val / max) * 100}%`, 
            bgcolor: DESIGN_SYSTEM.COLORS.blue,
            borderRadius: '4px 4px 0 0',
            transition: 'height 1s ease',
            opacity: 0.85,
            '&:hover': { opacity: 1 }
        }} />
      ))}
    </Box>
  );
}

export function DashboardOverview({ societyForm, transactions, agents, managedUsers }: any) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  // Mocked/calculated values
  const todayCollection = 12500;
  const weeklyCollection = 85400;
  const monthlyCollection = 320000;
  const pendingCheques = 45000;
  const clearedCheques = 280000;

  return (
    <Stack spacing={4}>
      {/* Profile/Header Section */}
      <Paper elevation={0} sx={{ 
        p: 4, 
        borderRadius: 2.5, 
        bgcolor: isDark ? alpha(DESIGN_SYSTEM.COLORS.blue, 0.1) : alpha(DESIGN_SYSTEM.COLORS.blue, 0.05),
        border: `1px solid ${alpha(DESIGN_SYSTEM.COLORS.blue, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}>
        <Avatar src={societyForm?.logoUrl} sx={{ width: 80, height: 80, border: `2px solid ${DESIGN_SYSTEM.COLORS.blue}` }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.5 }}>
            Welcome back, {societyForm?.name || "Society Manager"}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Here is your financial and operational overview for today.
          </Typography>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.emerald, 0.1), color: DESIGN_SYSTEM.COLORS.emerald }}>
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Today's Collection</Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{todayCollection.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.sky, 0.1), color: DESIGN_SYSTEM.COLORS.sky }}>
                  <AccountBalanceWalletRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Weekly Collection</Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{weeklyCollection.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.amber, 0.1), color: DESIGN_SYSTEM.COLORS.amber }}>
                  <PendingActionsRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Pending in Bank</Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{pendingCheques.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.emerald, 0.1), color: DESIGN_SYSTEM.COLORS.emerald }}>
                  <AssignmentTurnedInRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Cleared Cheques</Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{clearedCheques.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graph Area */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2.5, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>People & Account Growth</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>Weekly overview of new user registrations</Typography>
            <MockBarChart isDark={isDark} />
            <Stack direction="row" spacing={4} sx={{ mt: 2 }} justifyContent="space-between">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Typography key={day} variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{day}</Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2.5, border: `1px solid ${surfaces.border}`, bgcolor: surfaces.paper, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: alpha(DESIGN_SYSTEM.COLORS.violet, 0.1), color: DESIGN_SYSTEM.COLORS.violet }}>
                <PeopleAltRoundedIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Network Stats</Typography>
            </Stack>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Total Active Agents</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: DESIGN_SYSTEM.COLORS.blue }}>{agents?.length || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Total Managed Users</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: DESIGN_SYSTEM.COLORS.sky }}>{managedUsers?.length || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Monthly Collection</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: DESIGN_SYSTEM.COLORS.emerald }}>₹{monthlyCollection.toLocaleString()}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
