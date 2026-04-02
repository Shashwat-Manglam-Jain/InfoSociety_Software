"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { login } from "@/shared/api/client";
import { getSession, setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session && session.role === "SUPER_ADMIN") {
      router.replace("/dashboard/superadmin");
    }
  }, [router]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(username, password);
      
      if (response.user.role !== "SUPER_ADMIN") {
        throw new Error("Access Denied: High-level privilege required for this terminal.");
      }

      setSession({
        accessToken: response.accessToken,
        role: "SUPER_ADMIN",
        accountType: "PLATFORM",
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: null,
        subscriptionPlan: null,
        avatarDataUrl: null
      });

      toast.success("Executive terminal initialized. Accessing Platform Governance Hub.");
      router.push("/dashboard/superadmin"); 
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Authentication failed.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "grid", 
      placeItems: "center", 
      bgcolor: "bg.default",
      backgroundImage: "radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.03) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 41, 59, 0.03) 0%, transparent 40%)"
    }}>
      <Container maxWidth="sm">
        <Card sx={{ 
          borderRadius: 6, 
          boxShadow: "0 40px 100px -20px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
          position: "relative"
        }}>
          <Box sx={{ 
            height: 120, 
            bgcolor: "#0f172a", 
            display: "flex", 
            alignItems: "center", 
            px: 4, 
            color: "#fff",
            position: "relative"
          }}>
             <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  bgcolor: "rgba(255,255,255,0.1)", 
                  color: "#fff",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
                }}>
                   <AdminPanelSettingsRoundedIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                   <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>Governance Hub</Typography>
                   <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: 1.5 }}>PLATFORM EXECUTIVE TERMINAL</Typography>
                </Box>
             </Stack>
             <ShieldRoundedIcon sx={{ position: "absolute", right: 30, top: 30, fontSize: 60, opacity: 0.1, color: "#fff" }} />
          </Box>

          <CardContent sx={{ p: 5 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>Secured Initialize</Typography>
                <Typography variant="body2" color="text.secondary">Provide platform credentials to access governance and monitoring.</Typography>
              </Box>

              <form onSubmit={onSubmit}>
                <Stack spacing={3}>
                  <TextField 
                    fullWidth
                    label="Executive Handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    InputProps={{
                      sx: { borderRadius: 3 },
                      startAdornment: (
                        <InputAdornment position="start">
                           <AdminPanelSettingsRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField 
                    fullWidth
                    label="Access Key"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                      sx: { borderRadius: 3 },
                      startAdornment: (
                        <InputAdornment position="start">
                           <LockOpenRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    disabled={loading}
                    sx={{ 
                      height: 56, 
                      borderRadius: 3, 
                      fontWeight: 900,
                      bgcolor: "#0f172a",
                      "&:hover": { bgcolor: "#1e293b" },
                      boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.4)"
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "AUTHENTICATE TERMINAL"}
                  </Button>
                </Stack>
              </form>

              <Typography variant="caption" sx={{ textAlign: "center", color: "text.disabled", display: "block" }}>
                Unauthorized access to this terminal is strictly monitored. 
                IP and session logs are transmitted to platform audit system.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
