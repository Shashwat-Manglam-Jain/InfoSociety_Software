"use client";

import React from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";
import { 
  PlanRecord, 
  PlanCategory,
  planCategoryOptions,
  getNextPlanCode 
} from "../../../lib/society-operations-data";

type PlanDrawerProps = {
  open: boolean;
  onClose: () => void;
  planForm: PlanRecord;
  setPlanForm: React.Dispatch<React.SetStateAction<PlanRecord>>;
  editingPlanId: string | null;
  onSave: () => void;
  allPlans: PlanRecord[];
};

const FieldLabel = ({ children, color = "primary.main" }: { children: React.ReactNode; color?: string }) => (
  <Typography variant="caption" sx={{ fontWeight: 1000, color, letterSpacing: "0.1em", mb: 2, display: "block" }}>
    {String(children).toUpperCase()}
  </Typography>
);

export function PlanDrawer({
  open,
  onClose,
  planForm,
  setPlanForm,
  editingPlanId,
  onSave,
  allPlans,
}: PlanDrawerProps) {
  const isInvalid = !planForm.planName || !planForm.category;

  const updateCategory = (cat: string) => {
    const planCat = cat as PlanCategory;
    setPlanForm((prev: PlanRecord) => ({
      ...prev,
      category: planCat,
      planCode: getNextPlanCode(allPlans, planCat),
    }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 600 },
          borderRadius: "24px 0 0 24px",
          bgcolor: "background.paper"
        },
      }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            p: 4,
            pb: 5,
            bgcolor: alpha("#3b82f6", 0.02),
            borderBottom: "1px solid rgba(59, 130, 246, 0.08)",
            position: "relative",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 16, color: "text.secondary" }}
          >
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
            {editingPlanId ? "Update Plan Configuration" : "New Financial Product Configuration"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure institutional product parameters for deposits or loans.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <FieldLabel>Product Identity</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    label="Plan Name"
                    value={planForm.planName}
                    onChange={(e) => setPlanForm((prev: PlanRecord) => ({ ...prev, planName: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Plan Code"
                    value={planForm.planCode}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Product Category"
                    value={planForm.category}
                    onChange={(e) => updateCategory(e.target.value)}
                  >
                    {planCategoryOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel color="secondary.main">Yield & Tenure Matrix</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Interest Rate (%)"
                    value={planForm.interestRate}
                    onChange={(e) => setPlanForm((prev: PlanRecord) => ({ ...prev, interestRate: Number(e.target.value) }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Duration (Months)"
                    value={planForm.durationMonths}
                    onChange={(e) => setPlanForm((prev: PlanRecord) => ({ ...prev, durationMonths: Number(e.target.value) }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Min Amount"
                    value={planForm.minAmount}
                    onChange={(e) => setPlanForm((prev: PlanRecord) => ({ ...prev, minAmount: Number(e.target.value) }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Max Amount"
                    value={planForm.maxAmount}
                    onChange={(e) => setPlanForm((prev: PlanRecord) => ({ ...prev, maxAmount: Number(e.target.value) }))}
                  />
                </Grid>
              </Grid>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={isInvalid}
              onClick={onSave}
              sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}
            >
              {editingPlanId ? "Commit Plan Changes" : "Deploy New Product Plan"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
