"use client";

import React from "react";
import { 
  Box, 
  Button, 
  Chip, 
  Grid, 
  Paper, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip,
  Typography,
  IconButton
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type BranchInfrastructureProps = {
  branches: any[];
  handleOpenDrawer: (type: "branch", branch?: any) => void;
  handleDeleteBranch: (id: string) => void;
};

export function BranchInfrastructure({
  branches,
  handleOpenDrawer,
  handleDeleteBranch
}: BranchInfrastructureProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Total Nodes", value: String(branches.length), caption: "Geographical operational points." },
    { label: "Active Channels", value: String(branches.filter(b => b.isActive).length), caption: "Operational & online units." },
    { label: "Expansion Score", value: "85%", caption: "Institutional coverage health." },
    { label: "Compliance", value: "Verified", caption: "Infrastructure regulatory status." }
  ];

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<AddLocationAltRoundedIcon />}
        eyebrow="Infrastructure"
        title="Branch Network"
        description="Scalable geographic deployment and operational control across the society's physical and digital network."
        colorScheme="emerald"
        actions={
          <Button 
            variant="contained" 
            startIcon={<AddLocationAltRoundedIcon />} 
            onClick={() => handleOpenDrawer("branch")}
            sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
          >
            Deploy Hub Entity
          </Button>
        }
      />

      <Grid container spacing={3}>
        {metrics.map((m, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      {branches.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: 6, border: "1px dashed rgba(15, 23, 42, 0.2)", textAlign: 'center' }}>
          <MapRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>No Institutional Infrastructure Setup</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>Your society currently has no physical or digital branches mapped. Deploy your headquarters to begin operations.</Typography>
          <Button variant="contained" size="large" onClick={() => handleOpenDrawer("branch")} sx={{ bgcolor: "#0f172a", py: 1.5, px: 4, borderRadius: 3, fontWeight: 900 }}>Provision First Branch</Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: 'hidden', bgcolor: surfaces.paper }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: surfaces.tableHead }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Branch Artifact</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Geographic Point</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Infrastructure</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Governance Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{b.name}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", color: "primary.main", fontWeight: 700 }}>ID: {b.code}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{b.city}, {b.state}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.pincode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {b.isHead && <Tooltip title="Corporate Headquarters"><VerifiedUserRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} /></Tooltip>}
                        {b.lockerFacility && <Tooltip title="Locker Vault Enabled"><ShieldRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} /></Tooltip>}
                        {b.neftImpsService && <Tooltip title="Digital RTGS/IMPS Hub"><LanguageRoundedIcon sx={{ fontSize: 18, color: "#8b5cf6" }} /></Tooltip>}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={b.isActive ? "Operational" : "Deactivated"} size="small" sx={{ fontWeight: 900, bgcolor: b.isActive ? alpha("#10b981", 0.1) : alpha("#f43f5e", 0.1), color: b.isActive ? "#10b981" : "#f43f5e" }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" sx={{ color: "primary.main" }} onClick={() => handleOpenDrawer("branch", b)}><EditRoundedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: "error.main" }} onClick={() => handleDeleteBranch(b.id)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Stack>
  );
}
