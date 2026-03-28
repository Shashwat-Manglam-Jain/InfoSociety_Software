"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { createBranch, listBranches, updateBranch } from "@/shared/api/branches";
import { getSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";
import type { Branch } from "@/shared/types";

type BranchFormState = {
  code: string;
  name: string;
  contactEmail: string;
  contactNo: string;
  openingDate: string;
  ifscCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isHead: boolean;
  isActive: boolean;
  rechargeService: boolean;
  neftImpsService: boolean;
  lockerFacility: boolean;
};

function formatDateInput(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function emptyForm(): BranchFormState {
  return {
    code: "",
    name: "",
    contactEmail: "",
    contactNo: "",
    openingDate: "",
    ifscCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isHead: false,
    isActive: true,
    rechargeService: false,
    neftImpsService: false,
    lockerFacility: false
  };
}

function toFormState(branch: Branch | null): BranchFormState {
  if (!branch) {
    return emptyForm();
  }

  return {
    code: branch.code,
    name: branch.name,
    contactEmail: branch.contactEmail ?? "",
    contactNo: branch.contactNo ?? "",
    openingDate: formatDateInput(branch.openingDate),
    ifscCode: branch.ifscCode ?? "",
    addressLine1: branch.addressLine1 ?? "",
    addressLine2: branch.addressLine2 ?? "",
    city: branch.city ?? "",
    state: branch.state ?? "",
    pincode: branch.pincode ?? "",
    country: branch.country ?? "India",
    isHead: branch.isHead,
    isActive: branch.isActive,
    rechargeService: branch.rechargeService,
    neftImpsService: branch.neftImpsService,
    lockerFacility: branch.lockerFacility
  };
}

function toOptionalText(value: string) {
  const next = value.trim();
  return next ? next : undefined;
}

export function BranchForm() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BranchFormState>(emptyForm);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId) ?? null,
    [branches, selectedBranchId]
  );

  useEffect(() => {
    async function loadBranchesForWorkspace() {
      const session = getSession();
      if (!session) {
        setError("Please login again to manage branches.");
        setLoadingBranches(false);
        return;
      }

      try {
        const response = await listBranches(session.accessToken);
        setBranches(response);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load branches.");
      } finally {
        setLoadingBranches(false);
      }
    }

    void loadBranchesForWorkspace();
  }, []);

  useEffect(() => {
    setFormData(toFormState(selectedBranch));
  }, [selectedBranch]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, checked, type } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function startNewBranch() {
    setSelectedBranchId(null);
    setFormData(emptyForm());
    setError(null);
  }

  async function reloadBranches(nextSelectedId?: string | null) {
    const session = getSession();
    if (!session) {
      return;
    }

    const response = await listBranches(session.accessToken);
    setBranches(response);
    setSelectedBranchId(nextSelectedId ?? null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const session = getSession();
    if (!session) {
      setError("Please login again to save branch settings.");
      return;
    }

    if (!formData.code.trim() || !formData.name.trim()) {
      setError("Branch code and branch name are required.");
      return;
    }

    const payload = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      contactEmail: toOptionalText(formData.contactEmail),
      contactNo: toOptionalText(formData.contactNo),
      openingDate: formData.openingDate.trim() ? formData.openingDate : undefined,
      ifscCode: toOptionalText(formData.ifscCode),
      addressLine1: toOptionalText(formData.addressLine1),
      addressLine2: toOptionalText(formData.addressLine2),
      city: toOptionalText(formData.city),
      state: toOptionalText(formData.state),
      pincode: toOptionalText(formData.pincode),
      country: toOptionalText(formData.country),
      isHead: formData.isHead,
      isActive: formData.isActive,
      rechargeService: formData.rechargeService,
      neftImpsService: formData.neftImpsService,
      lockerFacility: formData.lockerFacility
    };

    try {
      setSaving(true);
      const branch = selectedBranchId
        ? await updateBranch(session.accessToken, selectedBranchId, payload)
        : await createBranch(session.accessToken, payload);

      await reloadBranches(branch.id);
      toast.success(selectedBranchId ? "Branch updated successfully." : "Branch created successfully.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to save branch.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardHeader
        title="Branch Configuration"
        subheader="Create new branches, review current branch records, and update service routing details from one place."
      />
      <Divider />
      <CardContent>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Existing Branches
          </Typography>
          <Button variant="outlined" onClick={startNewBranch}>
            Create New Branch
          </Button>
        </Stack>

        {loadingBranches ? (
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" width={156} height={32} />
            ))}
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {branches.map((branch) => (
              <Chip
                key={branch.id}
                label={`${branch.code} - ${branch.name}`}
                color={selectedBranchId === branch.id ? "primary" : "default"}
                variant={selectedBranchId === branch.id ? "filled" : "outlined"}
                onClick={() => setSelectedBranchId(branch.id)}
              />
            ))}
            {branches.length === 0 ? <Chip label="No branches saved yet" variant="outlined" /> : null}
          </Stack>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
            CORE DETAILS
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth required name="code" label="Branch Code" value={formData.code} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField fullWidth required name="name" label="Branch Name" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                name="openingDate"
                label="Opening Date"
                type="date"
                value={formData.openingDate}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="primary" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
            LOCATION AND CONTACT
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="contactEmail" label="Official Email" value={formData.contactEmail} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="contactNo" label="Contact Number" value={formData.contactNo} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="ifscCode" label="IFSC Code" value={formData.ifscCode} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth name="addressLine1" label="Address Line 1" value={formData.addressLine1} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth name="addressLine2" label="Address Line 2" value={formData.addressLine2} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth name="city" label="City" value={formData.city} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth name="state" label="State" value={formData.state} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth name="country" label="Country" value={formData.country} onChange={handleChange} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="primary" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
            SERVICES AND STATUS
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControlLabel control={<Switch checked={formData.isHead} onChange={handleChange} name="isHead" />} label="Head Branch" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControlLabel control={<Switch checked={formData.isActive} onChange={handleChange} name="isActive" />} label="Active" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControlLabel
                control={<Switch checked={formData.rechargeService} onChange={handleChange} name="rechargeService" />}
                label="Recharge Service"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControlLabel
                control={<Switch checked={formData.neftImpsService} onChange={handleChange} name="neftImpsService" />}
                label="NEFT / IMPS"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControlLabel
                control={<Switch checked={formData.lockerFacility} onChange={handleChange} name="lockerFacility" />}
                label="Locker Facility"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" size="large" type="submit" disabled={saving}>
              {saving ? "Saving..." : selectedBranchId ? "Update Branch" : "Create Branch"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
