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
  InputAdornment,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import { alpha } from "@mui/material/styles";
import { UserAccessSelector } from "../../user-access-selector";

type UserProvisioningDrawerProps = {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: (v: any) => void;
  onSave: () => void;
  loading: boolean;
  branches: any[];
  agents: any[];
  updateStaffName: (v: string) => void;
};

const FieldLabel = ({ children, color = "primary.main" }: { children: React.ReactNode; color?: string }) => (
  <Typography variant="caption" sx={{ fontWeight: 1000, color, letterSpacing: "0.1em", mb: 2, display: "block" }}>
    {String(children).toUpperCase()}
  </Typography>
);

export function UserProvisioningDrawer({
  open,
  onClose,
  form,
  setForm,
  onSave,
  loading,
  branches,
  agents,
  updateStaffName,
}: UserProvisioningDrawerProps) {
  const accountType = form.role === "SUPER_USER" ? "SOCIETY" : form.role;
  const accountLabel = form.role === "SUPER_USER" ? "Society Staff" : form.role;

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
        <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#0f172a", 0.03), borderBottom: "1px solid rgba(15, 23, 42, 0.1)", position: "relative" }}>
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16, color: "#64748b" }}>
            <CloseRoundedIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "#0f172a", width: 56, height: 56, mb: 2, boxShadow: "0 8px 16px -4px rgba(15, 23, 42, 0.4)" }}>
            <BadgeRoundedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
            Provision Institutional Identity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new operative or administrative account with role-safe defaults.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <FieldLabel>Personal Details</FieldLabel>
              <TextField fullWidth label="Full Name" value={form.fullName} onChange={(e) => updateStaffName(e.target.value)} />
            </Box>

            <Box>
              <FieldLabel color="secondary.main">Role & Location</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    select 
                    fullWidth 
                    label="Role" 
                    value={form.role} 
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <MenuItem value="SUPER_USER">Administrator / Staff</MenuItem>
                    <MenuItem value="AGENT">Field Agent</MenuItem>
                    <MenuItem value="CLIENT">Member Client</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField select fullWidth label="Branch" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                    {branches.map((b) => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <FieldLabel color="text.secondary">Auth Credentials</FieldLabel>
              <Stack spacing={2}>
                <TextField 
                  fullWidth 
                  label="Username" 
                  value={form.username} 
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><VerifiedUserRoundedIcon fontSize="small" color="primary" /></InputAdornment> }} 
                  helperText="Generated automatically"
                />
                <TextField 
                  fullWidth 
                  label="Login Password" 
                  value={form.password} 
                  InputProps={{ endAdornment: <IconButton size="small" onClick={() => setForm({ ...form, password: Math.random().toString(36).slice(-8) })}><KeyRoundedIcon fontSize="small" /></IconButton> }} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Stack>
            </Box>

            <UserAccessSelector
              accountType={accountType}
              value={form.allowedModuleSlugs || []}
              onChange={(next) => setForm({ ...form, allowedModuleSlugs: next })}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={onSave}
              sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}
            >
              Provision {accountLabel} Account
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
