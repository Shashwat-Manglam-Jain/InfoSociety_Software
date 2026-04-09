"use client";

import React from "react";
import {
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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  IconButton,
  TextField,
  InputAdornment
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getAgentShareholdingCopy } from "@/shared/i18n/agent-shareholding-copy";

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
  const { locale } = useLanguage();
  const copy = getAgentShareholdingCopy(locale);

  const filteredShareholdings = shareholdings.filter(
    (shareholding) =>
      (shareholding.agentName || "").toLowerCase().includes(shareholdingSearch.toLowerCase()) ||
      (shareholding.folioNo || "").toLowerCase().includes(shareholdingSearch.toLowerCase())
  );

  const metrics = [
    {
      label: copy.metrics.authorizedCapital.label,
      value: "₹25.0L",
      caption: copy.metrics.authorizedCapital.caption
    },
    {
      label: copy.metrics.equityHolders.label,
      value: String(shareholdings.length),
      caption: copy.metrics.equityHolders.caption
    },
    {
      label: copy.metrics.stabilityScore.label,
      value: "95%",
      caption: copy.metrics.stabilityScore.caption
    },
    {
      label: copy.metrics.compliance.label,
      value: "SH-1 OK",
      caption: copy.metrics.compliance.caption
    }
  ];

  return (
    <Stack spacing={4}>
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
              placeholder={copy.hero.searchPlaceholder}
              value={shareholdingSearch}
              onChange={(event) => setShareholdingSearch(event.target.value)}
              sx={{
                width: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)"
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setShareholdingForm({
                  agentName: "",
                  shareRange: "",
                  totalShares: 0,
                  nominalVal: 10,
                  totalValue: 0,
                  allottedDate: new Date().toISOString().split("T")[0],
                  transferDate: "",
                  folioNo: "",
                  certNo: "",
                  status: "Active"
                });
                setActiveShareholdingDrawer("add");
              }}
              sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
            >
              {copy.hero.addButton}
            </Button>
          </>
        }
      />

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, py: 2.5 }}>{copy.table.holderArtifact}</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>{copy.table.capitalRange}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>{copy.table.totalUnits}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>{copy.table.totalValue}</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>{copy.table.complianceReg}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>{copy.table.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShareholdings
                .slice(shareholdingPage * shareholdingRowsPerPage, shareholdingPage * shareholdingRowsPerPage + shareholdingRowsPerPage)
                .map((shareholding) => (
                  <TableRow key={shareholding.id} hover>
                    <TableCell sx={{ fontWeight: 800 }}>{shareholding.agentName}</TableCell>
                    <TableCell>
                      <Chip label={shareholding.shareRange} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{shareholding.totalShares}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>
                      ₹{shareholding.totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                        {shareholding.folioNo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {copy.table.certificatePrefix} {shareholding.certNo}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={copy.tooltips.editRecord}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setShareholdingForm(shareholding);
                              setEditingShareholding(shareholding);
                              setActiveShareholdingDrawer("edit");
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={copy.tooltips.viewCertificate}>
                          <IconButton size="small" color="primary">
                            <VerifiedUserRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={copy.tooltips.transferRecord}>
                          <IconButton size="small" color="secondary">
                            <AccountBalanceRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredShareholdings.length}
          page={shareholdingPage}
          onPageChange={(_, pageNumber) => setShareholdingPage(pageNumber)}
          rowsPerPage={shareholdingRowsPerPage}
          onRowsPerPageChange={(event) => setShareholdingRowsPerPage(parseInt(event.target.value, 10))}
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
