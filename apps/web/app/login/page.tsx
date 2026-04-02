"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { login } from "@/shared/api/client";
import { getDefaultDashboardPath, setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";
import type { UserRole } from "@/shared/types";

function getRoleCopy() {
  return {
    title: "Society Admin Login",
    body: "Sign in to manage your society profile, branches, users, members, plans, accounts, lockers, and daily records from one place.",
    chips: ["Society Admin", "Branch Control", "Daily Operations"]
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const roleCopy = useMemo(() => getRoleCopy(), []);

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/dashboard/agent");
    router.prefetch("/dashboard/client");
    router.prefetch("/register");
  }, [router]);

  function validateForm() {
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await login(username, password);
      
      const actualRole = response.user.role;
      if (actualRole === "SUPER_ADMIN") {
        throw new Error("Access Denied: This portal is for society owners. Please use your dedicated administrator terminal.");
      }

      const accountType = actualRole === "SUPER_USER" ? "SOCIETY" : actualRole;

      setSession({
        accessToken: response.accessToken,
        role: actualRole,
        accountType,
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: response.user.society?.code ?? null,
        subscriptionPlan: response.user.subscription?.plan ?? null,
        avatarDataUrl: null,
        requiresPasswordChange: response.user.requiresPasswordChange,
        allowedModuleSlugs: response.user.allowedModuleSlugs ?? []
      });

      toast.success(`Welcome back, ${response.user.fullName}! Redirecting to your dashboard...`);
      router.replace(getDefaultDashboardPath(accountType, response.user.requiresPasswordChange));
    } catch (caught) {
      console.error("[Login] error", caught);
      const status = (caught as any)?.status ? `[${(caught as any).status}] ` : "";
      const message = caught instanceof Error && caught.message && !caught.message.includes("Cannot read properties")
        ? caught.message
        : "Failed to authenticate. Please check your credentials and try again.";
      
      const fullError = `${status}${message}`;
      setError(fullError);
      toast.error(fullError);
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Card className="surface-vibrant fade-rise" sx={{ overflow: "hidden", borderRadius: 4 }}>
        <Grid container>
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              p: { xs: 2.5, md: 4.5 },
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              zIndex: 1,
              background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-20%",
                right: "-20%",
                width: "80%",
                height: "80%",
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
                zIndex: -1
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-10%",
                left: "-10%",
                width: "60%",
                height: "60%",
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
                zIndex: -1
              }
            }}
          >
            <Stack spacing={2}>
              <Chip label="Secure Login" sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />

              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.12 }}>
                  {roleCopy.title}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.88)", mt: 1.1 }}>
                  {roleCopy.body}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {roleCopy.chips.map((label) => (
                  <Chip key={label} label={label} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                ))}
              </Stack>

              <Image
                src="/illustrations/auth-vault.svg"
                alt="Illustration of secure vault login"
                width={760}
                height={520}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={2.2}>
                <Box>
                  <Typography variant="h4" className="section-title" sx={{ fontSize: { xs: "1.7rem", md: "2.1rem" } }}>
                    Sign In to Continue
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 620 }}>
                    Use your society admin login to open the society dashboard.
                  </Typography>
                </Box>


                <Box
                  component="form"
                  onSubmit={onSubmit}
                  sx={{
                    p: { xs: 2, md: 3.2 },
                    borderRadius: 4,
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    bgcolor: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(12px)"
                  }}
                >
                  <Stack spacing={3}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                      Login Details
                    </Typography>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Username or Society Code</Typography>
                      <TextField
                        placeholder="e.g. superuser or SOC-001"
                        value={username}
                        onChange={(event) => {
                          setUsername(event.target.value);
                          if (event.target.value.trim()) {
                            setUsernameError("");
                          }
                        }}
                        required
                        fullWidth
                        error={Boolean(usernameError)}
                        helperText={usernameError}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ mr: 0.5, color: "primary.main", fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Password</Typography>
                      <TextField
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (event.target.value.length >= 6) {
                            setPasswordError("");
                          }
                        }}
                        required
                        fullWidth
                        error={Boolean(passwordError)}
                        helperText={passwordError}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ mr: 0.5, color: "primary.main", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                                size="small"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>

                    {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

                    <Stack spacing={2} sx={{ pt: 1 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        size="large" 
                        disabled={loading}
                        sx={{ 
                          height: 52, 
                          borderRadius: 3, 
                          fontWeight: 900,
                          fontSize: "1rem",
                          boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.4)"
                        }}
                      >
                        {loading ? <CircularProgress size={24} sx={{ color: "inherit" }} /> : "Sign In"}
                      </Button>

                      <Button component={Link} href="/register" variant="text" sx={{ textTransform: "none", color: "text.secondary", fontWeight: 700 }}>
                        New society? <strong style={{ color: "#2563eb" }}>&nbsp;Register here</strong>
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
