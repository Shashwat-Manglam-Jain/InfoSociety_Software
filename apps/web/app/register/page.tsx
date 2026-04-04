"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
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
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { getBillingPlans, getPublicSocieties, registerSociety } from "@/shared/api/client";
import { toast } from "@/shared/ui/toast";

function generateSocietyCode(societyName: string) {
  const base = societyName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) {
    return "";
  }

  return base.length > 12 ? base.slice(0, 12) : base;
}

function generateSocietyUsername(fullName: string) {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);

  if (!slug) {
    return "";
  }

  return slug;
}

function formatPlanPrice(monthlyPrice: number | null) {
  if (monthlyPrice == null) {
    return "Loading...";
  }

  if (monthlyPrice <= 0) {
    return "₹0";
  }

  return `₹${monthlyPrice.toLocaleString("en-IN")}/month`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [societyName, setSocietyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [approvedSocietyCount, setApprovedSocietyCount] = useState<number | null>(null);
  const [premiumMonthlyPrice, setPremiumMonthlyPrice] = useState<number | null>(null);
  const [platformSnapshotError, setPlatformSnapshotError] = useState<string | null>(null);

  const generatedCode = useMemo(() => generateSocietyCode(societyName), [societyName]);
  const generatedUsername = useMemo(() => generateSocietyUsername(fullName), [fullName]);

  useEffect(() => {
    let active = true;

    async function loadPlatformSnapshot() {
      try {
        const [societies, billing] = await Promise.all([getPublicSocieties(), getBillingPlans()]);

        if (!active) {
          return;
        }

        setApprovedSocietyCount(societies.length);
        setPremiumMonthlyPrice(billing.plans.find((plan) => plan.id === "PREMIUM")?.monthlyPrice ?? null);
        setPlatformSnapshotError(null);
      } catch (caught) {
        if (!active) {
          return;
        }

        setPlatformSnapshotError(caught instanceof Error ? caught.message : "Unable to load live platform details.");
      }
    }

    void loadPlatformSnapshot();

    return () => {
      active = false;
    };
  }, []);

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!societyName.trim()) {
      nextErrors.societyName = "Society name is required";
    }

    if (!fullName.trim()) {
      nextErrors.fullName = "Administrator name is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!generatedCode || !generatedUsername) {
      setError("Please enter both the society name and administrator name to generate the login details.");
      return;
    }

    setLoading(true);

    try {
      await registerSociety({
        username: generatedUsername,
        password,
        fullName: fullName.trim(),
        societyCode: generatedCode,
        societyName: societyName.trim()
      });

      toast.success(
        `Enrollment submitted. Society code ${generatedCode} and username @${generatedUsername} will be used after approval.`
      );
      router.push("/login?from=register");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to submit enrollment";
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
              }
            }}
          >
            <Stack spacing={2.2} sx={{ height: "100%" }}>
              <Chip label="Society Enrollment" sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />

              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1 }}>
                  Register Your Society
                </Typography>
                <Typography sx={{ mt: 1.1, color: "rgba(255,255,255,0.88)" }}>
                  This form is only for creating the main society workspace account. Agents and clients are created later from inside the approved society dashboard.
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                <Chip label="Society Only" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip label="Approval Required" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip label="Admin Username From Name" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.16)",
                  bgcolor: "rgba(7, 16, 34, 0.2)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Stack spacing={1.3}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 800, letterSpacing: 1 }}>
                    What Happens Next
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    1. Submit the society name, main administrator, and password.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    2. Platform superadmin reviews and approves the society.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    3. After approval, you log in at <strong>/login</strong> and create your internal users there.
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Image
                  src="/illustrations/insights-panel.svg"
                  alt="Illustration of onboarding and account setup"
                  width={760}
                  height={500}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={2.6}>
                <Box>
                  <Typography variant="h4" className="section-title" sx={{ fontSize: { xs: "1.75rem", md: "2.05rem" } }}>
                    Society Enrollment Form
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 640 }}>
                    Only the core details are required here. The registration page now also pulls the current platform snapshot from the API so you can see the live network before you enroll.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2.4,
                    borderRadius: 4,
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    bgcolor: "rgba(255,255,255,0.6)"
                  }}
                >
                  <Stack spacing={1.4}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                      Live Platform Snapshot
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Box sx={{ flex: 1, p: 1.8, borderRadius: 3, bgcolor: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>Approved Societies</Typography>
                        <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: "#0f172a" }}>
                          {approvedSocietyCount == null ? "Loading..." : approvedSocietyCount.toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1.8, borderRadius: 3, bgcolor: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>Premium Plan</Typography>
                        <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: "#0f172a" }}>
                          {formatPlanPrice(premiumMonthlyPrice)}
                        </Typography>
                      </Box>
                    </Stack>
                    {platformSnapshotError ? (
                      <Typography variant="body2" color="error">
                        {platformSnapshotError}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        These values are loaded live from the API, so the registration page stays aligned with the current platform setup.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 2.4,
                    borderRadius: 4,
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    bgcolor: "rgba(255,255,255,0.6)"
                  }}
                >
                  <Stack spacing={1.4}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                      Generated Login Details
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Box sx={{ flex: 1, p: 1.8, borderRadius: 3, bgcolor: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>Society Code</Typography>
                        <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>
                          {generatedCode || "Waiting for society name"}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1.8, borderRadius: 3, bgcolor: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>Admin Username</Typography>
                        <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>
                          {generatedUsername ? `@${generatedUsername}` : "Waiting for administrator name"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      The society code comes from the society name, and the first admin username comes from the administrator name you enter here.
                    </Typography>
                  </Stack>
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
                      Required Details
                    </Typography>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Society Name
                      </Typography>
                      <TextField
                        placeholder="e.g. Skyline Cooperative Credit Society"
                        value={societyName}
                        onChange={(event) => {
                          setSocietyName(event.target.value);
                          if (event.target.value.trim()) {
                            setFormErrors((prev) => ({ ...prev, societyName: "" }));
                          }
                        }}
                        fullWidth
                        error={Boolean(formErrors.societyName)}
                        helperText={formErrors.societyName || "This name is used to generate the society code."}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <ApartmentRoundedIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Main Administrator Name
                      </Typography>
                      <TextField
                        placeholder="Full name"
                        value={fullName}
                        onChange={(event) => {
                          setFullName(event.target.value);
                          if (event.target.value.trim()) {
                            setFormErrors((prev) => ({ ...prev, fullName: "" }));
                          }
                        }}
                        fullWidth
                        error={Boolean(formErrors.fullName)}
                        helperText={formErrors.fullName || "This name is used to generate the first admin username."}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <PersonIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Password
                      </Typography>
                      <TextField
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (event.target.value) {
                            setFormErrors((prev) => ({ ...prev, password: "" }));
                          }
                        }}
                        fullWidth
                        error={Boolean(formErrors.password)}
                        helperText={formErrors.password || "Use at least 8 characters for the initial society admin password."}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <LockIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />,
                          endAdornment: (
                            <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                              {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                            </IconButton>
                          )
                        }}
                      />
                    </Box>

                    {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

                    <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ height: 54, borderRadius: 3, fontWeight: 900 }}>
                      {loading ? "Submitting..." : "Submit Society Enrollment"}
                    </Button>
                  </Stack>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Already approved? <Link href="/login">Go to society login</Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Platform superadmin? <Link href="/admin">Use the admin terminal</Link>
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
