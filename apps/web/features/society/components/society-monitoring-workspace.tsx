"use client";

import { useEffect, useMemo, useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
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
      <SectionHero 
        icon={<AnalyticsRoundedIcon sx={{ fontSize: 40 }} />}
        eyebrow="Operational Insights"
        title="Society Monitoring" 
        description="Monitor all societies and their operational status." 
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
                      <TableCell>{society.registrationNumber || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={society.subscriptionPlan || "FREE"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={society.subscriptionStatus || "INACTIVE"}
                          color={
                            society.subscriptionStatus === "ACTIVE"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        -
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
    </Box>
  );
}
