"use client";

import React from "react";
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Stack, 
  TextField, 
  Typography, 
  Avatar, 
  IconButton, 
  InputAdornment, 
  MenuItem 
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import { SectionHero } from "../operations/SectionHero";

export type SocietyMasterProps = {
  societyForm: any;
  setSocietyForm: (v: any) => void;
  handleUpdateSociety: () => void;
  formLoading: boolean;
};

export function SocietyMaster({
  societyForm,
  setSocietyForm,
  handleUpdateSociety,
  formLoading
}: SocietyMasterProps) {
  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<BusinessRoundedIcon />}
        eyebrow="Institution"
        title="Corporate Pulse"
        description="Manage sovereign identity, constitutional details, and fiscal compliance identifiers."
        colorScheme="blue"
        actions={
          <Button 
            variant="contained" 
            sx={{ 
                bgcolor: "#fff", 
                color: "#0f172a", 
                borderRadius: 2.5, 
                fontWeight: 900,
                "&:hover": { bgcolor: "#f1f5f9" }
            }} 
            onClick={handleUpdateSociety} 
            disabled={formLoading}
          >
            Commit Integrity Updates
          </Button>
        }
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
            <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>VISUAL IDENTITY</Typography>
            <Stack spacing={4} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar src={societyForm.logoUrl} sx={{ width: 140, height: 140, borderRadius: 4, border: "4px solid #f8fafc", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                  <BusinessRoundedIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <IconButton size="small" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: "#fff", boxShadow: 1, "&:hover": { bgcolor: "#f1f5f9" } }}>
                  <CloudUploadRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>INSTITUTIONAL LOGO</Typography>

              <Box sx={{ position: 'relative' }}>
                <Avatar src={societyForm.faviconUrl} sx={{ width: 64, height: 64, borderRadius: 2, border: "2px solid #f8fafc" }}>
                  <LanguageRoundedIcon />
                </Avatar>
                <IconButton size="small" sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: "#fff", boxShadow: 1 }}>
                  <CloudUploadRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>MANIFEST FAVICON</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>CORPORATE ATTRIBUTES</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}><TextField fullWidth label="Full Legal Entity Name" value={societyForm.name} onChange={e => setSocietyForm({...societyForm, name: e.target.value})} /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} label="Institutional Abstract" value={societyForm.about} onChange={e => setSocietyForm({...societyForm, about: e.target.value})} placeholder="Describe the mission and history of the society..." /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="SaaS Software URL" value={societyForm.softwareUrl} onChange={e => setSocietyForm({...societyForm, softwareUrl: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><LanguageRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Official Email Matrix" value={societyForm.billingEmail} onChange={e => setSocietyForm({...societyForm, billingEmail: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Registered Secretariat Address" value={societyForm.billingAddress} onChange={e => setSocietyForm({...societyForm, billingAddress: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><StoreRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <Typography variant="caption" sx={{ fontWeight: 1000, color: "secondary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>LEGAL & FISCAL COMPLIANCE</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Corporate Identification Number (CIN)" value={societyForm.cin} onChange={e => setSocietyForm({...societyForm, cin: e.target.value})} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Permanent Account Number (PAN)" value={societyForm.panNo} onChange={e => setSocietyForm({...societyForm, panNo: e.target.value})} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="GST Identification Number" value={societyForm.gstNo} onChange={e => setSocietyForm({...societyForm, gstNo: e.target.value})} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Incorporation Pulse Date" value={societyForm.registrationDate} onChange={e => setSocietyForm({...societyForm, registrationDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <Typography variant="caption" sx={{ fontWeight: 1000, color: "success.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>CLASSIFICATION & EQUITY</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}><TextField select fullWidth label="Entity Category" value={societyForm.category} onChange={e => setSocietyForm({...societyForm, category: e.target.value})}><MenuItem value="Credit Co-op">Credit Co-op</MenuItem><MenuItem value="Multi-State">Multi-State Society</MenuItem><MenuItem value="Nidhi">Nidhi Company</MenuItem></TextField></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField select fullWidth label="Institutional Class" value={societyForm.class} onChange={e => setSocietyForm({...societyForm, class: e.target.value})}><MenuItem value="Class A">Class A (Premium)</MenuItem><MenuItem value="Class B">Class B (Standard)</MenuItem></TextField></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label="Authorized Equity" value={societyForm.authorizedCapital} onChange={e => setSocietyForm({...societyForm, authorizedCapital: Number(e.target.value)})} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label="Paid-up Liquidity" value={societyForm.paidUpCapital} onChange={e => setSocietyForm({...societyForm, paidUpCapital: Number(e.target.value)})} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label="Share Nominal Scale" value={societyForm.shareNominalValue} onChange={e => setSocietyForm({...societyForm, shareNominalValue: Number(e.target.value)})} /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth label="State of Jurisdiction" value={societyForm.registrationState} onChange={e => setSocietyForm({...societyForm, registrationState: e.target.value})} /></Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
