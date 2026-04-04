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
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { Branch } from "@/shared/types";

export type BranchInfrastructureProps = {
  branches: Branch[];
  handleOpenDrawer: (type: "branch", branch?: Branch) => void;
  handleDeleteBranch: (id: string) => void;
};

export function BranchInfrastructure({ branches, handleOpenDrawer, handleDeleteBranch }: BranchInfrastructureProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Branches", value: String(branches.length), caption: "Registered branches in this society." },
    { label: "Active", value: String(branches.filter((branch) => branch.isActive).length), caption: "Currently available for operations." },
    { label: "Head Offices", value: String(branches.filter((branch) => branch.isHead).length), caption: "Main operating hubs." },
    {
      label: "Digital Services",
      value: String(branches.filter((branch) => branch.neftImpsService).length),
      caption: "Branches with online transfer support."
    }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<PlaceRoundedIcon />}
        eyebrow="Infrastructure"
        title="Branch network"
        description="Maintain branch identity, location, and available services for each operating point."
        colorScheme="emerald"
        actions={
          <Button
            variant="contained"
            startIcon={<AddLocationAltRoundedIcon />}
            onClick={() => handleOpenDrawer("branch")}
            sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 800, "&:hover": { bgcolor: "#f8fafc" } }}
          >
            Add branch
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
          borderRadius: 1.5, 
          border: `1px solid ${surfaces.border}`, 
          overflow: "hidden", 
          bgcolor: surfaces.paper,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "30%", py: 2 }}>Branch Details</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "22%" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "22%" }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "12%" }}>Support</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "10%" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "4%" }}>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", opacity: 0.7 }}>
                      No branches registered yet. Start by defining your local presence.
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
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 900,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}
                        >
                          <PlaceRoundedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                            {branch.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mt: 0.2 }}>
                            {branch.code} {branch.isHead ? "• Head Office" : ""}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {[branch.city, branch.state].filter(Boolean).join(", ") || "Geo-location Unset"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        {branch.pincode || "No Pincode"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {branch.contactNo || "Phone Entry Missing"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        {branch.contactEmail || "Email Unassigned"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {branch.isHead && (
                          <Tooltip title="Certified Head Office">
                            <VerifiedRoundedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                          </Tooltip>
                        )}
                        {branch.lockerFacility && (
                          <Tooltip title="Secure Locker Access">
                            <LockRoundedIcon sx={{ fontSize: 18, color: DESIGN_SYSTEM.COLORS.emerald }} />
                          </Tooltip>
                        )}
                        {branch.neftImpsService && (
                          <Tooltip title="Digital Banking Enabled">
                            <LanguageRoundedIcon sx={{ fontSize: 18, color: DESIGN_SYSTEM.COLORS.blue }} />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={branch.isActive ? "Operating" : "Closed"}
                        sx={{
                          height: 22,
                          fontWeight: 800,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          bgcolor: branch.isActive ? alpha("#10b981", 0.1) : alpha("#64748b", 0.08),
                          color: branch.isActive ? "#059669" : "#475569",
                          border: `1px solid ${branch.isActive ? alpha("#10b981", 0.1) : alpha("#64748b", 0.1)}`
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit Infrastructure">
                          <IconButton size="small" onClick={() => handleOpenDrawer("branch", branch)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}>
                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Decommission Branch">
                          <IconButton size="small" color="error" onClick={() => handleDeleteBranch(branch.id)} sx={{ "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) } }}>
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
