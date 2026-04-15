"use client";

import React, { useMemo } from "react";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SocietyOverviewRecord } from "@/shared/api/administration";
import type { LoanRecord } from "@/shared/api/loans";
import type { Branch } from "@/shared/types";
import {
  buildBranchCollectionRows,
  buildLoanApplicationSummaryRows,
  countOpenLoanApplications,
  getMonthlyNetEarnings
} from "@/features/society/lib/dashboard-overview";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { StatusChip, type StatusTone } from "@/features/society/components/operations/shared/StatusChip";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

type DashboardOverviewProps = {
  societyForm: {
    name?: string;
  };
  branches: Branch[];
  overview: SocietyOverviewRecord;
  branchOverviews: Record<string, SocietyOverviewRecord>;
  loans: LoanRecord[];
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
};

type MetricDefinition = {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  color: string;
};

function getLoanStatusTone(status: LoanRecord["status"]): StatusTone {
  switch (status) {
    case "APPLIED":
      return "warning";
    case "SANCTIONED":
      return "info";
    case "DISBURSED":
      return "success";
    case "OVERDUE":
      return "error";
    default:
      return "default";
  }
}

export function DashboardOverview({
  societyForm,
  branches,
  overview,
  branchOverviews,
  loans,
  formatCurrency,
  formatDate
}: DashboardOverviewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const branchRows = useMemo(
    () => buildBranchCollectionRows(branches, branchOverviews),
    [branches, branchOverviews]
  );
  const loanRows = useMemo(
    () => buildLoanApplicationSummaryRows(loans).filter((loan) => loan.status !== "CLOSED").slice(0, 8),
    [loans]
  );
  const monthlyNetEarnings = getMonthlyNetEarnings(overview);
  const openLoanApplications = countOpenLoanApplications(loans);

  const metrics: MetricDefinition[] = [
    {
      label: "Today collection",
      value: formatCurrency(overview.collectionApproved.daily),
      caption: "Approved collection posted today",
      icon: <TodayRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.blue
    },
    {
      label: "Weekly collection",
      value: formatCurrency(overview.collectionApproved.weekly),
      caption: "Approved collection in the last 7 days",
      icon: <CurrencyRupeeRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.sky
    },
    {
      label: "Monthly collection",
      value: formatCurrency(overview.collectionApproved.monthly),
      caption: "Approved collection in the current month",
      icon: <PaidRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.emerald
    },
    {
      label: "Bank balance",
      value: formatCurrency(overview.bankBalance),
      caption: "Amount currently available in bank accounts",
      icon: <AccountBalanceRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.amber
    },
    {
      label: "Loan amount given",
      value: formatCurrency(overview.totalDistributed),
      caption: "Total amount disbursed as loans",
      icon: <GavelRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.violet
    },
    {
      label: "Total amount in society",
      value: formatCurrency(overview.totalCapital),
      caption: "Current value across non-loan society accounts",
      icon: <InventoryRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.blue
    },
    {
      label: "Monthly net earnings",
      value: formatCurrency(monthlyNetEarnings),
      caption: "This month collections minus loan disbursals",
      icon: <AccountBalanceWalletRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.emerald
    },
    {
      label: "Open loan applications",
      value: String(openLoanApplications),
      caption: "Applied or sanctioned requests still in progress",
      icon: <PendingActionsRoundedIcon />,
      color: DESIGN_SYSTEM.COLORS.amber
    }
  ];

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 1,
          border: `1px solid ${surfaces.border}`,
          bgcolor: surfaces.paper
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "text.primary" }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 760 }}>
            {societyForm?.name || "Society"} snapshot focused on branch collections, loan demand, bank position, and monthly earnings.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 1,
                border: `1px solid ${surfaces.border}`,
                bgcolor: surfaces.paper
              }}
            >
              <CardContent sx={{ height: "100%" }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(metric.color, isDark ? 0.2 : 0.12),
                        color: metric.color,
                        width: 44,
                        height: 44
                      }}
                    >
                      {metric.icon}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary" }}>
                      {metric.label}
                    </Typography>
                  </Stack>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary", mb: 0.75 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {metric.caption}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              border: `1px solid ${surfaces.border}`,
              bgcolor: surfaces.paper,
              overflow: "hidden"
            }}
          >
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${surfaces.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: "text.primary" }}>
                Branch collection history
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Daily, weekly, and monthly collection for each visible branch.
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Today</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Last 7 days</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>This month</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branchRows.length === 0 ? (
                    <TableEmpty colSpan={4} label="No branch collections are available yet." />
                  ) : (
                    branchRows.map((branch) => (
                      <TableRow key={branch.id} hover>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                              {branch.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {branch.code}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(branch.todayCollection)}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(branch.weeklyCollection)}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(branch.monthlyCollection)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              border: `1px solid ${surfaces.border}`,
              bgcolor: surfaces.paper,
              overflow: "hidden"
            }}
          >
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${surfaces.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: "text.primary" }}>
                Loan applications
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Latest member loan requests with amount and processing status.
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Applicant</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Applied on</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loanRows.length === 0 ? (
                    <TableEmpty colSpan={4} label="No loan applications are available for this view." />
                  ) : (
                    loanRows.map((loan) => (
                      <TableRow key={loan.id} hover>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                              {loan.applicantName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {loan.customerCode} · {loan.branchName}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(loan.applicationAmount)}</TableCell>
                        <TableCell>
                          <StatusChip label={loan.status} tone={getLoanStatusTone(loan.status)} />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>{formatDate(loan.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
