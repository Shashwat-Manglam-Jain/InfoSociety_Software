"use client";

import React from "react";
import { 
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
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import { SectionHero } from "./SectionHero";
import { TableEmpty } from "./shared/TableEmpty";
import { StatusChip } from "./shared/StatusChip";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type RegistryType = "guarantor" | "coapplicant";

export type GuarantorRegistryProps = {
  type: RegistryType;
  rows: any[];
  search: string;
  setSearch: (v: string) => void;
  page: number;
  setPage: (p: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (r: number) => void;
};

export function GuarantorRegistry({
  type,
  rows,
  search,
  setSearch,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage
}: GuarantorRegistryProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const title = type === "guarantor" ? "Guarantor Registry" : "Co-Applicant Registry";
  const eyebrow = type === "guarantor" ? "Security" : "Joint Member";
  const description = type === "guarantor" 
    ? "Review and monitor institutional guarantors attached to active loan and credit facilities."
    : "Track joint applicants and co-signatories associated with institutional deposit and credit accounts.";
  const icon = type === "guarantor" ? <ShieldRoundedIcon /> : <GroupAddRoundedIcon />;
  const colorScheme = type === "guarantor" ? "sky" : "violet";

  const columnLabels = type === "guarantor" 
    ? ["Guarantor Name", "Branch", "Account Ref", "Facility Type", "Linked Plan", "Security Status"]
    : ["Applicant Name", "Branch", "Co-Applicant", "Relationship", "Linked Acc", "Status"];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={icon}
        eyebrow={eyebrow}
        title={title}
        description={description}
        colorScheme={colorScheme}
        actions={
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search registry..."
            sx={{
              minWidth: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: surfaces.input,
                color: "#fff",
                border: `1px solid ${surfaces.inputBorder}`
              }
            }}
            InputProps={{
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
            }}
          />
        }
      />

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {columnLabels.map((label) => (
                  <TableCell key={label} sx={{ fontWeight: 900, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={6} label={`No ${type} records documented in the current registry view.`} />
              ) : (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{row.memberName || row.name}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.branch}</TableCell>
                      <TableCell>{type === "guarantor" ? row.accountNo : row.name}</TableCell>
                      <TableCell>{type === "guarantor" ? row.accountType : row.relation}</TableCell>
                      <TableCell>{type === "guarantor" ? row.planName : row.linkedAccountNo}</TableCell>
                      <TableCell>
                        <StatusChip label={row.status} tone={row.status === "Active" || row.status === "Verified" ? "success" : "warning"} />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>
    </Stack>
  );
}
