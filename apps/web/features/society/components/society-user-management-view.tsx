"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Avatar,
  Paper,
  FormControl,
  MenuItem,
  Select
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

interface User {
  id: string;
  name: string;
  email: string;
  role: "AGENT" | "CLIENT";
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  createdAt: string;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: "AGENT" | "CLIENT";
}

export function SocietyUserManagementView() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [userType, setUserType] = useState<"AGENT" | "CLIENT">("AGENT");
  const [formData, setFormData] = useState<CreateUserForm>({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "AGENT"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Agent",
      email: "john@society.com",
      role: "AGENT",
      status: "ACTIVE",
      createdAt: "2026-01-15"
    },
    {
      id: "2",
      name: "Member One",
      email: "member1@email.com",
      role: "CLIENT",
      status: "ACTIVE",
      createdAt: "2026-01-20"
    }
  ]);

  const agents = users.filter((u) => u.role === "AGENT");
  const clients = users.filter((u) => u.role === "CLIENT");

  async function handleCreateUser() {
    setError(null);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: User = {
        id: String(users.length + 1),
        name: formData.fullName,
        email: formData.email,
        role: userType,
        status: "PENDING",
        createdAt: new Date().toISOString().split("T")[0]
      };

      setUsers([...users, newUser]);
      setOpenDialog(false);
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        role: "AGENT"
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  const getRoleStyles = (role: "AGENT" | "CLIENT") => {
    if (role === "AGENT") {
      return {
        color: "#b45309",
        backgroundColor: alpha("#b45309", 0.1),
        icon: SecurityRoundedIcon
      };
    }
    return {
      color: "#0f766e",
      backgroundColor: alpha("#0f766e", 0.1),
      icon: GroupsRoundedIcon
    };
  };

  const getStatusColor = (status: string) => {
    if (status === "ACTIVE") return "#2e7d32";
    if (status === "PENDING") return "#ed6c02";
    return "#666";
  };

  const UserCard = ({ user }: { user: User }) => {
    const roleStyles = getRoleStyles(user.role);
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 2.4,
          border: `1px solid ${alpha(roleStyles.color, 0.16)}`,
          background: `linear-gradient(135deg, ${alpha(roleStyles.color, 0.04)} 0%, rgba(255,255,255,0.98) 100%)`,
          transition: "all 220ms ease",
          "&:hover": {
            boxShadow: `0 8px 24px ${alpha(roleStyles.color, 0.12)}`,
            transform: "translateY(-2px)"
          }
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: roleStyles.color,
                  fontWeight: 800,
                  fontSize: "1rem"
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Typography sx={{ fontWeight: 700, color: "#102a43" }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={user.status}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(user.status), 0.12),
                color: getStatusColor(user.status),
                fontWeight: 700
              }}
            />
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Chip
              label={user.role}
              size="small"
              sx={{
                bgcolor: roleStyles.backgroundColor,
                color: roleStyles.color,
                fontWeight: 700
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Joined {user.createdAt}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3.2}>
          {/* Header Section */}
          <Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
              <Box>
                <Typography variant="h4" className="section-title" sx={{ fontSize: { xs: "1.75rem", md: "2.1rem" } }}>
                  👥 User Management
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8 }}>
                  Create and manage agents and clients for your society
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRoundedIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  borderRadius: 1.6,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`
                }}
              >
                Create User
              </Button>
            </Stack>
          </Box>

          {/* Status Overview Cards */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 2.4,
                  border: `2px solid ${alpha("#b45309", 0.14)}`,
                  background: `linear-gradient(135deg, ${alpha("#b45309", 0.08)} 0%, rgba(255,255,255,0.98) 100%)`
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha("#b45309", 0.16),
                      mx: "auto",
                      mb: 1.2
                    }}
                  >
                    <SecurityRoundedIcon sx={{ color: "#b45309" }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
                    {agents.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Agents
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 2.4,
                  border: `2px solid ${alpha("#0f766e", 0.14)}`,
                  background: `linear-gradient(135deg, ${alpha("#0f766e", 0.08)} 0%, rgba(255,255,255,0.98) 100%)`
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha("#0f766e", 0.16),
                      mx: "auto",
                      mb: 1.2
                    }}
                  >
                    <GroupsRoundedIcon sx={{ color: "#0f766e" }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
                    {clients.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Clients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 2.4,
                  border: `2px solid ${alpha("#1d4ed8", 0.14)}`,
                  background: `linear-gradient(135deg, ${alpha("#1d4ed8", 0.08)} 0%, rgba(255,255,255,0.98) 100%)`
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha("#1d4ed8", 0.16),
                      mx: "auto",
                      mb: 1.2
                    }}
                  >
                    <DoneAllRoundedIcon sx={{ color: "#1d4ed8" }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
                    {users.filter((u) => u.status === "ACTIVE").length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 2.4,
                  border: `2px solid ${alpha("#ed6c02", 0.14)}`,
                  background: `linear-gradient(135deg, ${alpha("#ed6c02", 0.08)} 0%, rgba(255,255,255,0.98) 100%)`
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha("#ed6c02", 0.16),
                      mx: "auto",
                      mb: 1.2
                    }}
                  >
                    <LockRoundedIcon sx={{ color: "#ed6c02" }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
                    {users.filter((u) => u.status === "PENDING").length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending Approval
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabbed User List */}
          <Card
            sx={{
              borderRadius: 3.2,
              border: `1px solid rgba(148, 163, 184, 0.14)`
            }}
          >
            <Box sx={{ borderBottom: `1px solid rgba(148, 163, 184, 0.14)` }}>
              <Tabs
                value={tabValue}
                onChange={(_, value) => setTabValue(value)}
                sx={{
                  "& .MuiTabs-indicator": {
                    height: 3,
                    bgcolor: "primary.main"
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    minHeight: 60
                  }
                }}
              >
                <Tab label={`Agents (${agents.length})`} />
                <Tab label={`Clients (${clients.length})`} />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 2.4 }}>
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <Grid key={agent.id} size={{ xs: 12, md: 6, lg: 4 }}>
                        <UserCard user={agent} />
                      </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: "center",
                          borderRadius: 2.4,
                          border: `2px dashed rgba(148, 163, 184, 0.24)`,
                          background: "rgba(248,250,252,0.6)"
                        }}
                      >
                        <SecurityRoundedIcon
                          sx={{
                            fontSize: "3rem",
                            color: "text.disabled",
                            mb: 1
                          }}
                        />
                        <Typography color="text.secondary">
                          No agents created yet. Click "Create User" to add your first agent.
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={2}>
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <Grid key={client.id} size={{ xs: 12, md: 6, lg: 4 }}>
                        <UserCard user={client} />
                      </Grid>
                    ))
                  ) : (
                    <Grid size={{ xs: 12 }}>
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: "center",
                          borderRadius: 2.4,
                          border: `2px dashed rgba(148, 163, 184, 0.24)`,
                          background: "rgba(248,250,252,0.6)"
                        }}
                      >
                        <GroupsRoundedIcon
                          sx={{
                            fontSize: "3rem",
                            color: "text.disabled",
                            mb: 1
                          }}
                        />
                        <Typography color="text.secondary">
                          No clients created yet. Click "Create User" to add your first client.
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Create User Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => {
              setOpenDialog(false);
              setError(null);
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3.2,
                backgroundImage: "none"
              }
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 800,
                fontSize: "1.3rem",
                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.88)} 100%)`,
                color: "#fff",
                pb: 2.4
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonAddRoundedIcon />
                <span>Create New User</span>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 2.4 }}>
              <Stack spacing={2.2}>
                {error && <Alert severity="error">{error}</Alert>}

                {/* User Type Selection */}
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#102a43" }}>
                    User Role
                  </Typography>
                  <Select
                    value={userType}
                    onChange={(e) => {
                      setUserType(e.target.value as "AGENT" | "CLIENT");
                      setFormData({ ...formData, role: e.target.value as "AGENT" | "CLIENT" });
                    }}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="AGENT">
                      🔐 Agent (Field Staff / Operations)
                    </MenuItem>
                    <MenuItem value="CLIENT">
                      👤 Client (Member / Customer)
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Description */}
                <Alert
                  severity="info"
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {userType === "AGENT" ? "Agent Account" : "Client Account"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userType === "AGENT"
                      ? "Operational staff with access to society workflows and member servicing tools."
                      : "Member account for personal banking, deposits, and account management."}
                  </Typography>
                </Alert>

                {/* Form Fields */}
                <TextField
                  label="Full Name"
                  placeholder="Enter full name"
                  fullWidth
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />

                <TextField
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <TextField
                  label="Username"
                  placeholder="Choose username"
                  fullWidth
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />

                <TextField
                  label="Password"
                  type="password"
                  placeholder="Set initial password"
                  fullWidth
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.4, pt: 0 }}>
              <Button
                onClick={() => {
                  setOpenDialog(false);
                  setError(null);
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                variant="contained"
                disabled={loading || !formData.fullName || !formData.email || !formData.username || !formData.password}
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Container>
    </Box>
  );
}
