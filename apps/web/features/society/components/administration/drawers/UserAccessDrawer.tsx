"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { alpha } from "@mui/material/styles";
import { UserAccessSelector } from "../../user-access-selector";
import type { ManagedUserRow } from "../../../lib/society-admin-dashboard";

type UserAccessDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: ManagedUserRow | null;
  loading: boolean;
  onSave: (allowedModuleSlugs: string[]) => void;
};

export function UserAccessDrawer({ open, onClose, user, loading, onSave }: UserAccessDrawerProps) {
  const [allowedModuleSlugs, setAllowedModuleSlugs] = useState<string[]>([]);
  const accountType = user?.role === "SUPER_USER" ? "SOCIETY" : user?.role === "AGENT" ? "AGENT" : "CLIENT";

  useEffect(() => {
    setAllowedModuleSlugs(user?.allowedModuleSlugs ?? []);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 460 } }
      }}
    >
      <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
        <Box sx={{ borderBottom: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: alpha("#0f172a", 0.02), px: 3, py: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Access & Modules
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review the modules this account can open after login.
              </Typography>
            </Stack>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={3} sx={{ flex: 1, px: 3, py: 3 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {user.fullName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
              <Tooltip title={user.roleMeta.description}>
                <Chip label={user.roleMeta.label} size="small" />
              </Tooltip>
              <Chip
                label={user.isActive ? "Active" : "Inactive"}
                size="small"
                color={user.isActive ? "success" : "default"}
                variant={user.isActive ? "filled" : "outlined"}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Branch: {user.branch?.name ?? "Head office / unassigned"}
            </Typography>
          </Stack>

          <Divider />

          <UserAccessSelector
            accountType={accountType}
            value={allowedModuleSlugs}
            onChange={setAllowedModuleSlugs}
            title="LOGIN MODULES"
            helperText="Use clear, role-safe module access instead of broad default access."
          />

          <Box sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ManageAccountsRoundedIcon />}
              disabled={loading}
              onClick={() => onSave(allowedModuleSlugs)}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              Save Access
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
