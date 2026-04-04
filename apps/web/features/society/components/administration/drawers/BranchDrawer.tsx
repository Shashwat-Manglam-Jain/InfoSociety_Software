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
  Switch,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import { alpha } from "@mui/material/styles";

type BranchDrawerProps = {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: (v: any) => void;
  onSave: () => void;
  loading: boolean;
};

const FieldLabel = ({ children, color = "primary.main" }: { children: React.ReactNode; color?: string }) => (
  <Typography variant="caption" sx={{ fontWeight: 1000, color, letterSpacing: "0.1em", display: "block", mb: 2 }}>
    {String(children).toUpperCase()}
  </Typography>
);

export function BranchDrawer({
  open,
  onClose,
  form,
  setForm,
  onSave,
  loading,
}: BranchDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 600 }, borderRadius: "24px 0 0 24px" },
      }}
    >
      <Box sx={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#0f172a", 0.03), borderBottom: "1px solid rgba(15, 23, 42, 0.1)", position: "relative" }}>
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16, color: "#64748b" }}>
            <CloseRoundedIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "#0f172a", width: 64, height: 64, mb: 2, boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.4)" }}>
            <AddLocationAltRoundedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
            Infrastructure Provisioning
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expand your geographical coverage or update existing entity attributes.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <FieldLabel>Core Identity</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    label="Legal Branch Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, code: e.target.value.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Entity Code"
                    value={form.code}
                    disabled
                    InputProps={{ startAdornment: <InputAdornment position="start"><InfoRoundedIcon fontSize="small" /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Operational Status"
                    value={String(form.isActive)}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                  >
                    <MenuItem value="true">Active & Operational</MenuItem>
                    <MenuItem value="false">Deactivated / Maintenance</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Activation Date"
                    value={form.openingDate}
                    onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel color="secondary.main">Contact Matrix</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Official Email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Matrix"
                    value={form.contactNo}
                    onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocalPhoneRoundedIcon fontSize="small" /></InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel color="success.main">Geographical Scope</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel color="#eb4432">Capabilities</FieldLabel>
              <Stack spacing={1}>
                {[
                  { label: "Secure Locker Vault", desc: "Physical asset security", field: "lockerFacility" },
                  { label: "NEFT/IMPS Portal", desc: "Digital fund transfer", field: "neftImpsService" },
                  { label: "Institutional HQ", desc: "Principal admin hub", field: "isHead" },
                ].map((cap) => (
                  <Paper key={cap.field} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{cap.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{cap.desc}</Typography>
                      </Box>
                      <Switch checked={form[cap.field]} onChange={(e) => setForm({ ...form, [cap.field]: e.target.checked })} />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={onSave}
              sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}
            >
              {form.id ? "Commit Architectural Changes" : "Deploy Infrastructure Entity"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
