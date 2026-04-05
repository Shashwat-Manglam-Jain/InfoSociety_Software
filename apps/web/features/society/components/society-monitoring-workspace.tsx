"use client";

import { useEffect, useMemo, useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { getMonitoringOverview, type MonitoringOverview } from "@/shared/api/monitoring";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { toast } from "@/shared/ui/toast";

type SocietyMonitoringWorkspaceProps = {
  token: string;
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function SocietyMonitoringWorkspace({ token }: SocietyMonitoringWorkspaceProps) {
  const theme = useTheme();
  const [data, setData] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const result = await getMonitoringOverview(token);
      setData(result);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Unable to load monitoring data.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  const metrics = useMemo(() => {
    if (!data) return [];

    const totalSocieties = data.societies?.length || 0;
    const activeSocieties = data.societies?.filter((s) => s.isActive).length || 0;
    const pendingSocieties = data.societies?.filter((s) => s.status === "PENDING").length || 0;

    return [
      { label: "Total Societies", value: String(totalSocieties), caption: "Registered societies in system." },
      { label: "Active", value: String(activeSocieties), caption: "Active societies." },
      { label: "Pending", value: String(pendingSocieties), caption: "Pending approval." },
      { label: "Systems", value: String(data.societies?.length || 0), caption: "Live systems." }
    ];
  }, [data]);

  const getStatusColor = (status: string): "primary" | "secondary" | "success" | "error" | "warning" | "info" | "default" => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "warning";
      case "SUSPENDED":
        return "error";
      case "CLOSED":
        return "default";
      default:
        return "info";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <SectionHero title="Society Monitoring" description="Monitor all societies and their operational status." />
      
      <Box sx={{ px: 2, py: 3 }}>
        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
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

      <Box sx={{ px: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void loadData()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Societies Overview
          </Typography>

          {data?.societies && data.societies.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell width="5%"></TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Subscription Plan</TableCell>
                    <TableCell>Subscription Status</TableCell>
                    <TableCell>Since</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.societies.map((society) => (
                    <TableRow key={society.id} hover>
                      <TableCell>
                        <CircleIcon
                          fontSize="small"
                          sx={{
                            color: society.isActive ? "success.main" : "action.disabled"
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {society.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{society.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={society.status}
                          color={getStatusColor(society.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{society.category || "-"}</TableCell>
                      <TableCell>{society.class || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={society.subscription?.plan || "FREE"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={society.subscription?.status || "INACTIVE"}
                          color={
                            society.subscription?.status === "ACTIVE"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(society.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No societies found</Alert>
          )}
        </Box>
      </Paper>

      {data?.systemHealth && (
        <Paper sx={{ mx: 2, mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              System Health
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography color="textSecondary" variant="caption">
                        Uptime
                      </Typography>
                      <Typography variant="h5">
                        {((data.systemHealth.uptime || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography color="textSecondary" variant="caption">
                        API Response Time
                      </Typography>
                      <Typography variant="h5">
                        {data.systemHealth.avgResponseTime || 0}ms
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography color="textSecondary" variant="caption">
                        Database Status
                      </Typography>
                      <Chip
                        label={data.systemHealth.databaseStatus || "OK"}
                        color={data.systemHealth.databaseStatus === "OK" ? "success" : "error"}
                        size="small"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography color="textSecondary" variant="caption">
                        Active Sessions
                      </Typography>
                      <Typography variant="h5">
                        {data.systemHealth.activeSessions || 0}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {data?.provisionedSuperAdmins && data.provisionedSuperAdmins.length > 0 && (
        <Paper sx={{ mx: 2, mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <SecurityRoundedIcon /> Provisioned Super Admins
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Username</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Society</TableCell>
                    <TableCell>Password Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.provisionedSuperAdmins.map((admin, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {admin.username}
                        </Typography>
                      </TableCell>
                      <TableCell>{admin.fullName}</TableCell>
                      <TableCell>{admin.society?.name || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={admin.requiresPasswordChange ? "Change Required" : "Set"}
                          color={admin.requiresPasswordChange ? "warning" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(admin.createdAt || "")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
