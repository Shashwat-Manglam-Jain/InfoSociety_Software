"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Stack, 
  TextField, 
  Typography, 
  IconButton, 
  InputAdornment,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { getSession, setSession, getDefaultDashboardPath } from "@/shared/auth/session";
import { changePassword } from "@/shared/api/auth";
import { toast } from "@/shared/ui/toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [session, setSessionState] = useState(getSession());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
    } else if (!s.requiresPasswordChange) {
      router.replace(getDefaultDashboardPath(s.accountType, s.requiresPasswordChange, s.allowedModuleSlugs));
    } else {
      setSessionState(s);
    }
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!session) return;

    setLoading(true);
    try {
      await changePassword(session.accessToken, currentPassword, newPassword);
      
      // Update session to reflect password change
      const updatedSession = { ...session, requiresPasswordChange: false };
      setSession(updatedSession);
      
      toast.success("Security credentials updated. Dashboard access authorized.");
      router.replace(getDefaultDashboardPath(session.accountType, false, session.allowedModuleSlugs));
    } catch (caught: any) {
      const msg = caught.message || "Failed to update security credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "radial-gradient(circle at top right, #f8fafc, #f1f5f9)"
    }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 5, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.02)" }}>
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={4}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ 
                  display: "inline-flex", 
                  p: 2, 
                  borderRadius: 4, 
                  bgcolor: "rgba(37, 99, 235, 0.1)", 
                  color: "primary.main",
                  mb: 2.5
                }}>
                  <SecurityRoundedIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}>
                  Security Verification
                </Typography>
                <Typography color="text.secondary">
                  Institutional policy requires a mandatory credential update on the first login to secure your workspace.
                </Typography>
              </Box>

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "#475569" }}>System Password (Temporary)</Typography>
                    <TextField
                      fullWidth
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Provisioned password"
                      required
                      InputProps={{
                        sx: { borderRadius: 3, bgcolor: "#fff" },
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ fontSize: 20, color: "text.disabled", mr: 1 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowCurrent(!showCurrent)} size="small" edge="end">
                              {showCurrent ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "#475569" }}>Personal Secure Password</Typography>
                    <TextField
                      fullWidth
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      InputProps={{
                        sx: { borderRadius: 3, bgcolor: "#fff" },
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ fontSize: 20, color: "text.disabled", mr: 1 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNew(!showNew)} size="small" edge="end">
                              {showNew ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "#475569" }}>Confirm New Password</Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      InputProps={{
                        sx: { borderRadius: 3, bgcolor: "#fff" },
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ fontSize: 20, color: "text.disabled", mr: 1 }} />
                          </InputAdornment>
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
                      height: 56, 
                      borderRadius: 3.5, 
                      fontWeight: 900,
                      fontSize: "1rem",
                      boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.25)"
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Secure Account & Continue"}
                  </Button>

                  <Typography variant="caption" sx={{ textAlign: "center", color: "text.secondary", mt: 2 }}>
                    Your new password must be at least 6 characters long. By securing your account, you authorize your institutional credentials for this session.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
