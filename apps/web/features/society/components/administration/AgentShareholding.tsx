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
  IconButton,
  TextField,
  InputAdornment,
  TablePagination
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type AgentShareholdingProps = {
  shareholdings: any[];
  shareholdingSearch: string;
  setShareholdingSearch: (v: string) => void;
  shareholdingPage: number;
  setShareholdingPage: (p: number) => void;
  shareholdingRowsPerPage: number;
  setShareholdingRowsPerPage: (r: number) => void;
  setActiveShareholdingDrawer: (v: "add" | "edit" | null) => void;
  setShareholdingForm: (v: any) => void;
  setEditingShareholding: (v: any) => void;
};

export function AgentShareholding({
  shareholdings,
  shareholdingSearch,
  setShareholdingSearch,
  shareholdingPage,
  setShareholdingPage,
  shareholdingRowsPerPage,
  setShareholdingRowsPerPage,
  setActiveShareholdingDrawer,
  setShareholdingForm,
  setEditingShareholding
}: AgentShareholdingProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Authorized Capital", value: "₹25.0L", caption: "Institutional equity ceiling." },
    { label: "Equity Holders", value: String(shareholdings.length), caption: "Total capital unit owners." },
    { label: "Stability Score", value: "95%", caption: "Institutional capital health." },
    { label: "Compliance", value: "SH-1 OK", caption: "Share certificate regulatory status." }
  ];

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<GroupsRoundedIcon />}
        eyebrow="Capital"
        title="Institutional Equity"
        description="Maintain detailed records of capital distribution, equity holdings, and share certificate compliance."
        colorScheme="blue"
        actions={
          <>
            <TextField 
                size="small" 
                placeholder="Search equity holders..." 
                value={shareholdingSearch}
                onChange={e => setShareholdingSearch(e.target.value)}
                sx={{ 
                    width: 250, 
                    "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" } 
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} /></InputAdornment> }}
            />
            <Button 
                variant="contained" 
                startIcon={<AddRoundedIcon />} 
                onClick={() => { setShareholdingForm({ agentName: "", shareRange: "", totalShares: 0, nominalVal: 10, totalValue: 0, allottedDate: new Date().toISOString().split('T')[0], transferDate: "", folioNo: "", certNo: "", status: "Active" }); setActiveShareholdingDrawer("add"); }}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
            >
                Allot Capital
            </Button>
          </>
        }
      />

      <Grid container spacing={3}>
        {metrics.map((m, idx) => (
          <Grid key={m.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: 'hidden', bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Holder Artifact</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Capital Range</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Total Units</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Total Value (₹)</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Compliance Reg</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shareholdings
                .filter(s => (s.agentName || "").toLowerCase().includes(shareholdingSearch.toLowerCase()) || (s.folioNo || "").toLowerCase().includes(shareholdingSearch.toLowerCase()))
                .slice(shareholdingPage * shareholdingRowsPerPage, shareholdingPage * shareholdingRowsPerPage + shareholdingRowsPerPage)
                .map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 800 }}>{s.agentName}</TableCell>
                    <TableCell><Chip label={s.shareRange} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5 }} /></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{s.totalShares}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>₹{s.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>{s.folioNo}</Typography>
                      <Typography variant="caption" color="text.secondary">Cert: {s.certNo}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit Record"><IconButton size="small" onClick={() => { setShareholdingForm(s); setEditingShareholding(s); setActiveShareholdingDrawer("edit"); }}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="View Certificate SH-1"><IconButton size="small" color="primary"><VerifiedUserRoundedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Transfer SH-4"><IconButton size="small" color="secondary"><AccountBalanceRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination 
          component="div" 
          count={shareholdings.length} 
          page={shareholdingPage} 
          onPageChange={(_, p) => setShareholdingPage(p)} 
          rowsPerPage={shareholdingRowsPerPage} 
          onRowsPerPageChange={e => setShareholdingRowsPerPage(parseInt(e.target.value, 10))} 
        />
      </Paper>
    </Stack>
  );
}
