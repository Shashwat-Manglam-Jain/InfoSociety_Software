"use client";

import {
  Avatar,
  Box,
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
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getFieldOperativesCopy } from "@/shared/i18n/field-operatives-copy";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { SocietyAgentRow } from "../../lib/society-admin-dashboard";

export type FieldOperativesProps = {
  agents: SocietyAgentRow[];
  agentSearch: string;
  setAgentSearch: (value: string) => void;
  agentPage: number;
  setAgentPage: (value: number) => void;
  agentRowsPerPage: number;
  setAgentRowsPerPage: (value: number) => void;
  handleOpenDrawer: (type: "agent") => void;
  setEditingAgent: (agent: SocietyAgentRow) => void;
};

export function FieldOperatives({
  agents,
  agentSearch,
  setAgentSearch,
  agentPage,
  setAgentPage,
  agentRowsPerPage,
  setAgentRowsPerPage,
  handleOpenDrawer,
  setEditingAgent
}: FieldOperativesProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getFieldOperativesCopy(locale);
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const filteredAgents = agents.filter((agent) => {
    const query = agentSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [agent.fullName, agent.customerCode, agent.username, agent.branch?.name ?? ""].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  const paginatedAgents = filteredAgents.slice(agentPage * agentRowsPerPage, agentPage * agentRowsPerPage + agentRowsPerPage);
  const totalDailyCollection = agents.reduce((total, agent) => total + agent.dailyCollection, 0);
  const totalMonthlyCollection = agents.reduce((total, agent) => total + agent.monthlyCollection, 0);

  const metrics = [
    { label: copy.metrics.agents.label, value: String(agents.length), caption: copy.metrics.agents.caption },
    {
      label: copy.metrics.active.label,
      value: String(agents.filter((agent) => agent.isActive).length),
      caption: copy.metrics.active.caption
    },
    {
      label: copy.metrics.today.label,
      value: `INR ${Math.round(totalDailyCollection).toLocaleString("en-IN")}`,
      caption: copy.metrics.today.caption
    },
    {
      label: copy.metrics.month.label,
      value: `INR ${Math.round(totalMonthlyCollection).toLocaleString("en-IN")}`,
      caption: copy.metrics.month.caption
    }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<BadgeRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={agentSearch}
              onChange={(event) => setAgentSearch(event.target.value)}
              placeholder={copy.hero.searchPlaceholder}
              sx={{
                minWidth: { xs: "100%", sm: 240 },
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
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1RoundedIcon />}
              onClick={() => handleOpenDrawer("agent")}
              sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 800, "&:hover": { bgcolor: "#f8fafc" } }}
            >
              {copy.hero.addAgent}
            </Button>
          </>
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

      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 1.5, 
          border: `1px solid ${surfaces.border}`, 
          overflow: "hidden", 
          bgcolor: surfaces.paper,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "30%", py: 2 }}>{copy.table.agentDetails}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "18%" }}>{copy.table.identity}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "20%" }}>{copy.table.assignment}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "12%" }}>
                  {copy.table.daily}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "12%" }}>
                  {copy.table.monthly}
                </TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: "10%" }}>{copy.table.status}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", opacity: 0.7 }}>
                      {copy.emptyState}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAgents.map((agent) => (
                  <TableRow 
                    key={agent.id} 
                    hover 
                    sx={{ 
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 900,
                            fontSize: "0.9rem",
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}
                        >
                          {agent.fullName?.[0] ?? copy.values.defaultAvatar}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                            {agent.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mt: 0.2 }}>
                            @{agent.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {agent.customerCode}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        {copy.values.activeModules.replace("{{count}}", String(agent.allowedModuleSlugs.length))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {agent.branch?.name ?? copy.values.mainSociety}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        {copy.values.branchId.replace("{{code}}", agent.branch?.code ?? "HO-001")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                        ₹{Math.round(agent.dailyCollection).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900, color: "text.primary" }}>
                        ₹{Math.round(agent.monthlyCollection).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={agent.isActive ? copy.values.online : copy.values.locked}
                          sx={{
                            height: 22,
                            fontWeight: 800,
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                            bgcolor: agent.isActive ? alpha("#10b981", 0.1) : alpha("#64748b", 0.08),
                            color: agent.isActive ? "#059669" : "#475569",
                            border: `1px solid ${agent.isActive ? alpha("#10b981", 0.1) : alpha("#64748b", 0.1)}`
                          }}
                        />
                        <Tooltip title={copy.values.manageProfile}>
                          <IconButton 
                            size="small" 
                            onClick={() => setEditingAgent(agent)} 
                            sx={{ 
                              color: "text.secondary",
                              "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) }
                            }}
                          >
                            <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
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
          count={filteredAgents.length}
          page={agentPage}
          onPageChange={(_, page) => setAgentPage(page)}
          rowsPerPage={agentRowsPerPage}
          onRowsPerPageChange={(event) => {
            setAgentRowsPerPage(parseInt(event.target.value, 10));
            setAgentPage(0);
          }}
          labelRowsPerPage={copy.pagination.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            copy.pagination.displayedRows
              .replace("{{from}}", String(from))
              .replace("{{to}}", String(to))
              .replace("{{count}}", String(count))
          }
          sx={{
            borderTop: `1px solid ${surfaces.border}`,
            ".MuiTablePagination-toolbar": { minHeight: 48 },
            ".MuiTypography-root": { fontWeight: 600, fontSize: "0.75rem" }
          }}
        />
      </Paper>
    </Stack>
  );
}
