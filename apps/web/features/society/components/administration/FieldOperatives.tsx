"use client";

import React from "react";
import { 
  Avatar, 
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
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  Tooltip
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type FieldOperativesProps = {
  agents: any[];
  agentSearch: string;
  setAgentSearch: (v: string) => void;
  agentPage: number;
  setAgentPage: (p: number) => void;
  agentRowsPerPage: number;
  setAgentRowsPerPage: (r: number) => void;
  handleOpenDrawer: (type: "agent") => void;
  setEditingAgent: (agent: any) => void;
};

export function FieldOperatives({
  agents,
  agentSearch,
  setAgentSearch,
  agentPage,
  setAgentPage,
  agentRowsPerPage,
  setAgentRowsPerPage,
  handleOpenDrawer,
  setEditingAgent
}: FieldOperativesProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Field Force", value: String(agents.length), caption: "Total institutional field agents." },
    { label: "Daily Volume", value: "₹2.4L", caption: "Aggregate daily collection health." },
    { label: "Service Score", value: "A+", caption: "Agent performance institutional rating." },
    { label: "Compliance", value: "KYC OK", caption: "Regulatory background check status." }
  ];

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<BadgeRoundedIcon />}
        eyebrow="Market"
        title="Field Operatives"
        description="Monitor and manage the society's field force, tracking performance metrics and geographic coverage."
        colorScheme="blue"
        actions={
          <>
            <TextField 
                size="small" 
                placeholder="Search operatives..." 
                value={agentSearch}
                onChange={e => setAgentSearch(e.target.value)}
                sx={{ 
                    width: 250, 
                    "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" } 
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} /></InputAdornment> }}
            />
            <Button 
                variant="contained" 
                startIcon={<PersonAddAlt1RoundedIcon />} 
                onClick={() => handleOpenDrawer("agent")}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
            >
                Recruit Agent
            </Button>
          </>
        }
      />

      <Grid container spacing={3}>
        {metrics.map((m, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: 'hidden', bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Agent Artifact</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Assigned Hub</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Market Reach</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Financial Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents
                .filter(a => (a.firstName + " " + a.lastName).toLowerCase().includes(agentSearch.toLowerCase()) || (a.code || "").toLowerCase().includes(agentSearch.toLowerCase()))
                .slice(agentPage * agentRowsPerPage, agentPage * agentRowsPerPage + agentRowsPerPage)
                .map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", fontWeight: 900, borderRadius: 2 }}>{a.firstName[0]}{a.lastName[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{a.firstName} {a.lastName}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "primary.main", fontWeight: 700 }}>ID: {a.code || a.id.slice(-8).toUpperCase()}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.branch?.name || "Corporate"}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.branch?.code || "HQ"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{a._count?.agentClients || 0} Members</Typography>
                      <Typography variant="caption" color="text.secondary">Total Portfolio Density</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={a.isActive !== false ? "Active" : "Deactivated"} size="small" sx={{ fontWeight: 900, bgcolor: a.isActive !== false ? alpha("#10b981", 0.1) : alpha("#f43f5e", 0.1), color: a.isActive !== false ? "#10b981" : "#f43f5e" }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Examine Portfolio"><IconButton size="small" onClick={() => setEditingAgent(a)}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Compliance Check"><IconButton size="small" color="primary"><VerifiedUserRoundedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Ledger Balance"><IconButton size="small" color="secondary"><AccountBalanceRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination 
          component="div" 
          count={agents.length} 
          page={agentPage} 
          onPageChange={(_, p) => setAgentPage(p)} 
          rowsPerPage={agentRowsPerPage} 
          onRowsPerPageChange={e => setAgentRowsPerPage(parseInt(e.target.value, 10))} 
        />
      </Paper>
    </Stack>
  );
}
