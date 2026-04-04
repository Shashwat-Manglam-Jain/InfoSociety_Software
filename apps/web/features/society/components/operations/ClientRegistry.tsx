"use client";

import React from "react";
import { 
  Box, 
  Button, 
  Chip, 
  Paper, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  TextField, 
  Tooltip,
  Typography,
  Avatar,
  Grid
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { SectionHero } from "./SectionHero";
import { MetricCard } from "./MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type ClientRegistryProps = {
  members: any[];
  memberSearch: string;
  setMemberSearch: (v: string) => void;
  memberPage: number;
  setMemberPage: (p: number) => void;
  memberRowsPerPage: number;
  setMemberRowsPerPage: (r: number) => void;
  canCreateMembers: boolean;
  openCreateMemberDrawer: () => void;
  openMemberDetail: (id: string | null) => void;
  formatDate: (d: string) => string;
};

export function ClientRegistry({
  members,
  memberSearch,
  setMemberSearch,
  memberPage,
  setMemberPage,
  memberRowsPerPage,
  setMemberRowsPerPage,
  canCreateMembers,
  openCreateMemberDrawer,
  openMemberDetail,
  formatDate
}: ClientRegistryProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Total Members", value: String(members.length), caption: "Onboarded institutional clients." },
    { label: "Pending KYC", value: "0", caption: "Members requiring verification." },
    { label: "Active Shares", value: "0", caption: "Total shareholding count." },
    { label: "Credit Score", value: "A+", caption: "Institutional risk health." }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<GroupsRoundedIcon />}
        eyebrow="Member"
        title="Client Registry"
        description="Search, create, edit, and drill into each member with nominee, address, share holding, bank account, document, account, loan, login, guarantor, and KYC sections."
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search registry..."
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: surfaces.input,
                  color: "#fff",
                  border: `1px solid ${surfaces.border}`,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                  "&.Mui-focused": { bgcolor: "rgba(255,255,255,0.12)", borderColor: "primary.main" }
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
              }}
            />
            <Tooltip title={!canCreateMembers ? "Configure at least one branch before adding clients" : "Onboard a new society member"}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={openCreateMemberDrawer}
                  disabled={!canCreateMembers}
                  sx={{
                    bgcolor: "#fff",
                    color: "#0f172a",
                    borderRadius: 3,
                    px: 3,
                    height: 40,
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "0 4px 14px 0 rgba(255,255,255,0.4)",
                    "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 6px 20px rgba(255,255,255,0.25)" },
                    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", boxShadow: "none" }
                  }}
                >
                  Create Client
                </Button>
              </span>
            </Tooltip>
          </>
        }
      />

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  "Member Identity",
                  "Member Details",
                  "Contact Matrix",
                  "Regional Scope",
                  "Joined On",
                  "Actions"
                ].map((label) => (
                  <TableCell key={label} sx={{ fontWeight: 900, py: 2.5, whiteSpace: "nowrap", borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" color="text.secondary">No members provisioned yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                members.slice(memberPage * memberRowsPerPage, memberPage * memberRowsPerPage + memberRowsPerPage).map((member) => (
                  <TableRow key={member.id} hover sx={{ cursor: "pointer" }} onClick={() => openMemberDetail(member.id)}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 900, borderRadius: 2 }}>
                          {member.memberName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{member.memberName}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>ID: {member.memberId}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{member.occupation || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary">{member.branchName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{member.mobileNo}</Typography>
                      <Typography variant="caption" color="text.secondary">{member.email || "No Email"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.city}</Typography>
                      <Typography variant="caption" color="text.secondary">{member.state}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(member.registrationDate)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View Profile">
                          <Button size="small" variant="outlined" sx={{ borderRadius: 2, minWidth: 40 }} onClick={(e) => { e.stopPropagation(); openMemberDetail(member.id); }}>
                            <VisibilityRoundedIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={members.length}
          page={memberPage}
          onPageChange={(_, p) => setMemberPage(p)}
          rowsPerPage={memberRowsPerPage}
          onRowsPerPageChange={(e) => setMemberRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>
    </Stack>
  );
}


