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
import { useLanguage } from "@/shared/i18n/language-provider";
import { getPlanCatalogueCopy } from "@/shared/i18n/plan-catalogue-copy";
import type { AppLocale } from "@/shared/i18n/translations";

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
  const { locale } = useLanguage();
  const copy = getPlanCatalogueCopy(locale);
  const localeTag = locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";

  function formatLocalizedValue(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(localeTag, options).format(value);
  }

  function getCategoryLabel(value: string, fallbackLabel: string) {
    return copy.categories[value] ?? fallbackLabel;
  }

  function getCategoryAliases(value: string, fallbackLabel: string) {
    const locales: AppLocale[] = ["en", "hi", "mr"];
    const aliases = locales
      .map((entryLocale) => getPlanCatalogueCopy(entryLocale).categories[value])
      .filter(Boolean);

    if (fallbackLabel) {
      aliases.push(fallbackLabel);
    }

    return Array.from(new Set(aliases.map((entry) => entry.trim().toLowerCase())));
  }

  function getLocalizedPlanName(plan: any) {
    const localizedCategoryLabel = getCategoryLabel(plan.category, plan.planName);
    const planName = String(plan.planName ?? "").trim();

    if (!planName) {
      return localizedCategoryLabel;
    }

    const knownCategoryLabels = getCategoryAliases(plan.category, planName);
    if (knownCategoryLabels.includes(planName.toLowerCase())) {
      return localizedCategoryLabel;
    }

    return planName;
  }

  const planRows = plans.filter((plan) => {
    const matchesTab = plan.category === planTab;
    const searchText = planSearch.trim().toLowerCase();
    const localizedPlanName = getLocalizedPlanName(plan).toLowerCase();
    const localizedCategory = getCategoryLabel(plan.category, plan.planName).toLowerCase();
    const matchesSearch =
      searchText.length === 0 ||
      localizedPlanName.includes(searchText) ||
      localizedCategory.includes(searchText) ||
      String(plan.planName ?? "").toLowerCase().includes(searchText) ||
      String(plan.planCode ?? "").toLowerCase().includes(searchText);
    return matchesTab && matchesSearch;
  });

  const metrics = [
    { label: copy.metrics.activePlans.label, value: formatLocalizedValue(planRows.length), caption: copy.metrics.activePlans.caption },
    { label: copy.metrics.pendingSetup.label, value: formatLocalizedValue(0), caption: copy.metrics.pendingSetup.caption },
    { label: copy.metrics.productYield.label, value: `${formatLocalizedValue(12.5, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, caption: copy.metrics.productYield.caption },
    { label: copy.metrics.riskExposure.label, value: copy.metrics.riskExposure.value, caption: copy.metrics.riskExposure.caption }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<ArticleRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
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
                  {getCategoryLabel(opt.value, opt.label)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              value={planSearch}
              onChange={(event) => setPlanSearch(event.target.value)}
              placeholder={copy.hero.searchPlaceholder}
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
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
                borderRadius: 1,
                px: 3,
                height: 40,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(255,255,255,0.4)",
                "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 6px 20px rgba(255,255,255,0.25)" }
              }}
            >
              {copy.hero.createPlan}
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

      <Paper elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table sx={{ minWidth: 900, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                {[
                  { label: copy.table.planDetails, width: "30%", align: "left" },
                  { label: copy.table.requirements, width: "15%", align: "right" },
                  { label: copy.table.tenureScope, width: "20%", align: "left" },
                  { label: copy.table.returnsApr, width: "15%", align: "right" },
                  { label: copy.table.benefits, width: "15%", align: "left" },
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
                      {copy.table.emptyState}
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
                            {getLocalizedPlanName(plan)}
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
                        {plan.seniorCitizenMargin
                          ? copy.table.seniorBonus.replace("{{value}}", formatLocalizedValue(plan.seniorCitizenMargin))
                          : "-"}
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
