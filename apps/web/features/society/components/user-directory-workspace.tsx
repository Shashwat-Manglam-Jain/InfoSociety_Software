"use client";

import { useEffect, useMemo, useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { getUserDirectory, type UserDirectoryEntry } from "@/shared/api/users";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getUserDirectoryWorkspaceCopy } from "@/shared/i18n/user-directory-workspace-copy";
import { toast } from "@/shared/ui/toast";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";

type UserDirectoryWorkspaceProps = {
  token: string;
};

function resolveIntlLocale(locale: "en" | "hi" | "mr") {
  return locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
}

function formatDate(dateStr: string, locale: "en" | "hi" | "mr"): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(resolveIntlLocale(locale));
}

export function UserDirectoryWorkspace({ token }: UserDirectoryWorkspaceProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getUserDirectoryWorkspaceCopy(locale);
  const [rows, setRows] = useState<UserDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserDirectory(token);
      setRows(data);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.loadFailed;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();
  }, [token, copy.errors.loadFailed]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.username.toLowerCase().includes(q) ||
        row.fullName.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const metrics = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.isActive).length;
    const inactive = rows.filter((r) => !r.isActive).length;
    const roles = new Set(rows.map((r) => r.role)).size;

    return [
      { label: copy.metrics.totalUsers.label, value: String(total), caption: copy.metrics.totalUsers.caption },
      { label: copy.metrics.active.label, value: String(active), caption: copy.metrics.active.caption },
      { label: copy.metrics.inactive.label, value: String(inactive), caption: copy.metrics.inactive.caption },
      { label: copy.metrics.roles.label, value: String(roles), caption: copy.metrics.roles.caption }
    ];
  }, [rows, copy]);

  const getRoleColor = (role: string): "primary" | "secondary" | "success" | "error" | "warning" | "info" | "default" => {
    switch (role) {
      case "SUPER_USER":
        return "error";
      case "AGENT":
        return "primary";
      case "CLIENT":
        return "success";
      case "STAFF":
        return "info";
      default:
        return "default";
    }
  };

  function localizeRole(role: string) {
    return copy.roles[role] ?? role;
  }

  return (
    <Box>
      <SectionHero icon={<CircleIcon />} eyebrow={copy.hero.eyebrow} title={copy.hero.title} description={copy.hero.description} />

      <Box sx={{ px: 2, py: 3 }}>
        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.label}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder={copy.actions.searchPlaceholder}
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadRows()} disabled={loading}>
            {copy.actions.refresh}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : paginatedRows.length === 0 ? (
          <Table>
            <TableBody>
              <TableEmpty colSpan={8} label={search ? copy.table.emptySearch : copy.table.emptyDefault} />
            </TableBody>
          </Table>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell width="5%"></TableCell>
                    <TableCell>{copy.table.username}</TableCell>
                    <TableCell>{copy.table.fullName}</TableCell>
                    <TableCell>{copy.table.role}</TableCell>
                    <TableCell>{copy.table.status}</TableCell>
                    <TableCell>{copy.table.branch}</TableCell>
                    <TableCell>{copy.table.created}</TableCell>
                    <TableCell>{copy.table.modules}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <CircleIcon fontSize="small" sx={{ color: row.isActive ? "success.main" : "action.disabled" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.username}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>
                        <Chip label={localizeRole(row.role)} color={getRoleColor(row.role)} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.isActive ? copy.table.active : copy.table.inactive} color={row.isActive ? "success" : "default"} size="small" />
                      </TableCell>
                      <TableCell>
                        {row.society ? (
                          <Stack>
                            <Typography variant="caption">{row.society.name}</Typography>
                          </Stack>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(row.createdAt, locale)}</TableCell>
                      <TableCell>
                        {row.allowedModuleSlugs && row.allowedModuleSlugs.length > 0 ? (
                          <Chip label={copy.table.modulesCount.replace("{{count}}", String(row.allowedModuleSlugs.length))} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            {copy.table.none}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              labelRowsPerPage={copy.pagination.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                copy.pagination.displayedRows.replace("{{from}}", String(from)).replace("{{to}}", String(to)).replace("{{count}}", String(count))
              }
              getItemAriaLabel={(buttonType) => buttonType === "next" ? copy.pagination.nextPage : copy.pagination.previousPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
