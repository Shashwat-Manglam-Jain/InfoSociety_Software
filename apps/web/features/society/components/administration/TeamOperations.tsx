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
  Switch,
  TextField,
  InputAdornment
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type TeamOperationsProps = {
  managedUsers: any[];
  userSearch: string;
  setUserSearch: (v: string) => void;
  handleOpenDrawer: (type: "staff" | "agent" | "client") => void;
  handleToggleUserStatus: (id: string, current: boolean) => void;
  setSelectedUserAccess: (user: any) => void;
};

export function TeamOperations({
  managedUsers,
  userSearch,
  setUserSearch,
  handleOpenDrawer,
  handleToggleUserStatus,
  setSelectedUserAccess
}: TeamOperationsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Active Team", value: String(managedUsers.length), caption: "Administrative and operative identities." },
    { label: "Role Diversity", value: "3 Types", caption: "Staff, Agents, and Member-focused roles." },
    { label: "System Uptime", value: "99.9%", caption: "Login portal availability health." },
    { label: "Security", value: "RBAC", caption: "Role-Based Access Control enforced." }
  ];

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<BadgeRoundedIcon />}
        eyebrow="Operations"
        title="Team Directory"
        description="Monitor and provision institutional identities for field agents, administrative staff, and member client portals."
        colorScheme="blue"
        actions={
          <>
            <TextField 
                size="small" 
                placeholder="Search operatives..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                sx={{ 
                    width: 250, 
                    "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" } 
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} /></InputAdornment> }}
            />
            <Button 
                variant="contained" 
                startIcon={<EngineeringRoundedIcon />} 
                onClick={() => handleOpenDrawer("staff")}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
            >
                Provision User
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
                <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Operative Identity</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Structural Role</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Assigned Hub</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Portal Access</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Operational Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managedUsers
                .filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase()))
                .map((entry) => (
                <TableRow key={entry.id} hover>
                   <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                         <Avatar sx={{ bgcolor: entry.role === 'STAFF' ? "primary.main" : entry.role === 'AGENT' ? "#10b981" : "#8b5cf6", fontWeight: 900, borderRadius: 2 }}>
                            {entry.role === 'STAFF' ? <EngineeringRoundedIcon /> : entry.role === 'AGENT' ? <ToggleOnRoundedIcon /> : <GroupsRoundedIcon />}
                         </Avatar>
                         <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{entry.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">@{entry.username}</Typography>
                         </Box>
                      </Stack>
                   </TableCell>
                   <TableCell>
                      <Chip label={entry.role} size="small" sx={{ fontWeight: 900, bgcolor: entry.role === 'STAFF' ? alpha("#2563eb", 0.1) : entry.role === 'AGENT' ? alpha("#10b981", 0.1) : alpha("#8b5cf6", 0.1), color: entry.role === 'STAFF' ? "#2563eb" : entry.role === 'AGENT' ? "#10b981" : "#8b5cf6" }} />
                   </TableCell>
                   <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.branch?.name || "Global"}</Typography>
                      <Typography variant="caption" color="text.secondary">{entry.branch?.code || "Sovereign"}</Typography>
                   </TableCell>
                   <TableCell>
                      <Button size="small" startIcon={<ManageAccountsRoundedIcon sx={{ fontSize: 14 }} />} sx={{ fontWeight: 900, borderRadius: 1.5 }} onClick={() => setSelectedUserAccess(entry)}>Access Matrix</Button>
                   </TableCell>
                   <TableCell align="right">
                      <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                         <Typography variant="caption" sx={{ fontWeight: 900, color: entry.isActive ? "#10b981" : "#f43f5e" }}>{entry.isActive ? "ONLINE" : "BLOCKED"}</Typography>
                         <Switch checked={entry.isActive} onChange={() => handleToggleUserStatus(entry.id, entry.isActive)} />
                      </Stack>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
