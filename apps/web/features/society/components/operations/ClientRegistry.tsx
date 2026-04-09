"use client";

import React from "react";
import { 
  Box, 
  Button, 
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
  Grid,
  IconButton
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { SectionHero } from "./SectionHero";
import { MetricCard } from "./MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getClientRegistryCopy } from "@/shared/i18n/client-registry-copy";

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
  memberDetailEnabled?: boolean;
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
  formatDate,
  memberDetailEnabled = true
}: ClientRegistryProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;
  const { locale } = useLanguage();
  const copy = getClientRegistryCopy(locale);
  const filteredMembers = members.filter((member) => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [
      member.memberName,
      member.memberId,
      member.mobileNo,
      member.email,
      member.branchName
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const metrics = [
    { label: copy.metrics.totalMembers.label, value: String(members.length), caption: copy.metrics.totalMembers.caption },
    { label: copy.metrics.pendingKyc.label, value: "0", caption: copy.metrics.pendingKyc.caption },
    { label: copy.metrics.activeShares.label, value: "0", caption: copy.metrics.activeShares.caption },
    { label: copy.metrics.creditScore.label, value: "A+", caption: copy.metrics.creditScore.caption }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<GroupsRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder={copy.hero.searchPlaceholder}
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
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
            <Tooltip title={!canCreateMembers ? copy.hero.creationDisabledTooltip : copy.hero.createMemberTooltip}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={openCreateMemberDrawer}
                  disabled={!canCreateMembers}
                  sx={{
                    bgcolor: "#fff",
                    color: "#0f172a",
                    borderRadius: 1,
                    px: 3,
                    height: 40,
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "0 4px 14px 0 rgba(255,255,255,0.4)",
                    "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 6px 20px rgba(255,255,255,0.25)" },
                    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", boxShadow: "none" }
                  }}
                >
                  {copy.hero.addMember}
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

      <Paper elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 860, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  { label: copy.table.identity, width: "25%", align: "left" },
                  { label: copy.table.profile, width: "20%", align: "left" },
                  { label: copy.table.contact, width: "20%", align: "left" },
                  { label: copy.table.location, width: "15%", align: "left" },
                  { label: copy.table.date, width: "15%", align: "left" },
                  { label: "", width: "5%", align: "right" }
                ].map((col, idx) => (
                  <TableCell key={idx} align={col.align as any} sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: col.width, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" color="text.secondary">{copy.table.emptyState}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers
                  .slice(memberPage * memberRowsPerPage, memberPage * memberRowsPerPage + memberRowsPerPage)
                  .map((member) => (
                  <TableRow 
                    key={member.id} 
                    hover 
                    sx={{ 
                      cursor: memberDetailEnabled ? "pointer" : "default",
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                    }} 
                    onClick={memberDetailEnabled ? () => openMemberDetail(member.id) : undefined}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 900, borderRadius: 2 }}>
                          {member.memberName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "text.primary" }}>{member.memberName}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>{copy.table.memberId}: {member.memberId}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{member.occupation || "-"}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{member.branchName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{member.mobileNo}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{member.email || copy.table.noEmailOnFile}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{member.city}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{member.state}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>{formatDate(member.registrationDate)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {memberDetailEnabled ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={copy.table.viewProfile}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => { e.stopPropagation(); openMemberDetail(member.id); }}
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) }
                              }}
                            >
                              <VisibilityRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredMembers.length}
          page={memberPage}
          onPageChange={(_, p) => setMemberPage(p)}
          rowsPerPage={memberRowsPerPage}
          onRowsPerPageChange={(e) => setMemberRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage={copy.pagination.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            copy.pagination.displayedRows
              .replace("{{from}}", String(from))
              .replace("{{to}}", String(to))
              .replace("{{count}}", String(count))
          }
          getItemAriaLabel={(buttonType) =>
            buttonType === "next" ? copy.pagination.nextPage : copy.pagination.previousPage
          }
        />
      </Paper>
    </Stack>
  );
}
