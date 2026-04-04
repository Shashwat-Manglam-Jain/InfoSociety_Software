"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Avatar,
  Grid
} from "@mui/material";
import { login, getPublicSocieties } from "@/shared/api/auth";
import { getDefaultDashboardPath, setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";
import type { Society } from "@/shared/types";

export default function AgentLoginPage() {
  const router = useRouter();
  const params = useParams() as { societyCode?: string | string[] };
  const normalizedSocietyCode = String(Array.isArray(params.societyCode) ? params.societyCode[0] : params.societyCode ?? "").toUpperCase();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [society, setSociety] = useState<Society | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/dashboard/agent");
  }, [router]);

  useEffect(() => {
    async function fetchSociety() {
      try {
        const societies = await getPublicSocieties();
        const found = societies.find((s) => s.code.toUpperCase() === normalizedSocietyCode);
        if (found) setSociety(found);
      } catch (e) {
        console.error("Failed to fetch society info", e);
      }
    }
    fetchSociety();
  }, [normalizedSocietyCode]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Credentials required");
      return;
    }

    setLoading(true);

    try {
      const response = await login(username, password, normalizedSocietyCode, "AGENT");
      const actualRole = response.user.role;

      const accountType = "AGENT";

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

      toast.success(`Welcome back, ${response.user.fullName}!`);
      router.replace(getDefaultDashboardPath(accountType, response.user.requiresPasswordChange));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Authentication failed.";
      setError(message);
      toast.error(message);
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
              background: "linear-gradient(145deg, #064e3b 0%, #065f46 100%)", // Deep forest/emerald for Agent Portal
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-20%",
                right: "-20%",
                width: "80%",
                height: "80%",
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
                zIndex: -1
              }
            }}
          >
            <Stack spacing={2.5} sx={{ height: "100%" }}>
              <Chip label="Agent Portal" sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 800 }} />

              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.15 }}>
                   {society?.name ?? "Institutional"} Operations Portal
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.88)", mt: 1.2 }}>
                   Access your dedicated operations desk for <strong>{normalizedSocietyCode}</strong>. Handle member transactions, society requests, and departmental workflows.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: "1px solid rgba(255,255,255,0.18)",
                  bgcolor: "rgba(6, 78, 59, 0.3)",
                  backdropFilter: "blur(12px)"
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "rgba(52, 211, 153, 0.2)", color: "#fff" }}>
                       <ApartmentRoundedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 800, letterSpacing: 0.5 }}>IDENTIFIER</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{normalizedSocietyCode}</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    This portal is exclusively for operational staff. Unauthorized access is monitored by the society administrator.
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Image
                  src="/illustrations/auth-secure.svg"
                  alt="Secure operational login"
                  width={600}
                  height={400}
                  style={{ width: "100%", height: "auto", display: "block", opacity: 0.9 }}
                />
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 5 } }}>
              <Stack spacing={3.5}>
                <Box>
                   <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <EngineeringRoundedIcon sx={{ color: "#065f46", fontSize: 32 }} />
                      <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>Agent Authorization</Typography>
                   </Stack>
                   <Typography color="text.secondary" sx={{ maxWidth: 500 }}>
                      Please provide your operative credentials to access the <strong>{society?.name ?? normalizedSocietyCode}</strong> administrative surface.
                   </Typography>
                </Box>

                <Box
                  component="form"
                  onSubmit={onSubmit}
                  sx={{
                    p: { xs: 2, md: 3.5 },
                    borderRadius: 4.5,
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    bgcolor: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(12px)"
                  }}
                >
                  <Stack spacing={3.2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Agent ID</Typography>
                      <TextField
                        placeholder="e.g. agt_skyline"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <EmailIcon sx={{ mr: 1, color: "#065f46", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Password</Typography>
                      <TextField
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <LockIcon sx={{ mr: 1, color: "#065f46", fontSize: 20 }} />,
                          endAdornment: (
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                            </IconButton>
                          )
                        }}
                      />
                    </Box>

                    {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large" 
                      disabled={loading}
                      sx={{ 
                        height: 54, 
                        borderRadius: 3.5, 
                        fontWeight: 900,
                        fontSize: "1rem",
                        bgcolor: "#065f46",
                        "&:hover": { bgcolor: "#064e3b" },
                        boxShadow: "0 10px 20px -5px rgba(6, 95, 70, 0.3)"
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: "inherit" }} /> : "Sign In"}
                    </Button>
                  </Stack>
                </Box>
                
                <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
                   Forget credentials? Contact your <strong>Society Administrator</strong> for recovery.
                </Typography>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
