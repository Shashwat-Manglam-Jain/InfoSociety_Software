"use client";

import React from "react";
import { 
  Button, 
  IconButton, 
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
  MenuItem,
  alpha
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { SectionHero } from "./SectionHero";
import { TableEmpty } from "./shared/TableEmpty";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getShareRegisterCopy } from "@/shared/i18n/share-register-copy";

export type ShareRegisterProps = {
  shareholdings: any[];
  shareholdingSearch: string;
  setShareholdingSearch: (v: string) => void;
  shareholdingPage: number;
  setShareholdingPage: (p: number) => void;
  shareholdingRowsPerPage: number;
  setShareholdingRowsPerPage: (r: number) => void;
  shareholdingTypeTab: string;
  setShareholdingTypeTab: (t: any) => void;
  canCreateShareholdings: boolean;
  openShareholdingDrawer: (record?: any) => void;
  handleDeleteShareholding: (id: string) => void;
  formatCurrency: (v: number) => string;
};

export function ShareRegister({
  shareholdings,
  shareholdingSearch,
  setShareholdingSearch,
  shareholdingPage,
  setShareholdingPage,
  shareholdingRowsPerPage,
  setShareholdingRowsPerPage,
  shareholdingTypeTab,
  setShareholdingTypeTab,
  canCreateShareholdings,
  openShareholdingDrawer,
  handleDeleteShareholding,
  formatCurrency
}: ShareRegisterProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;
  const { locale } = useLanguage();
  const copy = getShareRegisterCopy(locale);

  const filteredShares = shareholdings.filter((share) => {
    const search = shareholdingSearch.toLowerCase();
    const matchesTab = share.shareholderType === shareholdingTypeTab;
    const matchesSearch = 
      share.memberName.toLowerCase().includes(search) ||
      share.agent.toLowerCase().includes(search);
    return matchesTab && matchesSearch;
  });

  return (
    <Stack spacing={3}>
      <SectionHero
       
        icon={<SavingsRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="rose"
        borderRadius={1}
        actions={
          <>
            <TextField
              select
              size="small"
              value={shareholdingTypeTab}
              onChange={(e) => setShareholdingTypeTab(e.target.value)}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: surfaces.input,
                  color: "#fff",
                  border: `1px solid ${surfaces.inputBorder}`
                }
              }}
            >
              <MenuItem value="shareholder">{copy.filters.shareholder}</MenuItem>
              <MenuItem value="nominal">{copy.filters.nominal}</MenuItem>
            </TextField>
            <TextField
              size="small"
              value={shareholdingSearch}
              onChange={(event) => setShareholdingSearch(event.target.value)}
              placeholder={copy.hero.searchPlaceholder}
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
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => openShareholdingDrawer()}
              disabled={!canCreateShareholdings}
              sx={{
                bgcolor: "#fff",
                color: "#0f172a",
                borderRadius: 1,
                px: 3,
                height: 60,
                fontWeight: 600,
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
                justifyContent: "center",
                ml: { sm: 0 },
                boxShadow: "0 4px 14px 0 rgba(255,255,255,0.4)",
                "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 6px 20px rgba(255,255,255,0.25)" },
                "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", boxShadow: "none" }
              }}
            >
              {copy.hero.issueShares}
            </Button>
          </>
        }
      />

      <Paper elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  { label: copy.table.member, width: "25%", align: "left" },
                  { label: copy.table.agent, width: "20%", align: "left" },
                  { label: copy.table.range, width: "15%", align: "left" },
                  { label: copy.table.shares, width: "12%", align: "right" },
                  { label: copy.table.nominal, width: "13%", align: "right" },
                  { label: copy.table.status, width: "10%", align: "left" },
                  { label: "", width: "5%", align: "right" }
                ].map((col, idx) => (
                  <TableCell key={idx} align={col.align as any} sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: col.width, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShares.length === 0 ? (
                <TableEmpty colSpan={7} label={copy.table.emptyState} />
              ) : (
                filteredShares
                  .slice(shareholdingPage * shareholdingRowsPerPage, shareholdingPage * shareholdingRowsPerPage + shareholdingRowsPerPage)
                  .map((share) => (
                    <TableRow 
                      key={share.id} 
                      hover
                      sx={{ 
                        transition: "background-color 0.2s ease",
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{share.memberName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>{share.agent}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{share.shareRange}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "text.primary" }}>{share.totalShareHold}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "success.main" }}>{formatCurrency(share.totalShareVal)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 900, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, px: 1, py: 0.5, borderRadius: 1 }}>
                          {copy.table.documented}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openShareholdingDrawer(share)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteShareholding(share.id)} sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.08) } }}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
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
          count={filteredShares.length}
          page={shareholdingPage}
          onPageChange={(_, p) => setShareholdingPage(p)}
          rowsPerPage={shareholdingRowsPerPage}
          onRowsPerPageChange={(e) => setShareholdingRowsPerPage(parseInt(e.target.value, 10))}
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
