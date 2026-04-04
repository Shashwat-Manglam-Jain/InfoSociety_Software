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
  Tab, 
  Tabs,
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

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <Tabs
          value={planTab}
          onChange={(_, value) => setPlanTab(value)}
          sx={{ 
            px: 3, 
            borderBottom: `1px solid ${surfaces.tableBorder}`,
            "& .MuiTab-root": { fontWeight: 900, py: 2.5, transition: "all 0.2s" }
          }}
        >
          {planCategoryOptions.map((opt) => (
            <Tab key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Tabs>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  "Plan Code",
                  "Plan Name",
                  "Min Amount",
                  "Tenure Scope",
                  "Rate (APR)",
                  "Sr. Benefit",
                  "Actions"
                ].map((label, idx) => (
                  <TableCell key={label} align={idx === 2 || idx === 4 || idx === 6 ? "right" : "left"} sx={{ fontWeight: 900, py: 2.5, borderBottom: `1px solid ${surfaces.tableBorder}` }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {planRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 12 }}>
                    <Typography variant="body2" color="text.secondary">No plans matched the selected category and search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                planRows.map((plan) => (
                  <TableRow key={plan.id} hover sx={{ cursor: "pointer" }} onClick={() => openPlanDrawer(plan)}>
                    <TableCell>
                      <Chip label={plan.planCode} size="small" sx={{ fontWeight: 800, borderRadius: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, border: "none" }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>{plan.planName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(plan.minAmount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{plan.tenure}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main" }}>{plan.interestRate}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{plan.seniorCitizenMargin ? `${plan.seniorCitizenMargin}% additional` : "-"}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={(e) => { e.stopPropagation(); openPlanDrawer(plan); }}>
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
