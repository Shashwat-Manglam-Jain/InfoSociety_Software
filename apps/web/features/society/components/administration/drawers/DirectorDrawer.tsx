"use client";

import React from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";

type DirectorDrawerProps = {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: (v: any) => void;
  onSave: () => void;
  loading: boolean;
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", mt: 2, display: "block", mb: 1 }}>
    {String(children).toUpperCase()}
  </Typography>
);

export function DirectorDrawer({
  open,
  onClose,
  form,
  setForm,
  onSave,
  loading,
}: DirectorDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 600, md: 800 }, borderRadius: "24px 0 0 24px" },
      }}
    >
      <Box sx={{ p: 4, height: "100%", overflowY: "auto" }}>
        <Stack spacing={3}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Director Identification & Governance
            </Typography>
            <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
          </Box>

          <FieldLabel>Core Identity & DIN</FieldLabel>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="DIN (Director ID)" value={form.din} onChange={(e) => setForm({ ...form, din: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <FieldLabel>Contact & Legal</FieldLabel>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Mobile Number" value={form.mobileNo} onChange={(e) => setForm({ ...form, mobileNo: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="PAN Number" value={form.panNo} onChange={(e) => setForm({ ...form, panNo: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Aadhar Number" value={form.aadharNo} onChange={(e) => setForm({ ...form, aadharNo: e.target.value })} /></Grid>
          </Grid>

          <FieldLabel>Appointment Philosophy</FieldLabel>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Appointment Date" InputLabelProps={{ shrink: true }} value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Resignation Date" InputLabelProps={{ shrink: true }} value={form.resignationDate} onChange={(e) => setForm({ ...form, resignationDate: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 12 }}>
               <FormControlLabel control={<Switch checked={form.isAuthorizedSignatory} onChange={(e) => setForm({ ...form, isAuthorizedSignatory: e.target.checked })} />} label="Authorized Signatory" />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onSave}
            disabled={loading}
            sx={{ py: 2, mt: 4, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : form.id ? "Update Governance Record" : "Appoint Director"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
