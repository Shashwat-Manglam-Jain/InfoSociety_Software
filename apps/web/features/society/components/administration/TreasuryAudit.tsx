"use client";

import React from "react";
import { 
  Box, 
  Button, 
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
  TextField,
  InputAdornment,
  MenuItem
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type TreasuryAuditProps = {
  transactions: any[];
  transactionSearch: string;
  setTransactionSearch: (v: string) => void;
  formatCurrency: (v: number) => string;
  formatDate: (v: string) => string;
};

export function TreasuryAudit({
  transactions,
  transactionSearch,
  setTransactionSearch,
  formatCurrency,
  formatDate
}: TreasuryAuditProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Treasury Flow", value: "₹45.6L", caption: "Aggregate institutional liquidity." },
    { label: "Audit Radius", value: "30 Days", caption: "Current ledger synchronization window." },
    { label: "Fiscal Health", value: "Optimal", caption: "Treasury reserve status." },
    { label: "Events", value: String(transactions.length), caption: "Transactions recorded in this span." }
  ];

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<AccountBalanceWalletRoundedIcon />}
        eyebrow="Compliance"
        title="Institutional Treasury"
        description="Monitor the aggregate financial flow, fiscal reserves, and institutional audit trails of the entire society."
        colorScheme="blue"
        actions={
          <>
            <TextField 
                size="small" 
                placeholder="Search audit trail..." 
                value={transactionSearch}
                onChange={e => setTransactionSearch(e.target.value)}
                sx={{ 
                    width: 250, 
                    "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" } 
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} /></InputAdornment> }}
            />
            <Button 
                variant="contained" 
                startIcon={<FileDownloadRoundedIcon />} 
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
            >
                Export Ledger
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
                <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Compliance Date</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Fiscal Hub (Branch)</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Event Reference</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Flow Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Impact Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .filter(t => (t.reference || "").toLowerCase().includes(transactionSearch.toLowerCase()) || (t.type || "").toLowerCase().includes(transactionSearch.toLowerCase()))
                .length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                      <ReceiptLongRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>No Fiscal Events Found</Typography>
                      <Typography variant="body2" color="text.secondary">Transactions will populate as institutional operations execute.</Typography>
                   </TableCell>
                </TableRow>
              ) : (
                transactions
                  .filter(t => (t.reference || "").toLowerCase().includes(transactionSearch.toLowerCase()) || (t.type || "").toLowerCase().includes(transactionSearch.toLowerCase()))
                  .map((t, idx) => (
                    <TableRow key={idx} hover>
                       <TableCell sx={{ fontWeight: 700 }}>{formatDate(t.date)}</TableCell>
                       <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{t.branchName || "Main Hub"}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "primary.main" }}>{t.branchCode}</Typography>
                       </TableCell>
                       <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.reference}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.category || "General Ledger"}</Typography>
                       </TableCell>
                       <TableCell>
                          <Chip label={t.type} size="small" sx={{ fontWeight: 900, bgcolor: t.type === 'CREDIT' ? alpha("#10b981", 0.1) : alpha("#f43f5e", 0.1), color: t.type === 'CREDIT' ? "#10b981" : "#f43f5e" }} />
                       </TableCell>
                       <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 900, color: t.type === 'CREDIT' ? "#10b981" : "#f43f5e" }}>
                             {t.type === 'CREDIT' ? '+' : '-'} {formatCurrency(t.amount)}
                          </Typography>
                       </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
