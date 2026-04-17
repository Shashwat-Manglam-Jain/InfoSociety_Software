"use client";

import { useEffect, useState } from "react";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ContactMailRoundedIcon from "@mui/icons-material/ContactMailRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getSession } from "@/shared/auth/session";
import { updateMyProfile } from "@/shared/api/users";
import { getCustomerMe } from "@/shared/api/customers";
import { toast } from "@/shared/ui/toast";
import type { AuthUser } from "@/shared/types";

type ProfileFormState = {
  // User-level
  fullName: string;
  // Customer-level (only for users with linked customer profiles)
  phone: string;
  email: string;
  address: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  panNumber: string;
  nomineeFullName: string;
  nomineeRelation: string;
  nomineeContactNumber: string;
  avatarUrl: string | null;
};

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const NOMINEE_RELATIONS = [
  "Spouse",
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Guardian",
  "Other"
];

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3.5, border: (t) => `1px solid ${alpha(t.palette.divider, 1)}` }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <Avatar sx={{ bgcolor: alpha("#6366f1", 0.1), color: "#6366f1", width: 36, height: 36 }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.3 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export function ProfileEditWorkspace({ user }: { user: AuthUser }) {
  const session = getSession();
  const token = session?.accessToken ?? "";

  const [form, setForm] = useState<ProfileFormState>({
    fullName: user.fullName ?? "",
    phone: "",
    email: "",
    address: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    gender: "",
    panNumber: "",
    nomineeFullName: "",
    nomineeRelation: "",
    nomineeContactNumber: "",
    avatarUrl: (user as any).avatarUrl ?? null
  });
  const [customerCode, setCustomerCode] = useState<string | null>(null);
  const [hasCustomer, setHasCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const customerMe = await getCustomerMe(token);
        setHasCustomer(true);
        setCustomerCode(customerMe.customerCode ?? null);
        setForm((prev) => ({
          ...prev,
          fullName: user.fullName ?? "",
          phone: (customerMe as any).phone ?? "",
          email: (customerMe as any).email ?? "",
          address: (customerMe as any).address ?? "",
          fatherName: (customerMe as any).fatherName ?? "",
          motherName: (customerMe as any).motherName ?? "",
          dateOfBirth: (customerMe as any).dateOfBirth
            ? new Date((customerMe as any).dateOfBirth).toISOString().slice(0, 10)
            : "",
          gender: (customerMe as any).gender ?? "",
          panNumber: (customerMe as any).panNumber ?? "",
          nomineeFullName: (customerMe as any).nomineeFullName ?? "",
          nomineeRelation: (customerMe as any).nomineeRelation ?? "",
          nomineeContactNumber: (customerMe as any).nomineeContactNumber ?? "",
          avatarUrl: (user as any).avatarUrl ?? null
        }));
      } catch {
        // AGENT / STAFF have no linked customer — that's fine
        setHasCustomer(false);
        setForm((prev) => ({ ...prev, fullName: user.fullName ?? "" }));
      } finally {
        setLoadingProfile(false);
      }
    }
    void loadProfile();
  }, [token, user.fullName]);

  const set = (key: keyof ProfileFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Image too large. Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setForm((prev) => ({ ...prev, avatarUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSave() {
    setSaving(true);
    try {
      await updateMyProfile(token, {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        fatherName: form.fatherName,
        motherName: form.motherName,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        panNumber: form.panNumber,
        nomineeFullName: form.nomineeFullName,
        nomineeRelation: form.nomineeRelation,
        nomineeContactNumber: form.nomineeContactNumber,
        avatarUrl: form.avatarUrl ?? undefined
      });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 860, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your personal details. Sensitive fields (Aadhaar, username) require admin intervention.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
          onClick={() => void handleSave()}
          disabled={saving}
          sx={{ borderRadius: 3, fontWeight: 800, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" }, whiteSpace: "nowrap" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </Stack>

      {/* Identity card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3.5,
          border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff"
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }}>
          <Box sx={{ position: "relative" }}>
            <input
              type="file"
              id="avatar-upload"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <Avatar
              src={form.avatarUrl || undefined}
              sx={{
                width: 96,
                height: 96,
                bgcolor: "#6366f1",
                fontSize: 32,
                fontWeight: 900,
                cursor: "pointer",
                border: "4px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  "& .upload-overlay": { opacity: 1 }
                }
              }}
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              {!form.avatarUrl && user.fullName?.charAt(0).toUpperCase()}
              <Box
                className="upload-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s"
                }}
              >
                <CameraAltRoundedIcon sx={{ color: "#fff" }} />
              </Box>
            </Avatar>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{user.fullName}</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>@{user.username}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" gap={0.8}>
              <Chip
                label={user.role}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800, fontSize: 11 }}
              />
              {customerCode && (
                <Chip
                  label={customerCode}
                  size="small"
                  sx={{ bgcolor: "rgba(99,102,241,0.35)", color: "#fff", fontWeight: 800, fontSize: 11 }}
                />
              )}
              <Chip
                label={user.society?.name ?? "No Society"}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 11 }}
              />
            </Stack>
          </Box>
          <Stack spacing={1}>
            <ReadonlyPill label="Status" value={user.isActive === false ? "Inactive" : "Active"} />
          </Stack>
        </Stack>
      </Paper>

      {/* Basic Info */}
      <Section icon={<PersonRoundedIcon fontSize="small" />} title="Basic Information">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={form.fullName}
              onChange={set("fullName")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              value={user.username}
              disabled
              helperText="Cannot be changed by user"
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={form.phone}
              onChange={set("phone")}
              inputProps={{ maxLength: 15 }}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={set("email")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Residential Address"
              value={form.address}
              onChange={set("address")}
              multiline
              minRows={2}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Personal Details */}
      <Section icon={<AccountCircleRoundedIcon fontSize="small" />} title="Personal Details">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={set("dateOfBirth")}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Gender"
              value={form.gender}
              onChange={set("gender")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Select Gender</MenuItem>
              {GENDER_OPTIONS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="PAN Number"
              value={form.panNumber}
              onChange={(e) => setForm((p) => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
              inputProps={{ maxLength: 10 }}
              helperText="Format: ABCDE1234F"
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Family Info */}
      <Section icon={<FamilyRestroomRoundedIcon fontSize="small" />} title="Family Information">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Father's Name"
              value={form.fatherName}
              onChange={set("fatherName")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Mother's Name"
              value={form.motherName}
              onChange={set("motherName")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Nominee Info */}
      <Section icon={<ContactMailRoundedIcon fontSize="small" />} title="Nominee Details">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nominee Full Name"
              value={form.nomineeFullName}
              onChange={set("nomineeFullName")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Nominee Relation"
              value={form.nomineeRelation}
              onChange={set("nomineeRelation")}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Select Relation</MenuItem>
              {NOMINEE_RELATIONS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nominee Contact Number"
              value={form.nomineeContactNumber}
              onChange={set("nomineeContactNumber")}
              inputProps={{ maxLength: 15 }}
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Read-only locked info */}
      <Section icon={<LockPersonRoundedIcon fontSize="small" />} title="Locked Fields (Admin Only)">
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
          The following fields can only be changed by your society admin or platform superadmin.
        </Alert>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadonlyField label="Username" value={user.username} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadonlyField label="Aadhaar Number" value="••••••••••••  (masked)" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadonlyField label="Role" value={user.role} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadonlyField label="Society" value={user.society?.name ?? "—"} />
          </Grid>
          {customerCode && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadonlyField label="Customer Code" value={customerCode} />
            </Grid>
          )}
        </Grid>
      </Section>

      {/* Save button bottom */}
      <Box sx={{ pb: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
          onClick={() => void handleSave()}
          disabled={saving}
          sx={{ borderRadius: 3, fontWeight: 800, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" }, py: 1.5, px: 4 }}
        >
          {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </Box>
    </Stack>
  );
}

function ReadonlyPill({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff" }}>{value}</Typography>
    </Box>
  );
}
