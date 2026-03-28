"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { login } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";
import type { UserRole } from "@/shared/types";

const roleTabs: { label: string; value: UserRole }[] = [
  { label: "Client", value: "CLIENT" },
  { label: "Agent", value: "AGENT" },
  { label: "Society", value: "SUPER_USER" },
  { label: "Superadmin", value: "SUPER_ADMIN" }
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const hint = useMemo(() => {
    if (role === "SUPER_ADMIN") return "Demo: superadmin / Admin@123 (Platform)";
    if (role === "SUPER_USER") return "Demo: superuser / Super@123 (Society)";
    if (role === "AGENT") return "Demo: agent1 / Agent@123";
    return "Demo: client1 / Client@123";
  }, [role]);

  function onAvatarSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file only");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function validateForm(): boolean {
    let isValid = true;
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await login(username, password);
      // Automatically derive the correct display role from the backend token
      const actualRole = response.user.role;

      setSession({
        accessToken: response.accessToken,
        role: actualRole,
        accountType: actualRole === "SUPER_ADMIN" ? "PLATFORM" : actualRole === "SUPER_USER" ? "SOCIETY" : actualRole,
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: response.user.society?.code ?? null,
        subscriptionPlan: response.user.subscription?.plan ?? null,
        avatarDataUrl
      });

      toast.success(`Welcome back, ${response.user.fullName}!`);
      router.push("/dashboard");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Login failed";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Card className="surface-vibrant fade-rise hover-lift" sx={{ overflow: "hidden" }}>
        <Grid container>
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              background: (theme) =>
                `linear-gradient(165deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.primary.light} 100%)`,
              color: "#fff",
              p: { xs: 2.2, md: 3.2 }
            }}
          >
            <Chip label="Secure Login" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#fff", mb: 1.1 }} />
            <Typography variant="h5" sx={{ color: "#fff" }}>
              {role === "CLIENT" && "Client Dashboard Access"}
              {role === "AGENT" && "Agent Workspace Access"}
              {role === "SUPER_USER" && "Society Admin Interface"}
              {role === "SUPER_ADMIN" && "Platform Control Center"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.86)", mt: 0.8, mb: 1.6 }}>
              {role === "CLIENT" && "View your passbook and manage your personal accounts securely."}
              {role === "AGENT" && "Access the collection portal and operational banking features."}
              {role === "SUPER_USER" && "Manage your branches, customer profiles, and society operations."}
              {role === "SUPER_ADMIN" && "System diagnostics and overarching global platform management."}
            </Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 1.6 }}>
              {role === "SUPER_USER" ? (
                <>
                  <Chip label="Admin Control" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                  <Chip label="Master Settings" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                </>
              ) : role === "CLIENT" ? (
                <>
                  <Chip label="Private Access" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                  <Chip label="Statement View" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                </>
              ) : (
                <>
                  <Chip label="Audit-ready workflows" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                  <Chip label="Quick access" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                </>
              )}
            </Stack>
            <Image
              src="/illustrations/auth-vault.svg"
              alt="Illustration of secure vault login"
              width={760}
              height={520}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} className="section-title">
                Sign In to Continue
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                Use your registered credentials and select the correct role tab.
              </Typography>

              <Tabs
                value={role}
                onChange={(_, value: UserRole) => setRole(value)}
                variant="fullWidth"
                sx={{
                  mb: 2,
                  p: 0.5,
                  borderRadius: "12px",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  "& .MuiTabs-indicator": { display: "none" },
                  "& .MuiTab-root": {
                    minHeight: 44,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 800,
                    color: "text.secondary"
                  },
                  "& .MuiTab-root.Mui-selected": {
                    color: "primary.main",
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12)
                  }
                }}
              >
                {roleTabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      if (event.target.value.trim()) setUsernameError("");
                    }}
                    onBlur={() => {
                      if (!username.trim()) setUsernameError("Username is required");
                    }}
                    required
                    fullWidth
                    error={!!usernameError}
                    helperText={usernameError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (event.target.value.length >= 6) setPasswordError("");
                    }}
                    onBlur={() => {
                      if (!password) setPasswordError("Password is required");
                      else if (password.length < 6) setPasswordError("Password must be at least 6 characters");
                    }}
                    required
                    fullWidth
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                      label="Remember me"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 1.2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), borderRadius: 1 }}
                  >
                    {hint}
                  </Typography>

                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Avatar src={avatarDataUrl ?? undefined} alt="Profile preview" sx={{ width: 42, height: 42 }} />
                    <Box>
                      <Button component="label" variant="outlined" size="small">
                        Upload Login Image
                        <input hidden accept="image/*" type="file" onChange={onAvatarSelected} />
                      </Button>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Optional. Used as your dashboard avatar.
                      </Typography>
                    </Box>
                  </Stack>

                  {error ? <Alert severity="error">{error}</Alert> : null}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ position: "relative" }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <Button component={Link} href="/register" variant="text" sx={{ textTransform: "none" }}>
                    Don't have an account? <strong>&nbsp;Create free account</strong>
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

    </Container>
  );
}
