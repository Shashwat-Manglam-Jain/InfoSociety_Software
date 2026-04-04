"use client";

import React from "react";
import { 
  Button, 
  Chip, 
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
  Tooltip,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { SectionHero } from "./SectionHero";
import { TableEmpty } from "./shared/TableEmpty";
import { StatusChip } from "./shared/StatusChip";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type AccountRegistryProps = {
  accounts: any[];
  accountSearch: string;
  setAccountSearch: (v: string) => void;
  accountPage: number;
  setAccountPage: (p: number) => void;
  accountRowsPerPage: number;
  setAccountRowsPerPage: (r: number) => void;
  canCreateAccounts: boolean;
  openAccountDrawer: () => void;
  openAccountDetail: (id: string) => void;
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
  members: any[];
  plans: any[];
};

export function AccountRegistry({
  accounts,
  accountSearch,
  setAccountSearch,
  accountPage,
  setAccountPage,
  accountRowsPerPage,
  setAccountRowsPerPage,
  canCreateAccounts,
  openAccountDrawer,
  openAccountDetail,
  formatCurrency,
  formatDate,
  members,
  plans
}: AccountRegistryProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const filteredAccounts = accounts.filter((account) => {
    const search = accountSearch.toLowerCase();
    return (
      account.accountNo.toLowerCase().includes(search) ||
      account.memberName.toLowerCase().includes(search) ||
      account.planName.toLowerCase().includes(search)
    );
  });

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<PaymentsRoundedIcon />}
        eyebrow="Account"
        title="Account Registry"
        description="View all deposit and loan accounts, manage ledger entries, and access detailed account statements."
        colorScheme="violet"
        actions={
          <>
            <TextField
              size="small"
              value={accountSearch}
              onChange={(event) => setAccountSearch(event.target.value)}
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
            <Tooltip title={!members.length ? "Create a client first" : (!plans.length ? "Configure at least one product plan first" : "Initialize a new institutional account")}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={openAccountDrawer}
                  disabled={!canCreateAccounts}
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
                  Open Account
                </Button>
              </span>
            </Tooltip>
          </>
        }
      />

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  "Account Identity",
                  "Member Associated",
                  "Plan Mapping",
                  "Orientation Date",
                  "Account Status",
                  "Liquid Balance",
                  "Actions"
                ].map((label, idx) => (
                  <TableCell key={label} align={idx === 5 || idx === 6 ? "right" : "left"} sx={{ fontWeight: 900, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableEmpty colSpan={7} label="No account records found matching the criteria." />
              ) : (
                filteredAccounts
                  .slice(accountPage * accountRowsPerPage, accountPage * accountRowsPerPage + accountRowsPerPage)
                  .map((account) => (
                    <TableRow key={account.id} hover sx={{ cursor: "pointer" }} onClick={() => openAccountDetail(account.id)}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{account.accountNo}</Typography>
                        <Chip label={account.accountType} size="small" sx={{ fontSize: "0.6rem", fontWeight: 900, height: 18, borderRadius: 1 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{account.memberName}</Typography>
                        <Typography variant="caption" color="text.secondary">{account.branch}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>{account.planName}</Typography>
                      </TableCell>
                      <TableCell>{formatDate(account.openDate)}</TableCell>
                      <TableCell>
                        <StatusChip label={account.status} tone={account.status === "Active" ? "success" : "warning"} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>{formatCurrency(account.amount)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openAccountDetail(account.id); }}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredAccounts.length}
          page={accountPage}
          onPageChange={(_, p) => setAccountPage(p)}
          rowsPerPage={accountRowsPerPage}
          onRowsPerPageChange={(e) => setAccountRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>
    </Stack>
  );
}
