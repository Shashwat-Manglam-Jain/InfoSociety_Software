 "use client";

import { Suspense, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
	  InputAdornment,
	  LinearProgress,
	  MenuItem,
	  Stack,
	  Tab,
	  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { getBillingPlans, getPublicSocieties, registerAgentSelf, registerClient, registerSociety, upgradeToPremium } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { toast } from "@/shared/ui/toast";
import type { BillingPlansResponse, PaymentMethod, RegisterAccountType, Society, SubscriptionPlan } from "@/shared/types";

const accountTabs: Array<{ label: string; value: RegisterAccountType }> = [
  { label: "Client", value: "CLIENT" },
  { label: "Agent", value: "AGENT" },
  { label: "Society", value: "SOCIETY" }
];

const paymentMethodOptions: PaymentMethod[] = ["UPI", "DEBIT_CARD", "CREDIT_CARD", "NET_BANKING"];

function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "error" };
  if (score <= 2) return { score: 2, label: "Fair", color: "warning" };
  if (score <= 3) return { score: 3, label: "Good", color: "info" };
  if (score <= 4) return { score: 4, label: "Strong", color: "success" };
  return { score: 5, label: "Very Strong", color: "success" };
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [accountType, setAccountType] = useState<RegisterAccountType>("CLIENT");
  const [fixedAccountType, setFixedAccountType] = useState<RegisterAccountType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("FREE");
  const [planExplicit, setPlanExplicit] = useState(false);
  const [billingPlans, setBillingPlans] = useState<BillingPlansResponse | null>(null);
  const [billingPlansLoading, setBillingPlansLoading] = useState(true);
  const [billingMethod, setBillingMethod] = useState<PaymentMethod>("UPI");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [societiesLoading, setSocietiesLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [societyCode, setSocietyCode] = useState("");
  const [societyMode, setSocietyMode] = useState<"LIST" | "MANUAL">("LIST");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  const premiumPlan = useMemo(() => billingPlans?.plans.find((plan) => plan.id === "PREMIUM") ?? null, [billingPlans]);
  const premiumMonthlyPrice = premiumPlan?.monthlyPrice ?? null;
  const currency = billingPlans?.currency ?? "INR";
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }),
    [currency]
  );
  const accountHint = useMemo(() => {
    if (accountType === "SOCIETY") {
      return "Create a society-admin account to manage users, reports, access plans, and digital collections for the selected society.";
    }
    if (accountType === "AGENT") {
      return "Agents work inside a society and get operational workflows. Plan features and digital payments are enabled centrally by the society admin.";
    }
    return "Clients join an approved society. Plan and digital payment features are enabled centrally for all users of that society.";
  }, [accountType]);

  function generateSocietyCode(fullName: string, username: string): string {
    const base = (fullName || username)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!base) {
      return `SOC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    return base.length > 12 ? base.slice(0, 12) : base;
  }

  const visibleAccountTabs = fixedAccountType
    ? accountTabs.filter((tab) => tab.value === fixedAccountType)
    : accountTabs;

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "CLIENT" || typeParam === "AGENT" || typeParam === "SOCIETY") {
      setAccountType(typeParam);
      setFixedAccountType(typeParam);
    } else {
      setFixedAccountType(null);
    }

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
    async function loadReferenceData() {
      try {
        const societiesResponse = await getPublicSocieties();
        setSocieties(societiesResponse);
        if (societiesResponse.length > 0) {
          setSocietyCode(societiesResponse[0].code);
        }
      } catch {
        setSocieties([]);
      } finally {
        setSocietiesLoading(false);
      }

      try {
        const plans = await getBillingPlans();
        setBillingPlans(plans);
      } catch {
        setBillingPlans(null);
      } finally {
        setBillingPlansLoading(false);
      }
    }

    void loadReferenceData();
  }, []);

  useEffect(() => {
    if (!societiesLoading && societies.length === 0) {
      setSocietyMode("MANUAL");
    }
  }, [societies.length, societiesLoading]);

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!username.trim()) errors.username = "Username is required";
    else if (username.trim().length < 3) errors.username = "Username must be at least 3 characters";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters";

    if (accountType !== "SOCIETY") {
      if (!societyCode) errors.societyCode = "Please select a society";
    }

    // Society registrations are allowed with either FREE or PREMIUM plan.
    // Premium users will be upgraded after account creation.
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    console.debug("Register submit", {
      accountType,
      selectedPlan,
      societyCode,
      fullName,
      username,
      phone,
      address
    });

    if (!validateForm()) {
      console.debug("Register blocked by validation", formErrors);
      return;
    }

    if (!navigator.onLine) {
      setError("You are offline. Please connect to the internet to create account.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        societyCode: societyCode.trim()
      };

      const societyCodePayload =
        accountType === "SOCIETY"
          ? generateSocietyCode(fullName, username)
          : societyCode.trim();

      const response =
        accountType === "CLIENT"
          ? await registerClient({
              ...payload,
              societyCode: societyCodePayload,
              phone: phone.trim() || undefined,
              address: address.trim() || undefined
            })
          : accountType === "AGENT"
            ? await registerAgentSelf({
                ...payload,
                societyCode: societyCodePayload
              })
            : await registerSociety({
                ...payload,
                societyCode: societyCodePayload
              });

      let subscriptionPlan: SubscriptionPlan | null = response.user.subscription?.plan ?? null;

      if (accountType === "SOCIETY" && selectedPlan === "PREMIUM") {
        // Redirection logic to separate payment page instead of an instant inline upgrade
        toast.info("Redirecting to secure checkout for Premium activation");
        router.push(`/checkout?token=${encodeURIComponent(response.accessToken)}&method=${billingMethod}`);
        return; // Halt here so we don't proceed to dashboard directly
      }

      setSession({
        accessToken: response.accessToken,
        role: response.user.role,
        accountType,
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: response.user.society?.code ?? null,
        subscriptionPlan,
        avatarDataUrl: null
      });

      toast.success(`Account created successfully! Welcome, ${response.user.fullName}!`);
      router.push("/dashboard");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create account";
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
              p: { xs: 2.2, md: 3.4 },
              background: (theme) =>
                `linear-gradient(170deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 58%, ${theme.palette.primary.light} 100%)`,
              color: "#fff"
            }}
          >
            <Chip label="Create Account" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", mb: 1.2 }} />
            <Typography variant="h5" sx={{ color: "#fff" }}>
              {accountType === "CLIENT" && "Join Your Society Portal"}
              {accountType === "AGENT" && "Agent Portal Registration"}
              {accountType === "SOCIETY" && "Initialize Society Platform"}
            </Typography>
            <Typography sx={{ mt: 0.8, color: "rgba(255,255,255,0.86)", mb: 2 }}>
              {accountType === "CLIENT" && "Access your personal accounts, deposits, and loans securely."}
              {accountType === "AGENT" && "Process daily transactions, manage client portfolios, and track collections."}
              {accountType === "SOCIETY" && "Set up your society, configure modules, and manage branches and clients centrally."}
            </Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 1.6 }}>
              {accountType === "SOCIETY" ? (
                <>
                  <Chip label="Full Platform Access" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                  <Chip label="Branch Control" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                </>
              ) : accountType === "AGENT" ? (
                <>
                  <Chip label="Operational Workflows" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                  <Chip label="Pigmy Collections" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                </>
              ) : (
                <>
                  <Chip label="No setup fee" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                  <Chip label="Society-managed access" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                </>
              )}
            </Stack>
            <Image
              src="/illustrations/insights-panel.svg"
              alt="Illustration of plan and insights panel"
              width={760}
              height={500}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} className="section-title">
                Create Your Account
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.8, mb: 2 }}>
                Select account type, choose society, and start with role-specific access.
              </Typography>

              <Tabs
                value={accountType}
                onChange={(_, value: RegisterAccountType) => {
                  if (fixedAccountType) return;
                  setAccountType(value);
                }}
                variant="fullWidth"
                sx={{
                  mb: 1.5,
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
{visibleAccountTabs.map((item) => (
                  <Tab key={item.value} value={item.value} label={item.label} />
                ))}
              </Tabs>

	              <Alert severity="info" sx={{ mb: 2 }}>
	                {accountHint}
	              </Alert>

	              {accountType === "SOCIETY" ? (
	                <Box
	                  sx={(theme) => ({
	                    mb: 2,
	                    p: 1.6,
	                    borderRadius: "14px",
	                    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
	                    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.06 : 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
	                  })}
	                >
	                  <Stack spacing={1}>
	                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
	                      {t("register.plan.title")}
	                    </Typography>
	                    <Typography variant="body2" color="text.secondary">
	                      {t("register.plan.subtitle")}
	                    </Typography>

	                    <ToggleButtonGroup
	                      value={selectedPlan}
	                      exclusive
	                      onChange={(_, value: SubscriptionPlan | null) => {
		                        if (!value) return;
		                        setSelectedPlan(value);
		                        setPlanExplicit(true);
	                      }}
	                      sx={{
	                        mt: 0.5,
	                        "& .MuiToggleButton-root": {
	                          flex: 1,
	                          borderRadius: "12px",
	                          textTransform: "none",
	                          fontWeight: 800
	                        }
	                      }}
	                    >
                      <ToggleButton value="FREE" aria-label="Common (Free)">
                        <Stack spacing={0.1} alignItems="flex-start">
                          <Typography variant="body2" sx={{ fontWeight: 900, lineHeight: 1.1, opacity: 0.6 }}>
                            {t("register.plan.free")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                            {currencyFormatter.format(0)}/mo
                          </Typography>
                        </Stack>
                      </ToggleButton>
                      <ToggleButton value="PREMIUM" aria-label="Premium (Monthly)" disableRipple>

	                        <Stack spacing={0.1} alignItems="flex-start">
	                          <Typography variant="body2" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
	                            {t("register.plan.premium")}
	                          </Typography>
	                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
	                            {premiumMonthlyPrice !== null
	                              ? `${currencyFormatter.format(premiumMonthlyPrice)}/mo`
	                              : billingPlansLoading
	                                ? "Loading..."
	                                : "Monthly"}
	                          </Typography>
	                        </Stack>
	                      </ToggleButton>
	                    </ToggleButtonGroup>

	                    {selectedPlan === "PREMIUM" ? (
	                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
	                        <TextField
	                          select
	                          size="small"
	                          label={t("register.plan.payment_method")}
	                          value={billingMethod}
	                          onChange={(event) => setBillingMethod(event.target.value as PaymentMethod)}
	                          sx={{ minWidth: { xs: "100%", sm: 220 } }}
	                        >
	                          {paymentMethodOptions.map((option) => (
	                            <MenuItem key={option} value={option}>
	                              {option.replaceAll("_", " ")}
	                            </MenuItem>
	                          ))}
	                        </TextField>
	                        <Alert severity="warning" sx={{ flex: 1 }}>
	                          {t("register.plan.premium_note")}
	                        </Alert>
	                      </Stack>
	                    ) : null}
	                  </Stack>
	                </Box>
	              ) : null}

	              <Box component="form" onSubmit={onSubmit}>
	                <Stack spacing={1.5}>
                  <TextField
                    label="Full Name"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      if (event.target.value.trim()) setFormErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    required
                    fullWidth
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      if (event.target.value.trim().length >= 3) setFormErrors((prev) => ({ ...prev, username: "" }));
                    }}
                    required
                    fullWidth
                    error={!!formErrors.username}
                    helperText={formErrors.username || "3+ characters"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <Box>
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (event.target.value.length >= 8) setFormErrors((prev) => ({ ...prev, password: "" }));
                      }}
                    required
                    fullWidth
                    error={!!formErrors.password}
                    helperText={formErrors.password || "Minimum 8 characters"}
                    InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: "text.secondary" }} />
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
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    {password && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ flex: 1 }}>
                            Strength:
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(passwordStrength.score / 5) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor:
                                passwordStrength.color === "error"
                                  ? "#d32f2f"
                                  : passwordStrength.color === "warning"
                                  ? "#f57c00"
                                  : passwordStrength.color === "info"
                                  ? "#1976d2"
                                  : "#388e3c"
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                  {accountType !== "SOCIETY" ? (
                    <>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ToggleButtonGroup
                          size="small"
                          exclusive
                          value={societyMode}
                          onChange={(_, value: "LIST" | "MANUAL" | null) => {
                            if (!value) return;
                            setSocietyMode(value);
                          }}
                          aria-label="Society entry mode"
                        >
                          <ToggleButton value="LIST" disabled={societiesLoading || societies.length === 0}>
                            Select
                          </ToggleButton>
                          <ToggleButton value="MANUAL">Manual</ToggleButton>
                        </ToggleButtonGroup>
                      </Stack>

                      {societyMode === "LIST" ? (
                        <FormControl required fullWidth error={!!formErrors.societyCode} disabled={loading || societiesLoading}>
                          <TextField
                            select
                            label="Select Society"
                            value={societyCode}
                            onChange={(event) => {
                              setSocietyCode(event.target.value);
                              if (event.target.value.trim()) setFormErrors((prev) => ({ ...prev, societyCode: "" }));
                            }}
                            fullWidth
                            helperText={
                              formErrors.societyCode ||
                              (accountType === "CLIENT"
                                ? "Select the society to join"
                                : "Select the society to represent")
                            }
                            error={!!formErrors.societyCode}
                          >
                            <MenuItem value="" disabled>
                              Choose a society
                            </MenuItem>
                            {societies.length > 0 ? (
                              societies.map((society) => (
                                <MenuItem key={society.id} value={society.code}>
                                  {society.name} ({society.code})
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem value="" disabled>
                                No societies available
                              </MenuItem>
                            )}
                          </TextField>
                        </FormControl>
                      ) : (
                        <TextField
                          label="Society Code"
                          value={societyCode}
                          onChange={(event) => {
                            setSocietyCode(event.target.value.toUpperCase());
                            if (event.target.value.trim()) setFormErrors((prev) => ({ ...prev, societyCode: "" }));
                          }}
                          placeholder="e.g., SOC-HO"
                          fullWidth
                          error={!!formErrors.societyCode}
                          helperText={
                            formErrors.societyCode ||
                            (accountType === "CLIENT"
                              ? "Enter the society code to join"
                              : "Enter the society code to represent")
                          }
                        />
                      )}

                      {societyMode === "LIST" && societiesLoading ? (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            Loading societies...
                          </Typography>
                        </Stack>
                      ) : null}

                      {societyMode === "LIST" && !societiesLoading && societies.length === 0 ? (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          No active societies available. Please use manual society code entry.
                        </Alert>
                      ) : null}
                    </>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Society code will be auto-generated; existing society selection is not required in this mode.
                    </Alert>
                  )}

                  {accountType === "CLIENT" ? (
                    <>
                      <TextField
                        label="Phone (Optional)"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Address (Optional)"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </>
                  ) : null}

                  {error ? <Alert severity="error">{error}</Alert> : null}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={
                      loading ||
                      (accountType !== "SOCIETY" && societyMode === "LIST" && (societiesLoading || societies.length === 0))
                    }
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                        Creating account...
                      </>
                    ) : accountType === "SOCIETY" ? (
                      "Create Society Account"
                    ) : accountType === "AGENT" ? (
                      "Create Agent Account"
                    ) : (
                      "Create Client Account"
                    )}
                  </Button>

                  <Button component={Link} href="/login" variant="text" sx={{ textTransform: "none" }}>
                    Already have an account? <strong>&nbsp;Sign in</strong>
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
