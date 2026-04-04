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
import { ROLE_META, toAccountType } from "../../../lib/society-admin-dashboard";
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
  regeneratePassword
}: UserProvisioningDrawerProps) {
  const roleMeta = ROLE_META[form.role];

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
                Add account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a society admin, field agent, or client account with the right modules.
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={3} sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
          <TextField fullWidth label="Full name" value={form.fullName} onChange={(event) => updateStaffName(event.target.value)} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Account type"
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value as UserRole
                  })
                }
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_META[role].label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Branch"
                value={form.branchId}
                onChange={(event) => setForm({ ...form, branchId: event.target.value })}
              >
                <MenuItem value="">Head office / unassigned</MenuItem>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                helperText="Use a clear login id. It is auto-filled from the name and can still be adjusted."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Temporary password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
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

          <UserAccessSelector
            accountType={toAccountType(form.role) as "SOCIETY" | "AGENT" | "CLIENT"}
            value={form.allowedModuleSlugs}
            onChange={(allowedModuleSlugs) => setForm({ ...form, allowedModuleSlugs })}
          />

          <Box sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              disabled={loading || !form.fullName.trim() || !form.username.trim() || !form.password.trim()}
              onClick={onSave}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              Create {roleMeta.shortLabel.toLowerCase()} account
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
