"use client";

import { useEffect, useMemo, useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
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
import {
  getUserDirectory,
  type UserDirectoryEntry
} from "@/shared/api/users";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type UserDirectoryWorkspaceProps = {
  token: string;
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
}

export function UserDirectoryWorkspace({ token }: UserDirectoryWorkspaceProps) {
  const theme = useTheme();
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
      const msg = caught instanceof Error ? caught.message : "Unable to load user directory.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();
  }, [token]);

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
      { label: "Total Users", value: String(total), caption: "All users in the system." },
      { label: "Active", value: String(active), caption: "Active user accounts." },
      { label: "Inactive", value: String(inactive), caption: "Inactive accounts." },
      { label: "Roles", value: String(roles), caption: "Number of different roles." }
    ];
  }, [rows]);

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

  return (
    <Box>
      <SectionHero 
        icon={<PeopleRoundedIcon sx={{ fontSize: 40 }} />}
        eyebrow="Access Management"
        title="User Directory" 
        description="View all users and their roles with detailed information." 
      />
      
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
            placeholder="Search by username, name, or role..."
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
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void loadRows()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : paginatedRows.length === 0 ? (
          <TableEmpty colSpan={5} label={search ? "No users found matching your search" : "No users found"} />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell width="5%"></TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Modules</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <CircleIcon
                          fontSize="small"
                          sx={{
                            color: row.isActive ? "success.main" : "action.disabled"
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.username}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.role}
                          color={getRoleColor(row.role)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.isActive ? "Active" : "Inactive"}
                          color={row.isActive ? "success" : "default"}
                          size="small"
                        />
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
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell>
                        {row.allowedModuleSlugs && row.allowedModuleSlugs.length > 0 ? (
                          <Chip
                            label={`${row.allowedModuleSlugs.length} modules`}
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            None
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
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
