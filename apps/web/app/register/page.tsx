"use client";

import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { getBillingPlans, registerSociety } from "@/shared/api/client";
import { getDefaultDashboardPath, setSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { toast } from "@/shared/ui/toast";
import type { BillingPlansResponse, PaymentMethod, RegisterAccountType, Society, SubscriptionPlan } from "@/shared/types";

const accountTabs: Array<{ label: string; value: RegisterAccountType }> = [
  { label: "Society", value: "SOCIETY" }
];

const paymentMethodOptions: PaymentMethod[] = ["UPI", "DEBIT_CARD", "CREDIT_CARD", "NET_BANKING"];
const PENDING_AVATAR_KEY = "infopath_pending_avatar";

function calculatePasswordStrength(password: string): { score: number; label: string; tone: string } {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", tone: "#d32f2f" };
  if (score <= 2) return { score: 2, label: "Fair", tone: "#ed6c02" };
  if (score <= 3) return { score: 3, label: "Good", tone: "#0288d1" };
  if (score <= 4) return { score: 4, label: "Strong", tone: "#2e7d32" };
  return { score: 5, label: "Very Strong", tone: "#1b5e20" };
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read image."));
    };

    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
}

function getAccountCopy() {
  return {
    title: "Institutional Enrollment",
    body: "Register your society as a primary institution owner. Gain executive control over operations, members, and internal governance after administrative verification.",
    chips: ["Society Primary Owner", "Executive Control", "Institutional Management"]
  };
}

