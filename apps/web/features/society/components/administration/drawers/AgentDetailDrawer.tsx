"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { alpha } from "@mui/material/styles";

type AgentDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  agent: any;
  onSave: (agent: any) => void;
};

export function AgentDetailDrawer({
  open,
  onClose,
  agent,
  onSave,
}: AgentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "docs" | "accounts" | "loans">("basic");
  const [form, setForm] = useState(agent || {});

  React.useEffect(() => {
    if (agent) setForm(agent);
  }, [agent]);

  if (!agent) return null;

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "docs", label: "Documents" },
    { id: "accounts", label: "Accounts Info" },
    { id: "loans", label: "Loan Account Info" },
  ] as const;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 700 }, borderRadius: "24px 0 0 24px" },
      }}
    >
      <Box sx={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 4, pb: 4, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16, color: "#fff", opacity: 0.6 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)" }}>
            <BadgeRoundedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {form.firstName} {form.lastName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>
            AGENT ID: {form.code || form.id?.slice(-8).toUpperCase()}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                size="small"
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  bgcolor: activeTab === tab.id ? "rgba(255,255,255,0.15)" : "transparent",
                  color: "#fff",
                  fontWeight: 900,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          {activeTab === "basic" && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Branch" value={form.branch?.name || ""} InputProps={{ readOnly: true }} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth label="Gender" value={form.gender || "MALE"} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone No" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="Status" value={form.isActive !== false ? "Active" : "Inactive"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "Active" })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Button variant="contained" fullWidth size="large" onClick={() => onSave(form)} sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a" }}>Save Changes</Button>
              </Grid>
            </Grid>
          )}

          {activeTab === "docs" && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Institutional Documents</Typography>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, border: "2px dashed #e2e8f0", textAlign: "center" }}>
                <CloudUploadRoundedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Upload KYC Document</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>SVG, PNG, JPG or PDF (max. 5MB)</Typography>
                <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a" }}>Select File</Button>
              </Paper>
            </Box>
          )}

          {activeTab === "accounts" && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Operational Accounts</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900 }}>Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No active accounts.</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
