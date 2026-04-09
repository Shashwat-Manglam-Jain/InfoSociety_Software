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
  Typography,
  Button
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { SectionHero } from "./SectionHero";
import { TableEmpty } from "./shared/TableEmpty";
import { StatusChip } from "./shared/StatusChip";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getGuarantorRegistryCopy } from "@/shared/i18n/guarantor-registry-copy";

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
  const { locale } = useLanguage();
  const copy = getGuarantorRegistryCopy(locale);
  const registryCopy = type === "guarantor" ? copy.guarantor : copy.coapplicant;
  const icon = type === "guarantor" ? <ShieldRoundedIcon /> : <GroupAddRoundedIcon />;
  const colorScheme = type === "guarantor" ? "sky" : "violet";
  const getStatusMeta = (status: string) => {
    if (status === "Active") {
      return {
        label: copy.common.statuses.active,
        tone: "success" as const
      };
    }

    if (status === "Verified") {
      return {
        label: copy.common.statuses.verified,
        tone: "success" as const
      };
    }

    if (status === "Pending") {
      return {
        label: copy.common.statuses.pending,
        tone: "warning" as const
      };
    }

    return { label: status, tone: "warning" as const };
  };

  const columnLabels = type === "guarantor" 
    ? [
        { label: copy.guarantor.columns.name, width: "25%", align: "left" },
        { label: copy.guarantor.columns.branch, width: "15%", align: "left" },
        { label: copy.guarantor.columns.accountRef, width: "15%", align: "left" },
        { label: copy.guarantor.columns.facilityType, width: "15%", align: "left" },
        { label: copy.guarantor.columns.linkedPlan, width: "15%", align: "left" },
        { label: copy.guarantor.columns.status, width: "15%", align: "left" },
        { label: copy.guarantor.columns.actions, width: "10%", align: "right" }
      ]
    : [
        { label: copy.coapplicant.columns.name, width: "25%", align: "left" },
        { label: copy.coapplicant.columns.branch, width: "15%", align: "left" },
        { label: copy.coapplicant.columns.coApplicant, width: "15%", align: "left" },
        { label: copy.coapplicant.columns.relationship, width: "15%", align: "left" },
        { label: copy.coapplicant.columns.linkedAccount, width: "15%", align: "left" },
        { label: copy.coapplicant.columns.status, width: "15%", align: "left" },
        { label: copy.coapplicant.columns.actions, width: "10%", align: "right" }
      ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={icon}
        eyebrow={registryCopy.eyebrow}
        title={registryCopy.title}
        description={registryCopy.description}
        colorScheme={colorScheme}
        actions={
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.common.searchPlaceholder}
            sx={{
              minWidth: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
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

      <Paper elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {columnLabels.map((col, idx) => (
                  <TableCell key={idx} align={col.align as any} sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: col.width, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={7} label={registryCopy.emptyState} />
              ) : (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, idx) => {
                    const status = getStatusMeta(row.status);

                    return (
                    <TableRow 
                      key={idx} 
                      hover
                      sx={{ 
                        transition: "background-color 0.2s ease",
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{row.memberName || row.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>{row.branch}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{type === "guarantor" ? row.accountNo : row.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>{type === "guarantor" ? row.accountType : row.relation}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>{type === "guarantor" ? row.planName : row.linkedAccountNo}</Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip label={status.label} tone={status.tone} />
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          aria-label={copy.common.actions.edit}
                          sx={{ 
                            minWidth: "auto", 
                            p: 1, 
                            color: "text.secondary", 
                            "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } 
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                  })
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
          labelRowsPerPage={copy.common.pagination.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            copy.common.pagination.displayedRows
              .replace("{{from}}", String(from))
              .replace("{{to}}", String(to))
              .replace("{{count}}", String(count))
          }
          getItemAriaLabel={(buttonType) =>
            buttonType === "next" ? copy.common.pagination.nextPage : copy.common.pagination.previousPage
          }
        />
      </Paper>
    </Stack>
  );
}
