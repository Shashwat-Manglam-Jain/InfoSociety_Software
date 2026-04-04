"use client";

import React from "react";
import { 
  Box, 
  Button, 
  Chip, 
  Paper, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  MenuItem,
  Typography,
  Grid
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { SectionHero } from "./SectionHero";
import { MetricCard } from "./MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type PlanCatalogueProps = {
  plans: any[];
  planSearch: string;
  setPlanSearch: (v: string) => void;
  planTab: string;
  setPlanTab: (v: any) => void;
  planCategoryOptions: any[];
  openCreatePlanDrawer: () => void;
  openPlanDrawer: (plan: any) => void;
  formatCurrency: (v: number) => string;
};

export function PlanCatalogue({
  plans,
  planSearch,
  setPlanSearch,
  planTab,
  setPlanTab,
  planCategoryOptions,
  openCreatePlanDrawer,
  openPlanDrawer,
  formatCurrency
}: PlanCatalogueProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const planRows = plans.filter((plan) => {
    const matchesTab = plan.category === planTab;
    const matchesSearch = 
      plan.planName.toLowerCase().includes(planSearch.toLowerCase()) || 
      plan.planCode.toLowerCase().includes(planSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const metrics = [
    { label: "Active Plans", value: String(planRows.length), caption: "Verified institutional products." },
    { label: "Pending Setup", value: "0", caption: "Draft templates requiring activation." },
    { label: "Product Yield", value: "12.5%", caption: "Average institutional return." },
    { label: "Risk Exposure", value: "Low", caption: "Institutional liability healthy." }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<ArticleRoundedIcon />}
        eyebrow="Plan"
        title="Plan Catalogue"
        description="Categorize and manage institutional deposit and loan plans, including interest rates and tenure configurations."
        colorScheme="emerald"
        actions={
          <>
            <TextField
              select
              size="small"
              value={planTab}
              onChange={(e) => setPlanTab(e.target.value)}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: surfaces.input,
                  color: "#fff",
                  border: `1px solid ${surfaces.inputBorder}`
                }
              }}
            >
              {planCategoryOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              value={planSearch}
              onChange={(event) => setPlanSearch(event.target.value)}
              placeholder="Search catalogue..."
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
              onClick={openCreatePlanDrawer}
              sx={{
                bgcolor: "#fff",
                color: "#0f172a",
                borderRadius: 3,
                px: 3,
                height: 40,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(255,255,255,0.4)",
                "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 6px 20px rgba(255,255,255,0.25)" }
              }}
            >
              Create Plan
            </Button>
          </>
        }
      />

      <Grid container spacing={4}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 900, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  { label: "Plan Details", width: "30%", align: "left" },
                  { label: "Requirements", width: "15%", align: "right" },
                  { label: "Tenure Scope", width: "20%", align: "left" },
                  { label: "Returns (APR)", width: "15%", align: "right" },
                  { label: "Benefits", width: "15%", align: "left" },
                  { label: "", width: "5%", align: "right" }
                ].map((col, idx) => (
                  <TableCell key={idx} align={col.align as any} sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: col.width, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {planRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", opacity: 0.7 }}>
                      No plans matched the selected category and search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                planRows.map((plan) => (
                  <TableRow 
                    key={plan.id} 
                    hover 
                    onClick={() => openPlanDrawer(plan)}
                    sx={{ 
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                            {plan.planName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mt: 0.2 }}>
                            {plan.planCode}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {formatCurrency(plan.minAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {plan.tenure}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${plan.interestRate}%`}
                        sx={{
                          height: 22,
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          bgcolor: alpha(DESIGN_SYSTEM.COLORS.emerald, 0.1),
                          color: DESIGN_SYSTEM.COLORS.emerald,
                          border: `1px solid ${alpha(DESIGN_SYSTEM.COLORS.emerald, 0.2)}`
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                        {plan.seniorCitizenMargin ? `+${plan.seniorCitizenMargin}% Senior` : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); openPlanDrawer(plan); }}
                        sx={{
                          minWidth: "auto",
                          p: 1,
                          color: "text.secondary",
                          "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) }
                        }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </Button>
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
