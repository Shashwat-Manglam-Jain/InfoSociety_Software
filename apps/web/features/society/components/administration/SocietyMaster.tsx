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
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { SectionHero } from "../operations/SectionHero";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSocietyMasterCopy } from "@/shared/i18n/society-master-copy";

export type SocietyMasterProps = {
  societyForm: any;
  setSocietyForm: (v: any) => void;
  handleUpdateSociety: () => void;
  handleOpenWorkspace: () => void;
  formLoading: boolean;
};

export function SocietyMaster({
  societyForm,
  setSocietyForm,
  handleUpdateSociety,
  handleOpenWorkspace,
  formLoading
}: SocietyMasterProps) {
  const { locale } = useLanguage();
  const copy = getSocietyMasterCopy(locale);

  const setField = (field: string, value: unknown) => {
    setSocietyForm({ ...societyForm, [field]: value });
  };

  const setOptionalNumberField = (field: string, value: string) => {
    setField(field, value === "" ? "" : Number(value));
  };

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<BusinessRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="blue"
        actions={
          <>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.45)",
                borderRadius: 1,
                fontWeight: 900,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255,255,255,0.08)"
                }
              }}
              onClick={handleOpenWorkspace}
            >
              {copy.hero.openAccessWorkspace}
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                  bgcolor: "#fff", 
                  color: "#0f172a", 
                  borderRadius: 1, 
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#f1f5f9" }
              }} 
              onClick={handleUpdateSociety} 
              disabled={formLoading}
            >
              {copy.hero.saveProfile}
            </Button>
          </>
        }
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 1, border: "2px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
            <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>{copy.sections.visualIdentity}</Typography>
            <Stack spacing={4} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar src={societyForm.logoUrl} sx={{ width: 140, height: 140, borderRadius: 1, border: "4px solid #f8fafc", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                  <BusinessRoundedIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <IconButton size="small" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: "#fff", boxShadow: 1, "&:hover": { bgcolor: "#f1f5f9" } }}>
                  <CloudUploadRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>{copy.sections.institutionalLogo}</Typography>

              <Box sx={{ position: 'relative' }}>
                <Avatar src={societyForm.faviconUrl} sx={{ width: 64, height: 64, borderRadius: 1, border: "2px solid #f8fafc" }}>
                  <LanguageRoundedIcon />
                </Avatar>
                <IconButton size="small" sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: "#fff", boxShadow: 1 }}>
                  <CloudUploadRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>{copy.sections.manifestFavicon}</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 1, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>{copy.sections.corporateAttributes}</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}><TextField fullWidth label={copy.fields.fullLegalEntityName} value={societyForm.name ?? ""} onChange={e => setField("name", e.target.value)} /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} label={copy.fields.institutionalAbstract} value={societyForm.about ?? ""} onChange={e => setField("about", e.target.value)} placeholder={copy.fields.institutionalAbstractPlaceholder} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={copy.fields.softwareUrl} value={societyForm.softwareUrl ?? ""} onChange={e => setField("softwareUrl", e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><LanguageRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={copy.fields.officialEmailMatrix} value={societyForm.billingEmail ?? ""} onChange={e => setField("billingEmail", e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label={copy.fields.registeredSecretariatAddress} value={societyForm.billingAddress ?? ""} onChange={e => setField("billingAddress", e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><StoreRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 1, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <Typography variant="caption" sx={{ fontWeight: 1000, color: "secondary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>{copy.sections.legalCompliance}</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={copy.fields.cin} value={societyForm.cin ?? ""} onChange={e => setField("cin", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={copy.fields.pan} value={societyForm.panNo ?? ""} onChange={e => setField("panNo", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={copy.fields.gst} value={societyForm.gstNo ?? ""} onChange={e => setField("gstNo", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label={copy.fields.incorporationDate} value={societyForm.registrationDate ?? ""} onChange={e => setField("registrationDate", e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <Typography variant="caption" sx={{ fontWeight: 1000, color: "success.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>{copy.sections.classificationEquity}</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}><TextField select fullWidth label={copy.fields.entityCategory} value={societyForm.category ?? ""} onChange={e => setField("category", e.target.value)}><MenuItem value="">{copy.options.notSet}</MenuItem><MenuItem value="Credit Co-op">{copy.options.category.creditCoop}</MenuItem><MenuItem value="Multi-State">{copy.options.category.multiState}</MenuItem><MenuItem value="Nidhi">{copy.options.category.nidhi}</MenuItem></TextField></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField select fullWidth label={copy.fields.institutionalClass} value={societyForm.class ?? ""} onChange={e => setField("class", e.target.value)}><MenuItem value="">{copy.options.notSet}</MenuItem><MenuItem value="Class A">{copy.options.institutionalClass.classA}</MenuItem><MenuItem value="Class B">{copy.options.institutionalClass.classB}</MenuItem></TextField></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label={copy.fields.authorizedEquity} value={societyForm.authorizedCapital ?? ""} onChange={e => setOptionalNumberField("authorizedCapital", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label={copy.fields.paidUpLiquidity} value={societyForm.paidUpCapital ?? ""} onChange={e => setOptionalNumberField("paidUpCapital", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label={copy.fields.shareNominalScale} value={societyForm.shareNominalValue ?? ""} onChange={e => setOptionalNumberField("shareNominalValue", e.target.value)} /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth label={copy.fields.stateOfJurisdiction} value={societyForm.registrationState ?? ""} onChange={e => setField("registrationState", e.target.value)} /></Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
