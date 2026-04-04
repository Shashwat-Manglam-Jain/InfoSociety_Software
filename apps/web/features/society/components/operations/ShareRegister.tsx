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
  Tabs,
  Tab,
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
        eyebrow="Share"
        title="Share Registry"
        description="Monitor institutional share capital, manage shareholder distributions, and track equity holdings for all members."
        colorScheme="rose"
        actions={
          <>
            <TextField
              size="small"
              value={shareholdingSearch}
              onChange={(event) => setShareholdingSearch(event.target.value)}
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
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => openShareholdingDrawer()}
              disabled={!canCreateShareholdings}
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
              Issue Shares
            </Button>
          </>
        }
      />

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <Tabs
          value={shareholdingTypeTab}
          onChange={(_, value) => setShareholdingTypeTab(value)}
          sx={{ 
            px: 3, 
            borderBottom: `1px solid ${surfaces.tableBorder}`,
            "& .MuiTab-root": { fontWeight: 900, py: 2.5 }
          }}
        >
          <Tab label="Shareholder" value="shareholder" />
          <Tab label="Nominal" value="nominal" />
        </Tabs>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  "Member Identity",
                  "Agent / Employee",
                  "Share Range",
                  "Total Shares",
                  "Nominal Value",
                  "Registry Status",
                  "Actions"
                ].map((label, idx) => (
                  <TableCell key={label} align={idx === 3 || idx === 4 || idx === 6 ? "right" : "left"} sx={{ fontWeight: 900, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShares.length === 0 ? (
                <TableEmpty colSpan={7} label="No equity holdings documented for this category." />
              ) : (
                filteredShares
                  .slice(shareholdingPage * shareholdingRowsPerPage, shareholdingPage * shareholdingRowsPerPage + shareholdingRowsPerPage)
                  .map((share) => (
                    <TableRow key={share.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{share.memberName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{share.agent}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{share.shareRange}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>{share.totalShareHold}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "success.main" }}>{formatCurrency(share.totalShareVal)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 900, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, px: 1, py: 0.5, borderRadius: 1 }}>
                          DOCUMENTED
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openShareholdingDrawer(share)}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteShareholding(share.id)} color="error">
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
        />
      </Paper>
    </Stack>
  );
}
