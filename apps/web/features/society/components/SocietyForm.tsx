"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { getSession } from "@/shared/auth/session";
import { updateSocietyAccess, type UpdateSocietyAccessPayload } from "@/shared/api/monitoring";
import { toast } from "@/shared/ui/toast";
import type { Society } from "@/shared/types";

type SocietyFormProps = {
  society: Society | null;
  onSaved?: (society: Society) => void;
};

type SocietyFormState = {
  panNo: string;
  tanNo: string;
  gstNo: string;
  category: string;
  authorizedCapital: string;
  paidUpCapital: string;
  shareNominalValue: string;
  registrationDate: string;
  registrationNumber: string;
  registrationState: string;
  registrationAuthority: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  upiId: string;
  acceptsDigitalPayments: boolean;
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

function toFormState(society: Society | null): SocietyFormState {
  return {
    panNo: society?.panNo ?? "",
    tanNo: society?.tanNo ?? "",
    gstNo: society?.gstNo ?? "",
    category: society?.category ?? "",
    authorizedCapital: society?.authorizedCapital != null ? String(society.authorizedCapital) : "",
    paidUpCapital: society?.paidUpCapital != null ? String(society.paidUpCapital) : "",
    shareNominalValue: society?.shareNominalValue != null ? String(society.shareNominalValue) : "",
    registrationDate: formatDateInput(society?.registrationDate),
    registrationNumber: society?.registrationNumber ?? "",
    registrationState: society?.registrationState ?? "",
    registrationAuthority: society?.registrationAuthority ?? "",
    billingEmail: society?.billingEmail ?? "",
    billingPhone: society?.billingPhone ?? "",
    billingAddress: society?.billingAddress ?? "",
    upiId: society?.upiId ?? "",
    acceptsDigitalPayments: society?.acceptsDigitalPayments ?? false
  };
}

function toNullableText(value: string) {
  const next = value.trim();
  return next ? next : null;
}

function toNullableNumber(value: string) {
  const next = value.trim();
  if (!next) {
    return null;
  }

  const parsed = Number(next);
  return Number.isFinite(parsed) ? parsed : null;
}

export function SocietyForm({ society, onSaved }: SocietyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SocietyFormState>(() => toFormState(society));

  useEffect(() => {
    setFormData(toFormState(society));
  }, [society]);

  const formDisabled = useMemo(() => !society?.id, [society]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, checked, type } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!society?.id) {
      setError("No society context is available for this account.");
      return;
    }

    const session = getSession();
    if (!session) {
      setError("Please login again to save society settings.");
      return;
    }

    const payload: UpdateSocietyAccessPayload = {
      panNo: toNullableText(formData.panNo),
      tanNo: toNullableText(formData.tanNo),
      gstNo: toNullableText(formData.gstNo),
      category: toNullableText(formData.category),
      authorizedCapital: toNullableNumber(formData.authorizedCapital),
      paidUpCapital: toNullableNumber(formData.paidUpCapital),
      shareNominalValue: toNullableNumber(formData.shareNominalValue),
      registrationDate: formData.registrationDate.trim() ? formData.registrationDate : null,
      registrationNumber: toNullableText(formData.registrationNumber),
      registrationState: toNullableText(formData.registrationState),
      registrationAuthority: toNullableText(formData.registrationAuthority),
      billingEmail: toNullableText(formData.billingEmail),
      billingPhone: toNullableText(formData.billingPhone),
      billingAddress: toNullableText(formData.billingAddress),
      acceptsDigitalPayments: formData.acceptsDigitalPayments,
      upiId: toNullableText(formData.upiId)
    };

    try {
      setLoading(true);
      const updated = await updateSocietyAccess(session.accessToken, society.id, payload);

      const mergedSociety: Society = {
        ...society,
        ...payload,
        acceptsDigitalPayments: updated.acceptsDigitalPayments,
        upiId: updated.upiId ?? payload.upiId ?? null
      };

      onSaved?.(mergedSociety);
      toast.success("Society settings saved successfully.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to update society settings.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardHeader
        title="Society Global Configuration"
        subheader="Persist the institution profile, registration details, billing contact, and digital payment settings for this society."
      />
      <Divider />
      <CardContent>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
            GOVERNMENT AND TAX IDS
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="panNo" label="PAN Number" value={formData.panNo} onChange={handleChange} disabled={formDisabled} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="tanNo" label="TAN Number" value={formData.tanNo} onChange={handleChange} disabled={formDisabled} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="gstNo" label="GSTIN" value={formData.gstNo} onChange={handleChange} disabled={formDisabled} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="primary" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
            CAPITAL AND REGISTRATION
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth name="category" label="Category" value={formData.category} onChange={handleChange} disabled={formDisabled} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="authorizedCapital"
                label="Authorized Capital"
                type="number"
                value={formData.authorizedCapital}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="paidUpCapital"
                label="Paid-Up Capital"
                type="number"
                value={formData.paidUpCapital}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="shareNominalValue"
                label="Nominal Value Per Share"
                type="number"
                value={formData.shareNominalValue}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="registrationDate"
                label="Registration Date"
                type="date"
                value={formData.registrationDate}
                onChange={handleChange}
                disabled={formDisabled}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="registrationNumber"
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="registrationState"
                label="Registration State"
                value={formData.registrationState}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                name="registrationAuthority"
                label="Registration Authority"
                value={formData.registrationAuthority}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="primary" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
            BILLING AND DIGITAL COLLECTIONS
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                name="billingEmail"
                label="Billing Email"
                type="email"
                value={formData.billingEmail}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                name="billingPhone"
                label="Billing Phone"
                value={formData.billingPhone}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="upiId" label="UPI ID" value={formData.upiId} onChange={handleChange} disabled={formDisabled} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                name="billingAddress"
                label="Billing Address"
                value={formData.billingAddress}
                onChange={handleChange}
                disabled={formDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.acceptsDigitalPayments}
                    onChange={handleChange}
                    name="acceptsDigitalPayments"
                    disabled={formDisabled}
                  />
                }
                label="Enable digital collections for this society"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" size="large" type="submit" disabled={loading || formDisabled}>
              {loading ? "Saving..." : "Save Society Settings"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
