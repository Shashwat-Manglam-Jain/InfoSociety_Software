"use client";

import {
  Box,
  Button,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { UserAccessSelector } from "../../user-access-selector";
import type { UserFormState } from "../../../lib/society-admin-dashboard";
import {
  isStrongPassword,
  normalizeAllowedModules,
  toAccountType
} from "../../../lib/society-admin-dashboard";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getUserProvisioningDrawerCopy } from "@/shared/i18n/user-provisioning-drawer-copy";
import type { Branch, UserRole } from "@/shared/types";

type UserProvisioningDrawerProps = {
  open: boolean;
  onClose: () => void;
  form: UserFormState;
  setForm: (value: UserFormState) => void;
  onSave: () => void;
  loading: boolean;
  branches: Branch[];
  updateStaffName: (value: string) => void;
  regeneratePassword: () => void;
  mode: "create" | "edit";
};

const roleOptions: UserRole[] = ["SUPER_USER", "AGENT", "CLIENT"];

export function UserProvisioningDrawer({
  open,
  onClose,
  form,
  setForm,
  onSave,
  loading,
  branches,
  updateStaffName,
  regeneratePassword,
  mode
}: UserProvisioningDrawerProps) {
  const { locale } = useLanguage();
  const copy = getUserProvisioningDrawerCopy(locale);
  const roleMeta = copy.roles[form.role];
  const isEditing = mode === "edit";
  const passwordProvided = form.password.trim().length > 0;
  const passwordIsValid = !passwordProvided || isStrongPassword(form.password);
  const passwordHelperText = isEditing
    ? copy.password.editHelper
    : copy.password.createHelper;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 520 } }
      }}
    >
      <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
        <Box sx={{ borderBottom: "1px solid rgba(15, 23, 42, 0.08)", px: 3, py: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {isEditing ? copy.title.update : copy.title.add}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing ? copy.description.update : copy.description.add}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={3} sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
          <TextField fullWidth label={copy.fields.fullName} value={form.fullName} onChange={(event) => updateStaffName(event.target.value)} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label={copy.fields.accountType}
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value as UserRole,
                    allowedModuleSlugs: normalizeAllowedModules(event.target.value as UserRole)
                  })
                }
                disabled={isEditing}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {copy.roles[role].label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label={copy.fields.branch}
                value={form.branchId}
                onChange={(event) => setForm({ ...form, branchId: event.target.value })}
              >
                <MenuItem value="">{copy.fields.headOfficeUnassigned}</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {roleMeta.label}
              </Typography>
              <Tooltip title={roleMeta.description}>
                <InfoOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              </Tooltip>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {roleMeta.description}
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={copy.fields.username}
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                helperText={copy.fields.usernameHelper}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={isEditing ? copy.fields.resetPasswordOptional : copy.fields.temporaryPassword}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                error={!passwordIsValid}
                helperText={!passwordIsValid ? passwordHelperText : passwordHelperText}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={regeneratePassword}>
                      <AutorenewRoundedIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>

          {form.role !== "SUPER_USER" && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={copy.fields.phone}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={copy.fields.email}
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label={copy.fields.address}
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                />
              </Grid>
            </Grid>
          )}

          <UserAccessSelector
            accountType={toAccountType(form.role) as "SOCIETY" | "AGENT" | "CLIENT"}
            value={form.allowedModuleSlugs}
            onChange={(allowedModuleSlugs) => setForm({ ...form, allowedModuleSlugs })}
          />

          <Box sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              disabled={
                loading ||
                !form.fullName.trim() ||
                !form.username.trim() ||
                (!isEditing && !form.password.trim()) ||
                !passwordIsValid
              }
              onClick={onSave}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              {(isEditing ? copy.actions.updateAccount : copy.actions.createAccount).replace("{{role}}", roleMeta.actionNoun)}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
