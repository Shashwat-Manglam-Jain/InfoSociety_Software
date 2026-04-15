"use client";

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
  Typography
} from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getTeamOperationsCopy } from "@/shared/i18n/team-operations-copy";
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
};

export function TeamOperations({
  managedUsers,
  userSearch,
  setUserSearch,
  handleOpenDrawer,
  handleToggleUserStatus,
  setSelectedUserAccess,
  handleEditUser
}: TeamOperationsProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getTeamOperationsCopy(locale);
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;
  const actionButtonBg = isDark ? alpha("#ffffff", 0.04) : alpha(theme.palette.primary.main, 0.06);
  const actionButtonHover = isDark ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.primary.main, 0.12);

  const staffUsers = managedUsers.filter((user) => user.role === "SUPER_USER");
  const filteredUsers = staffUsers.filter((user) => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [user.fullName, user.username, user.branch?.name ?? "", user.roleMeta.label].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  const metrics = [
    { label: copy.metrics.staff.label, value: String(staffUsers.length), caption: copy.metrics.staff.caption },
    {
      label: copy.metrics.active.label,
      value: String(staffUsers.filter((user) => user.isActive).length),
      caption: copy.metrics.active.caption
    },
    {
      label: copy.metrics.admins.label,
      value: String(staffUsers.filter((user) => user.isSocietyAdmin).length),
      caption: copy.metrics.admins.caption
    },
    {
      label: copy.metrics.branches.label,
      value: String(new Set(staffUsers.map((user) => user.branch?.id ?? "head-office")).size),
      caption: copy.metrics.branches.caption
    }
  ];

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<BadgeRoundedIcon />}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder={copy.hero.searchPlaceholder}
              sx={{
                minWidth: { xs: "100%", sm: 240 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: surfaces.input,
                  color: "#fff",
                  border: `1px solid ${surfaces.inputBorder}`
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
              }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1RoundedIcon />}
              onClick={() => handleOpenDrawer("staff")}
              sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2, fontWeight: 800, "&:hover": { bgcolor: "#f8fafc" } }}
            >
              {copy.hero.addStaffUser}
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

      <Paper elevation={0} sx={{ borderRadius: 1, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 860, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, width: "28%" }}>{copy.table.user}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>{copy.table.accountType}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>{copy.table.branch}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>{copy.table.modules}</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "10%" }}>{copy.table.status}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, width: "14%" }}>
                  {copy.table.actions}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {copy.emptyState}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
                          {user.fullName?.[0] ?? copy.fallback.defaultAvatar}
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
                        {user.branch?.name ?? copy.fallback.headOffice}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.branch?.code ?? copy.fallback.noBranchCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {copy.modulesCount.replace("{{count}}", String(user.allowedModuleSlugs?.length ?? 0))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {copy.fallback.controlledFromAccessSettings}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Switch checked={user.isActive} onChange={() => handleToggleUserStatus(user.id, user.isActive)} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: user.isActive ? "#15803d" : "#475569" }}>
                          {user.isActive ? copy.status.active : copy.status.inactive}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1.1} justifyContent="flex-end" alignItems="center">
                        <Tooltip title={copy.actions.editAccount}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{
                              bgcolor: actionButtonBg,
                              "&:hover": {
                                bgcolor: actionButtonHover
                              }
                            }}
                          >
                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={copy.actions.manageAccess}>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedUserAccess(user)}
                            sx={{
                              bgcolor: actionButtonBg,
                              "&:hover": {
                                bgcolor: actionButtonHover
                              }
                            }}
                          >
                            <ManageAccountsRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
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
