"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  MenuItem
} from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { ManagedUserRow } from "../../lib/society-admin-dashboard";

export type TeamOperationsProps = {
  managedUsers: ManagedUserRow[];
  userSearch: string;
  setUserSearch: (value: string) => void;
  handleOpenDrawer: (type: "staff" | "agent" | "client") => void;
  handleToggleUserStatus: (id: string, current: boolean) => void;
  setSelectedUserAccess: (user: ManagedUserRow) => void;
  handleEditUser: (user: ManagedUserRow) => void;
  handleDeleteUser: (user: ManagedUserRow) => void;
};

export function TeamOperations({
  managedUsers,
  userSearch,
  setUserSearch,
  handleOpenDrawer,
  handleToggleUserStatus,
  setSelectedUserAccess,
  handleEditUser,
  handleDeleteUser
}: TeamOperationsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const [accountTypeFilter, setAccountTypeFilter] = useState("all");

  const filteredUsers = managedUsers.filter((user) => {
    if (accountTypeFilter !== "all" && user.role !== accountTypeFilter) {
      return false;
    }

    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [user.fullName, user.username, user.branch?.name ?? "", user.roleMeta.label].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  const metrics = [
    { label: "Accounts", value: String(managedUsers.length), caption: "All login-enabled society accounts." },
    {
      label: "Staff",
      value: String(managedUsers.filter((user) => user.role === "SUPER_USER").length),
      caption: "Internal operational accounts."
    },
    {
      label: "Agents",
      value: String(managedUsers.filter((user) => user.role === "AGENT").length),
      caption: "Field agents and collections staff."
    },
    {
      label: "Clients",
      value: String(managedUsers.filter((user) => user.role === "CLIENT").length),
      caption: "Client member portal accounts."
    }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<BadgeRoundedIcon />}
        eyebrow="Users"
        title="User management"
        description="Create, activate, and manage staff, agent, and client accounts with clear role labels and module access."
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search users"
              sx={{
                minWidth: { xs: "100%", sm: 240 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: surfaces.input,
                  color: "#fff",
                  border: `1px solid ${surfaces.inputBorder}`
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
              }}
            />
            <TextField
              select
              size="small"
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: surfaces.input,
                  color: "#fff",
                  border: `1px solid ${surfaces.inputBorder}`
                }
              }}
            >
              <MenuItem value="all">All Accounts</MenuItem>
              <MenuItem value="SUPER_USER">Staff</MenuItem>
              <MenuItem value="CLIENT">Client</MenuItem>
              <MenuItem value="AGENT">Agent</MenuItem>
            </TextField>
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1RoundedIcon />}
              onClick={() => handleOpenDrawer("staff")}
              sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 800, "&:hover": { bgcolor: "#f8fafc" } }}
            >
              Add account
            </Button>
          </>
        }
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }
        }}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 860, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, width: "28%" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>Account type</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>Modules</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "10%" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, width: "12%" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No matching users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
                          {user.fullName?.[0] ?? "U"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {user.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={user.roleMeta.description}>
                        <Chip
                          size="small"
                          label={user.roleMeta.label}
                          sx={{
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.branch?.name ?? "Head office"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.branch?.code ?? "No branch code"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.allowedModuleSlugs?.length ?? 0} modules
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Controlled from access settings
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch checked={user.isActive} onChange={() => handleToggleUserStatus(user.id, user.isActive)} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: user.isActive ? "#15803d" : "#475569" }}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit account">
                          <Button
                            size="small"
                            startIcon={<EditRoundedIcon fontSize="small" />}
                            onClick={() => handleEditUser(user)}
                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, minWidth: 0 }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        <Tooltip title="Manage access">
                          <IconButton size="small" onClick={() => setSelectedUserAccess(user)}>
                            <ManageAccountsRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.role !== "SUPER_USER" && (
                          <Tooltip title="Remove account">
                            <IconButton size="small" color="error" onClick={() => handleDeleteUser(user)}>
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