function generateSocietyCode(societyName: string) {
  const base = societyName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) {
    return `SOC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  return base.length > 12 ? base.slice(0, 12) : base;
}

function generateSocietyUsername(societyName: string) {
  const slug = societyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 15);

  if (!slug) return "";
  return `adm_${slug}`;
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [accountType, setAccountType] = useState<RegisterAccountType>("SOCIETY");
  const [fixedAccountType] = useState<RegisterAccountType>("SOCIETY");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("FREE");
  const [planExplicit, setPlanExplicit] = useState(false);
  const [billingPlans, setBillingPlans] = useState<BillingPlansResponse | null>(null);
  const [billingPlansLoading, setBillingPlansLoading] = useState(true);
  const [billingMethod, setBillingMethod] = useState<PaymentMethod>("UPI");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [societyName, setSocietyName] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  const premiumPlan = null;
  const premiumMonthlyPrice = null;
  const currency = billingPlans?.currency ?? "INR";
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }),
    [currency]
  );
  const accountCopy = useMemo(() => getAccountCopy(), []);
  const accountHint = "Society admins get the complete institution surface with settings, branches, reports, monitoring, and all authorized modules. After approval by Superadmin, you can create Agent and Client accounts.";

  const visibleAccountTabs = accountTabs;
  const submitLabel = "Submit Enrollment Request";

  useEffect(() => {
    // Society-only registration flow
    setAccountType("SOCIETY");
  }, []);

  useEffect(() => {
    const planParam = searchParams.get("plan");

    if (planParam === "FREE" || planParam === "PREMIUM") {
      setSelectedPlan(planParam);
      setPlanExplicit(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (accountType === "SOCIETY") {
      if (!planExplicit) {
        setSelectedPlan("FREE");
      }

      return;
    }

    setSelectedPlan("FREE");
    setPlanExplicit(false);
  }, [accountType, planExplicit]);

  useEffect(() => {
    setBillingPlansLoading(false);
  }, []);


  async function onAvatarSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file only");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Please upload an image smaller than 4 MB");
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setAvatarDataUrl(dataUrl);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to read the selected image");
    }
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    // Username is autogenerated from society name, so no explicit validation needed unless it's for non-society flows
    // which are currently disabled.
    if (accountType !== "SOCIETY" && !username.trim()) {
      nextErrors.username = "Username is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!societyName.trim()) {
      nextErrors.societyName = "Society Name is required";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function clearPendingAvatar() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(PENDING_AVATAR_KEY);
  }

  function persistPendingAvatar() {
    if (typeof window === "undefined") {
      return;
    }

    if (avatarDataUrl) {
      window.localStorage.setItem(PENDING_AVATAR_KEY, avatarDataUrl);
    } else {
      window.localStorage.removeItem(PENDING_AVATAR_KEY);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!navigator.onLine) {
      setError("You are offline. Please connect to the internet to create account.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim() || generateSocietyUsername(societyName),
        password,
        fullName: fullName.trim(),
      };
      const societyCodePayload = generateSocietyCode(societyName);

      function toNullableNumber(val: string) {
        const parsed = Number(val);
        return isNaN(parsed) || !val.trim() ? undefined : parsed;
      }

      await registerSociety({
        ...payload,
        societyCode: societyCodePayload,
        societyName: societyName.trim()
      });

      clearPendingAvatar();

      toast.success(`Society registered successfully! Your designated administrative handle is @${payload.username}. Please wait while the platform administrator verifies your institution (typically 1-2 business days).`);
      router.push("/login?from=register");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create account";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Card className="surface-vibrant fade-rise" sx={{ overflow: "hidden", borderRadius: 4 }}>
        <Grid container>
          <Grid
            size={{ xs: 12, lg: 4.7 }}
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
            <Stack spacing={2.2} sx={{ height: "100%" }}>
              <Chip label="Secure Onboarding" sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />

              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1 }}>
                  {accountCopy.title}
                </Typography>
                <Typography sx={{ mt: 1.1, color: "rgba(255,255,255,0.88)" }}>{accountCopy.body}</Typography>
              </Box>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {accountCopy.chips.map((label) => (
                  <Chip key={label} label={label} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                ))}
              </Stack>

              <Box
                sx={{
                  p: 1.8,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.16)",
                  bgcolor: "rgba(7, 16, 34, 0.18)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)" }}>
                  Access Guidance
                </Typography>
                <Typography sx={{ mt: 0.6, fontWeight: 700 }}>{accountHint}</Typography>
                <Typography variant="body2" sx={{ mt: 0.9, color: "rgba(255,255,255,0.8)" }}>
                  Registration stays role-based from the start, so members, agents, and society owners land in the right surface without extra setup.
                </Typography>
              </Box>

              <Stack spacing={1.1}>
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 2.8,
                    bgcolor: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.12)"
                  }}
                >
                  <Stack direction="row" spacing={1.1} alignItems="center">
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.18)" }}>
                      <ApartmentRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Society-aware onboarding</Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Join an existing society or create a fresh institution owner account.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>

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

          <Grid size={{ xs: 12, lg: 7.3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.8 } }}>
              <Stack spacing={2.4}>
                <Box>
                  <Typography variant="h4" className="section-title" sx={{ fontSize: { xs: "1.75rem", md: "2.1rem" }, fontWeight: 900 }}>
                    Society Enrollment Portal
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720, lineHeight: 1.6 }}>
                    This portal is strictly for creating new <strong>Society Administrator</strong> accounts. Individual accounts for Clients and Agents are provisioned internally from within your dedicated society dashboard once your institution is verified.
                  </Typography>
                </Box>

                <Tabs
                  value={accountType}
                  onChange={(_, value: RegisterAccountType) => {
                    if (fixedAccountType !== "SOCIETY") {
                      setAccountType(value);
                    }
                  }}
                  variant="fullWidth"
                  sx={{
                    p: 0.5,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    display: "none",
                    "& .MuiTabs-indicator": { display: "none" },
                    "& .MuiTab-root": {
                      minHeight: 46,
                      borderRadius: 2.2,
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
                  {visibleAccountTabs.map((item) => (
                    <Tab key={item.value} value={item.value} label={item.label} />
                  ))}
                </Tabs>

                {/* Society Registration Info Banner */}
                <Box
                  sx={{
                    p: 2.8,
                    borderRadius: 4,
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)"
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "primary.main", color: "#fff", display: "flex" }}>
                        <ApartmentRoundedIcon fontSize="small" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
                        Operational Framework
                      </Typography>
                    </Stack>
                    
                    <Stack spacing={1.5}>
                      {[
                        { step: 1, text: "Platform identifies institutional context for verification." },
                        { step: 2, text: "Executive dashboard provisioned for society owner." },
                        { step: 3, text: "Sub-accounts (Agents/Clients) managed internally." }
                      ].map((item) => (
                        <Stack key={item.step} direction="row" spacing={2} alignItems="flex-start">
                          <Typography variant="caption" sx={{ mt: 0.3, fontWeight: 900, color: "primary.main", bgcolor: "rgba(59, 130, 246, 0.1)", px: 0.8, py: 0.2, borderRadius: 1 }}>
                            0{item.step}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                            {item.text}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Box>

                <Box component="form" onSubmit={onSubmit}>
                  <Stack spacing={3.5}>
                    {/* Phase 1: Institution Identity */}
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid rgba(15, 23, 42, 0.06)",
                        bgcolor: "rgba(255,255,255,0.45)",
                        backdropFilter: "blur(10px)"
                      }}
                    >
                      <Stack spacing={2.5}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                          Phase 01: Institution Identity
                        </Typography>
                        
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Official Society Name</Typography>
                          <TextField
                            placeholder="e.g. Skyline Cooperative Credit Society"
                            value={societyName}
                            onChange={(e) => setSocietyName(e.target.value)}
                            fullWidth
                            variant="outlined"
                            error={Boolean(formErrors.societyName)}
                            helperText={formErrors.societyName}
                            InputProps={{
                              sx: {
                                borderRadius: 2.5,
                                bgcolor: "#fff",
                                "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" }
                              },
                              startAdornment: <ApartmentRoundedIcon sx={{ mr: 1.5, color: "primary.main", fontSize: 20 }} />
                            }}
                          />
                        </Box>
                        
                        {societyName.trim() && (
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                             <Chip 
                              label={`Handle: @${generateSocietyUsername(societyName)}`} 
                              size="small" 
                              sx={{ fontWeight: 800, bgcolor: "rgba(59, 130, 246, 0.08)", color: "primary.main", borderRadius: 1.5 }} 
                            />
                             <Chip 
                              label={`Society Code: ${generateSocietyCode(societyName)}`} 
                              variant="outlined" 
                              size="small" 
                              sx={{ fontWeight: 800, color: "text.secondary", borderRadius: 1.5 }} 
                            />
                          </Stack>
                        )}
                      </Stack>
                    </Box>

                    {/* Phase 2: Administrative Security */}
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid rgba(15, 23, 42, 0.06)",
                        bgcolor: "rgba(255,255,255,0.45)",
                        backdropFilter: "blur(10px)"
                      }}
                    >
                      <Stack spacing={2.5}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                          Phase 02: Administrative Security
                        </Typography>

                        <Grid container spacing={2.5}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Principal Administrator</Typography>
                            <TextField
                              placeholder="Full legal name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              fullWidth
                              error={Boolean(formErrors.fullName)}
                              helperText={formErrors.fullName}
                              InputProps={{
                                sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                                startAdornment: <PersonIcon sx={{ mr: 1.5, color: "primary.main", fontSize: 20 }} />
                              }}
                            />
                          </Grid>
                          
                          <Grid size={{ xs: 12, md: 12 }}>
                            <Box
                              sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: "rgba(59, 130, 246, 0.08)",
                                border: "2px solid rgba(59, 130, 246, 0.2)",
                                boxShadow: "0 8px 32px -4px rgba(59, 130, 246, 0.12)",
                                display: "flex",
                                alignItems: "center",
                                gap: 3
                              }}
                            >
                              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)" }}>
                                <VerifiedUserRoundedIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "primary.main", textTransform: "uppercase", letterSpacing: 1 }}>
                                  Unique Administrative Handle
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#334155", fontWeight: 700, mt: 0.5 }}>
                                  Use this handle to login to your dashboard. This is automatically generated from your society name.
                                </Typography>
                                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography 
                                    variant="h5" 
                                    sx={{ 
                                      fontWeight: 900, 
                                      color: "#0f172a", 
                                      fontFamily: "monospace",
                                      bgcolor: "#fff",
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: 2,
                                      border: "1px solid rgba(59, 130, 246, 0.1)"
                                    }}
                                  >
                                    {societyName ? `@${generateSocietyUsername(societyName)}` : "Waiting for identity..."}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12, md: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>Security Password</Typography>
                            <TextField
                              type={showPassword ? "text" : "password"}
                              placeholder="Access credential"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              fullWidth
                              error={Boolean(formErrors.password)}
                              helperText={formErrors.password}
                              InputProps={{
                                sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                                startAdornment: <LockIcon sx={{ mr: 1.5, color: "primary.main", fontSize: 20 }} />,
                                endAdornment: (
                                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                  </IconButton>
                                )
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3.2,
                            border: "1px solid rgba(15, 23, 42, 0.06)",
                            background: "rgba(255,255,255,0.6)"
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar src={avatarDataUrl ?? undefined} sx={{ width: 54, height: 54, bgcolor: "primary.main", fontSize: 22, fontWeight: 800 }}>
                              {fullName.trim()[0]?.toUpperCase() ?? "U"}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>Institutional Signature</Typography>
                              <Typography variant="caption" color="text.secondary">Professional seal or avatar</Typography>
                            </Box>
                            <Button component="label" variant="text" size="small" sx={{ fontWeight: 800 }} startIcon={<CloudUploadRoundedIcon />}>
                              Upload
                              <input hidden accept="image/*" type="file" onChange={onAvatarSelected} />
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>

                    {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ pt: 1 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        size="large" 
                        disabled={loading} 
                        sx={{ 
                          minWidth: 260, 
                          height: 52, 
                          borderRadius: 3, 
                          fontSize: "1rem", 
                          fontWeight: 900,
                          boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.4)"
                        }}
                      >
                        {loading ? <CircularProgress size={24} sx={{ color: "inherit" }} /> : submitLabel}
                      </Button>
                      <Button component={Link} href="/login" variant="text" sx={{ textTransform: "none", color: "text.secondary", fontWeight: 700 }}>
                        Existing enrollment? <strong style={{ color: "#2563eb" }}>&nbsp;Administrative Login</strong>
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
