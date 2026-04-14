"use client";

import { useEffect, useMemo, useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
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
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSocietyMonitoringWorkspaceCopy } from "@/shared/i18n/society-monitoring-workspace-copy";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { toast } from "@/shared/ui/toast";
import type { MonitoringOverview } from "@/shared/types";

type SocietyMonitoringWorkspaceProps = {
  token: string;
};

export function SocietyMonitoringWorkspace({ token }: SocietyMonitoringWorkspaceProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getSocietyMonitoringWorkspaceCopy(locale);
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
      const msg = caught instanceof Error ? caught.message : copy.errors.loadFailed;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [token, copy.errors.loadFailed]);

  const metrics = useMemo(() => {
    if (!data) return [];

    const totalSocieties = data.societies?.length || 0;
    const activeSocieties = data.societies?.filter((s: { isActive: boolean }) => s.isActive).length || 0;
    const pendingSocieties = data.societies?.filter((s: { status: string }) => s.status === "PENDING").length || 0;

    return [
      { label: copy.metrics.totalSocieties.label, value: String(totalSocieties), caption: copy.metrics.totalSocieties.caption },
      { label: copy.metrics.active.label, value: String(activeSocieties), caption: copy.metrics.active.caption },
      { label: copy.metrics.pending.label, value: String(pendingSocieties), caption: copy.metrics.pending.caption },
      { label: copy.metrics.systems.label, value: String(data.societies?.length || 0), caption: copy.metrics.systems.caption }
    ];
  }, [data, copy]);

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

  function localizeStatus(status: string) {
    return copy.statuses[status] ?? status;
  }

  function localizeSubscriptionStatus(status?: string | null) {
    if (!status) return copy.subscriptionStatuses.INACTIVE;
    return copy.subscriptionStatuses[status] ?? status;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <SectionHero icon={<SecurityRoundedIcon />} eyebrow={copy.hero.eyebrow} title={copy.hero.title} description={copy.hero.description} />

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
        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadData()} disabled={loading}>
          {copy.actions.refresh}
        </Button>
      </Box>

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {copy.sections.societiesOverview}
          </Typography>

          {data?.societies && data.societies.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell width="5%"></TableCell>
                    <TableCell>{copy.table.code}</TableCell>
                    <TableCell>{copy.table.name}</TableCell>
                    <TableCell>{copy.table.status}</TableCell>
                    <TableCell>{copy.table.category}</TableCell>
                    <TableCell>{copy.table.registrationState}</TableCell>
                    <TableCell>{copy.table.subscriptionPlan}</TableCell>
                    <TableCell>{copy.table.subscriptionStatus}</TableCell>
                    <TableCell>{copy.table.digitalPayments}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.societies.map((society) => (
                    <TableRow key={society.id} hover>
                      <TableCell>
                        <CircleIcon fontSize="small" sx={{ color: society.isActive ? "success.main" : "action.disabled" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {society.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{society.name}</TableCell>
                      <TableCell>
                        <Chip label={localizeStatus(society.status)} color={getStatusColor(society.status)} size="small" />
                      </TableCell>
                      <TableCell>{society.category || "-"}</TableCell>
                      <TableCell>{society.registrationState || "-"}</TableCell>
                      <TableCell>
                        <Chip label={society.subscriptionPlan || "FREE"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={localizeSubscriptionStatus(society.subscriptionStatus || "INACTIVE")}
                          color={society.subscriptionStatus === "ACTIVE" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={society.acceptsDigitalPayments ? copy.table.enabled : copy.table.disabled}
                          color={society.acceptsDigitalPayments ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">{copy.table.noSocieties}</Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
