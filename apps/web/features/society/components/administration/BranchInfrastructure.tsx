"use client";

import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getBranchInfrastructureCopy } from "@/shared/i18n/branch-infrastructure-copy";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { Branch } from "@/shared/types";

export type BranchInfrastructureProps = {
  branches: Branch[];
  handleOpenDrawer: (type: "branch", branch?: Branch) => void;
  handleDeleteBranch: (id: string) => void;
};

export function BranchInfrastructure({ branches, handleOpenDrawer, handleDeleteBranch }: BranchInfrastructureProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getBranchInfrastructureCopy(locale);
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;
  const tableHover = isDark ? alpha("#ffffff", 0.04) : alpha(theme.palette.primary.main, 0.02);
  const tableDivider = isDark ? alpha("#e2e8f0", 0.08) : alpha("#0f172a", 0.06);
  const iconTileBg = isDark ? "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(14,116,144,0.12))" : alpha(theme.palette.primary.main, 0.08);
  const iconTileBorder = isDark ? alpha("#34d399", 0.22) : alpha(theme.palette.primary.main, 0.1);
  const neutralText = isDark ? "rgba(226,232,240,0.72)" : "text.secondary";

  const metrics = [
    {
      label: copy.metrics.branches.label,
      value: String(branches.length),
      caption: copy.metrics.branches.caption
    },
    {
      label: copy.metrics.active.label,
      value: String(branches.filter((branch) => branch.isActive).length),
      caption: copy.metrics.active.caption
    },
    {
      label: copy.metrics.headOffices.label,
      value: String(branches.filter((branch) => branch.isHead).length),
      caption: copy.metrics.headOffices.caption
    },
    {
      label: copy.metrics.digitalServices.label,
      value: String(branches.filter((branch) => branch.neftImpsService).length),
      caption: copy.metrics.digitalServices.caption
    }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<PlaceRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="emerald"
        actions={
          <Button
            variant="contained"
            startIcon={<AddLocationAltRoundedIcon />}
            onClick={() => handleOpenDrawer("branch")}
            sx={{
              bgcolor: isDark ? "rgba(15,23,42,0.72)" : "#fff",
              color: isDark ? "#ecfeff" : "#0f172a",
              borderRadius: 1.5,
              fontWeight: 800,
              border: isDark ? "1px solid rgba(148,163,184,0.18)" : "1px solid rgba(15,23,42,0.05)",
              backdropFilter: isDark ? "blur(12px)" : "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: isDark ? "rgba(15,23,42,0.9)" : "#f8fafc"
              }
            }}
          >
            {copy.hero.addBranch}
          </Button>
        }
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }
        }}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 1,
          border: `1px solid ${surfaces.border}`,
          overflow: "hidden",
          bgcolor: surfaces.paper,
          backgroundImage: isDark
            ? "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)"
            : "none",
          boxShadow: isDark ? "0 18px 48px -24px rgba(0,0,0,0.65)" : "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        <TableContainer
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none"
            }
          }}
        >
          <Table size="small" sx={{ minWidth: 900, tableLayout: "fixed" }}>
            <TableHead
              sx={{
                bgcolor: isDark ? alpha("#ffffff", 0.03) : surfaces.tableHead,
                "& .MuiTableCell-root": {
                  borderBottom: `1px solid ${tableDivider}`
                }
              }}
            >
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "30%", py: 2 }}
                >
                  {copy.table.branchDetails}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "22%" }}
                >
                  {copy.table.location}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "22%" }}
                >
                  {copy.table.contactInfo}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "12%" }}
                >
                  {copy.table.support}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "10%" }}
                >
                  {copy.table.status}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "4%" }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: neutralText, opacity: isDark ? 1 : 0.7 }}>
                      {copy.emptyState}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow
                    key={branch.id}
                    hover
                    sx={{
                      transition: "background-color 0.2s ease",
                      "& td": { borderBottom: `1px solid ${tableDivider}` },
                      "&:last-of-type td": { borderBottom: "none" },
                      "&:hover": { bgcolor: tableHover }
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: iconTileBg,
                            color: isDark ? "#6ee7b7" : theme.palette.primary.main,
                            fontWeight: 900,
                            border: `1px solid ${iconTileBorder}`,
                            boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none"
                          }}
                        >
                          <PlaceRoundedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                            {branch.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: neutralText, fontWeight: 600, display: "block", mt: 0.2 }}
                          >
                            {branch.code}
                            {branch.isHead ? ` - ${copy.branch.headOfficeSuffix}` : ""}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {[branch.city, branch.state].filter(Boolean).join(", ") || copy.branch.geoLocationUnset}
                      </Typography>
                      <Typography variant="caption" sx={{ color: neutralText, fontWeight: 600 }}>
                        {branch.pincode || copy.branch.noPincode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {branch.contactNo || copy.branch.phoneEntryMissing}
                      </Typography>
                      <Typography variant="caption" sx={{ color: neutralText, fontWeight: 600 }}>
                        {branch.contactEmail || copy.branch.emailUnassigned}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {branch.isHead && (
                          <Tooltip title={copy.tooltips.certifiedHeadOffice}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08),
                                border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.28 : 0.12)}`
                              }}
                            >
                              <VerifiedRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                            </Box>
                          </Tooltip>
                        )}
                        {branch.lockerFacility && (
                          <Tooltip title={copy.tooltips.secureLockerAccess}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 1,
                                bgcolor: alpha(DESIGN_SYSTEM.COLORS.emerald, isDark ? 0.18 : 0.08),
                                border: `1px solid ${alpha(DESIGN_SYSTEM.COLORS.emerald, isDark ? 0.28 : 0.12)}`
                              }}
                            >
                              <LockRoundedIcon sx={{ fontSize: 18, color: DESIGN_SYSTEM.COLORS.emerald }} />
                            </Box>
                          </Tooltip>
                        )}
                        {branch.neftImpsService && (
                          <Tooltip title={copy.tooltips.digitalBankingEnabled}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 1,
                                bgcolor: alpha(DESIGN_SYSTEM.COLORS.blue, isDark ? 0.18 : 0.08),
                                border: `1px solid ${alpha(DESIGN_SYSTEM.COLORS.blue, isDark ? 0.28 : 0.12)}`
                              }}
                            >
                              <LanguageRoundedIcon sx={{ fontSize: 18, color: DESIGN_SYSTEM.COLORS.blue }} />
                            </Box>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={branch.isActive ? copy.status.operating : copy.status.closed}
                        sx={{
                          height: 22,
                          fontWeight: 800,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          bgcolor: branch.isActive ? alpha("#10b981", isDark ? 0.18 : 0.1) : alpha("#64748b", isDark ? 0.18 : 0.08),
                          color: branch.isActive ? (isDark ? "#6ee7b7" : "#059669") : isDark ? "#cbd5e1" : "#475569",
                          border: `1px solid ${branch.isActive ? alpha("#10b981", isDark ? 0.24 : 0.1) : alpha("#64748b", isDark ? 0.22 : 0.1)}`
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={copy.tooltips.editInfrastructure}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDrawer("branch", branch)}
                            sx={{
                              color: isDark ? "#cbd5e1" : "text.secondary",
                              borderRadius: 1.5,
                              "&:hover": {
                                color: "primary.main",
                                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08)
                              }
                            }}
                          >
                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={copy.tooltips.decommissionBranch}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBranch(branch.id)}
                            sx={{
                              borderRadius: 1,
                              "&:hover": { bgcolor: alpha(theme.palette.error.main, isDark ? 0.16 : 0.08) }
                            }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
