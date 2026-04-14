"use client";

import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useTheme } from "@mui/material/styles";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getTreasuryAuditCopy } from "@/shared/i18n/treasury-audit-copy";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { TreasuryTransactionRow } from "../../lib/society-admin-dashboard";

export type TreasuryAuditProps = {
  transactions: TreasuryTransactionRow[];
  transactionSearch: string;
  setTransactionSearch: (value: string) => void;
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
};

export function TreasuryAudit({
  transactions,
  transactionSearch,
  setTransactionSearch,
  formatCurrency,
  formatDate
}: TreasuryAuditProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getTreasuryAuditCopy(locale);
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const filteredTransactions = transactions.filter((transaction) => {
    const query = transactionSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [
      transaction.reference,
      transaction.accountNumber,
      transaction.customerName,
      transaction.branchName,
      transaction.category
    ].some((value) => value.toLowerCase().includes(query));
  });

  const totalCredits = filteredTransactions
    .filter((transaction) => transaction.type === "CREDIT")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalDebits = filteredTransactions
    .filter((transaction) => transaction.type === "DEBIT")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const metrics = [
    { label: copy.metrics.entries.label, value: String(filteredTransactions.length), caption: copy.metrics.entries.caption },
    { label: copy.metrics.credits.label, value: formatCurrency(totalCredits), caption: copy.metrics.credits.caption },
    { label: copy.metrics.debits.label, value: formatCurrency(totalDebits), caption: copy.metrics.debits.caption },
    { label: copy.metrics.net.label, value: formatCurrency(totalCredits - totalDebits), caption: copy.metrics.net.caption }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<AccountBalanceWalletRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="blue"
        actions={
          <TextField
            size="small"
            value={transactionSearch}
            onChange={(event) => setTransactionSearch(event.target.value)}
            placeholder={copy.hero.searchPlaceholder}
            sx={{
              minWidth: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: surfaces.input,
                color: "#fff",
                border: `1px solid ${surfaces.inputBorder}`
              }
            }}
            InputProps={{
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
            }}
          />
        }
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }
        }}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 920, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, width: "12%" }}>{copy.table.date}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "16%" }}>{copy.table.reference}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>{copy.table.account}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>{copy.table.customer}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "16%" }}>{copy.table.branch}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "10%" }}>{copy.table.type}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, width: "10%" }}>
                  {copy.table.amount}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {copy.emptyState}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(transaction.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.enteredBy}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {transaction.reference}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {transaction.accountNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {transaction.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {transaction.branchName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.branchCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: transaction.type === "CREDIT" ? "#15803d" : "#b91c1c"
                        }}
                      >
                        {transaction.type === "CREDIT" ? copy.transactionType.credit : copy.transactionType.debit}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: transaction.type === "CREDIT" ? "#15803d" : "#b91c1c"
                        }}
                      >
                        {transaction.type === "CREDIT" ? "+ " : "- "}
                        {formatCurrency(transaction.amount)}
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
