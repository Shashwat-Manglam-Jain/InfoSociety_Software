"use client";

import {
  Box,
  Button,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { BranchFormState } from "../../../lib/society-admin-dashboard";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getBranchDrawerCopy } from "@/shared/i18n/branch-drawer-copy";

type BranchDrawerProps = {
  open: boolean;
  onClose: () => void;
  form: BranchFormState;
  setForm: (value: BranchFormState) => void;
  onSave: () => void;
  loading: boolean;
};

export function BranchDrawer({ open, onClose, form, setForm, onSave, loading }: BranchDrawerProps) {
  const { locale } = useLanguage();
  const copy = getBranchDrawerCopy(locale);

  const updateField = <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 560 } }
      }}
    >
      <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
        <Box sx={{ borderBottom: "1px solid rgba(15, 23, 42, 0.08)", px: 3, py: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {form.id ? copy.title.edit : copy.title.add}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {copy.description}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={3} sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label={copy.fields.branchName}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={copy.fields.branchCode}
                value={form.code}
                onChange={(event) => updateField("code", event.target.value.toUpperCase())}
                helperText={copy.fields.branchCodeHelper}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={copy.fields.contactEmail}
                value={form.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={copy.fields.contactNumber}
                value={form.contactNo}
                onChange={(event) => updateField("contactNo", event.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={copy.fields.addressLine1}
                value={form.addressLine1}
                onChange={(event) => updateField("addressLine1", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={copy.fields.addressLine2}
                value={form.addressLine2}
                onChange={(event) => updateField("addressLine2", event.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={copy.fields.city}
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={copy.fields.state}
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={copy.fields.pincode}
                value={form.pincode}
                onChange={(event) => updateField("pincode", event.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label={copy.fields.openingDate}
                value={form.openingDate}
                onChange={(event) => updateField("openingDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Stack spacing={1.25}>
            <FormControlLabel
              control={<Switch checked={form.isHead} onChange={(event) => updateField("isHead", event.target.checked)} />}
              label={copy.toggles.headOffice}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.lockerFacility}
                  onChange={(event) => updateField("lockerFacility", event.target.checked)}
                />
              }
              label={copy.toggles.lockerFacility}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.neftImpsService}
                  onChange={(event) => updateField("neftImpsService", event.target.checked)}
                />
              }
              label={copy.toggles.digitalTransfers}
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} />}
              label={copy.toggles.branchActive}
            />
          </Stack>

          <Box sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              disabled={loading || !form.name.trim()}
              onClick={onSave}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              {form.id ? copy.actions.save : copy.actions.create}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
