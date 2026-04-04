"use client";

import React from "react";
import {
  Avatar,
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
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import { alpha } from "@mui/material/styles";

type ShareholdingAdminDrawerProps = {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: (v: any) => void;
  onSave: () => void;
  agents: any[];
  mode: "create" | "edit";
};

const FieldLabel = ({ children, color = "primary.main" }: { children: React.ReactNode; color?: string }) => (
  <Typography variant="caption" sx={{ fontWeight: 1000, color, letterSpacing: "0.1em", mb: 2, display: "block" }}>
    {String(children).toUpperCase()}
  </Typography>
);

export function ShareholdingAdminDrawer({
  open,
  onClose,
  form,
  setForm,
  onSave,
  agents,
  mode,
}: ShareholdingAdminDrawerProps) {
  const calculateTotal = (shares: number, nominal: number) => {
    setForm({ ...form, totalShares: shares, nominalVal: nominal, totalValue: shares * nominal });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 550 }, borderRadius: "24px 0 0 24px" },
      }}
    >
      <Box sx={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#10b981", 0.03), borderBottom: "1px solid rgba(16, 185, 129, 0.1)", position: "relative" }}>
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16, color: "#64748b" }}>
            <CloseRoundedIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "#10b981", width: 56, height: 56, mb: 2, boxShadow: "0 8px 16px -4px rgba(16, 185, 129, 0.4)" }}>
            <GroupsRoundedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
            {mode === "edit" ? "Modify Agent Equity" : "Allot Institutional Shares"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage agent shareholding certificates and capital allotments.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <FieldLabel>Beneficiary Agent</FieldLabel>
              <TextField select fullWidth label="Select Operative" value={form.agentId || ""} onChange={(e) => setForm({ ...form, agentId: e.target.value, agentName: agents.find(a => a.id === e.target.value)?.firstName })}>
                {agents.map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.code})</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <FieldLabel color="secondary.main">Equity Valuation</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type="number" label="Total Shares" value={form.totalShares} onChange={(e) => calculateTotal(Number(e.target.value), form.nominalVal)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type="number" label="Nominal Value (₹)" value={form.nominalVal} onChange={(e) => calculateTotal(form.totalShares, Number(e.target.value))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Computed Evaluation (₹)" value={form.totalValue} InputProps={{ readOnly: true, startAdornment: <AccountBalanceRoundedIcon fontSize="small" sx={{ mr: 1, color: "success.main" }} /> }} />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <FieldLabel color="text.secondary">Governance Compliance</FieldLabel>
              <Stack direction="row" spacing={2} alignItems="center">
                <VerifiedUserRoundedIcon sx={{ color: "primary.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Electronic Certificate Generation Enabled</Typography>
              </Stack>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onSave}
              sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}
            >
              {mode === "edit" ? "Commit Equity Changes" : "Allot Strategic Shares"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
