"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Alert, Box, Button, Card, CardContent, Chip, Container, IconButton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha, useTheme } from "@mui/material/styles";
import { getBillingPlans, getPublicSocieties, registerSociety } from "@/shared/api/client";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getRegisterPageCopy } from "@/shared/i18n/register-copy";
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

function formatPlanPrice(monthlyPrice: number | null, locale: string, copy: ReturnType<typeof getRegisterPageCopy>) {
  if (monthlyPrice == null) {
    return copy.loadingPrice;
  }

  if (monthlyPrice <= 0) {
    return copy.freePrice;
  }

  const localeTag = locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
  return `₹${monthlyPrice.toLocaleString(localeTag)}${copy.perMonthSuffix}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getRegisterPageCopy(locale);
  const isDark = theme.palette.mode === "dark";
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
  const surfaceBoxSx = {
    border: `1px solid ${isDark ? alpha("#cbd5e1", 0.18) : "rgba(15, 23, 42, 0.08)"}`,
    bgcolor: isDark ? alpha("#0f172a", 0.68) : "rgba(255,255,255,0.6)"
  } as const;
  const tileBoxSx = {
    flex: 1,
    p: 1.8,
    borderRadius: 2,
    bgcolor: isDark ? alpha("#0f172a", 0.9) : "#fff",
    border: `1px solid ${isDark ? alpha("#cbd5e1", 0.16) : "rgba(15, 23, 42, 0.08)"}`
  } as const;
  const fieldLabelSx = {
    mb: 1.2,
    fontWeight: 700,
    color: isDark ? "rgba(226, 232, 240, 0.96)" : "#1e293b"
  } as const;
  const helperTextSx = {
    color: isDark ? "rgba(148, 163, 184, 0.96)" : undefined
  } as const;
  const inputShellSx = {
    borderRadius: 2.5,
    bgcolor: isDark ? alpha("#0f172a", 0.92) : "#fff",
    color: isDark ? "#e2e8f0" : "#0f172a",
    "& input": {
      color: isDark ? "#e2e8f0" : "#0f172a"
    },
    "& input::placeholder": {
      color: isDark ? "rgba(148, 163, 184, 0.82)" : undefined,
      opacity: 1
    },
    "& .MuiSvgIcon-root": {
      color: isDark ? alpha(theme.palette.primary.light, 0.95) : theme.palette.primary.main
    },
    "& .Mui-disabled": {
      WebkitTextFillColor: isDark ? "rgba(226, 232, 240, 0.9)" : undefined
    },
    "& fieldset": {
      borderColor: isDark ? alpha("#94a3b8", 0.28) : "rgba(15, 23, 42, 0.12)"
    },
    "&:hover fieldset": {
      borderColor: isDark ? alpha("#cbd5e1", 0.45) : "rgba(15, 23, 42, 0.22)"
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main
    }
  } as const;
  const inputTextFieldSx = {
    "& .MuiFormHelperText-root": helperTextSx
  } as const;

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

        setPlatformSnapshotError(caught instanceof Error ? caught.message : copy.apiLoadError);
      }
    }

    void loadPlatformSnapshot();

    return () => {
      active = false;
    };
  }, [copy.apiLoadError]);

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!societyName.trim()) {
      nextErrors.societyName = copy.validations.societyNameRequired;
    }

    if (!fullName.trim()) {
      nextErrors.fullName = copy.validations.fullNameRequired;
    }

    if (!password) {
      nextErrors.password = copy.validations.passwordRequired;
    } else if (password.length < 8) {
      nextErrors.password = copy.validations.passwordLength;
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
      setError(copy.validations.missingGeneratedDetails);
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

      toast.success(copy.submitSuccess.replace("{{code}}", generatedCode).replace("{{username}}", generatedUsername));
      router.push("/login?from=register");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.submitError;
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Card className="surface-vibrant fade-rise" sx={{ overflow: "hidden", borderRadius: 2 }}>
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
              <Chip label={copy.leftPanel.chip} sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />

              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1 }}>
                  {copy.leftPanel.title}
                </Typography>
                <Typography sx={{ mt: 1.1, color: "rgba(255,255,255,0.88)" }}>
                  {copy.leftPanel.description}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                <Chip label={copy.leftPanel.tags[0]} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip label={copy.leftPanel.tags[1]} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip label={copy.leftPanel.tags[2]} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.16)",
                  bgcolor: "rgba(7, 16, 34, 0.2)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Stack spacing={1.3}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 800, letterSpacing: 1 }}>
                    {copy.leftPanel.nextTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    {copy.leftPanel.nextSteps[0]}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    {copy.leftPanel.nextSteps[1]}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    {copy.leftPanel.nextSteps[2]}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Image
                  src="/illustrations/insights-panel.svg"
                  alt={copy.leftPanel.imageAlt}
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
                    {copy.formPanel.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 640 }}>
                    {copy.formPanel.description}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2.4,
                    borderRadius: 1,
                    ...surfaceBoxSx
                  }}
                >
                  <Stack spacing={1.4}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                      {copy.formPanel.snapshotTitle}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Box sx={tileBoxSx}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                          {copy.formPanel.approvedSocieties}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: isDark ? "#e2e8f0" : "#0f172a" }}>
                          {approvedSocietyCount == null ? copy.loadingPrice : approvedSocietyCount.toLocaleString(locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN")}
                        </Typography>
                      </Box>
                      <Box sx={tileBoxSx}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                          {copy.formPanel.premiumPlan}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.4, fontWeight: 900, color: isDark ? "#e2e8f0" : "#0f172a" }}>
                          {formatPlanPrice(premiumMonthlyPrice, locale, copy)}
                        </Typography>
                      </Box>
                    </Stack>
                    {platformSnapshotError ? (
                      <Typography variant="body2" color="error">
                        {platformSnapshotError}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {copy.formPanel.snapshotLiveNote}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 2.4,
                    borderRadius: 1,
                    ...surfaceBoxSx
                  }}
                >
                  <Stack spacing={1.4}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                      {copy.formPanel.generatedTitle}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Box sx={tileBoxSx}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                          {copy.formPanel.societyCode}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ mt: 0.4, fontWeight: 900, color: isDark ? "#e2e8f0" : "#0f172a", fontFamily: "monospace" }}
                        >
                          {generatedCode || copy.formPanel.waitingSociety}
                        </Typography>
                      </Box>
                      <Box sx={tileBoxSx}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                          {copy.formPanel.adminUsername}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ mt: 0.4, fontWeight: 900, color: isDark ? "#e2e8f0" : "#0f172a", fontFamily: "monospace" }}
                        >
                          {generatedUsername ? `@${generatedUsername}` : copy.formPanel.waitingAdmin}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {copy.formPanel.generatedNote}
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  component="form"
                  onSubmit={onSubmit}
                  sx={{
                    p: { xs: 2, md: 3.2 },
                    borderRadius: 1,
                    ...surfaceBoxSx,
                    backdropFilter: "blur(12px)"
                  }}
                >
                  <Stack spacing={3}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.5 }}>
                      {copy.formPanel.requiredTitle}
                    </Typography>

                    <Box>
                      <Typography variant="subtitle2" sx={fieldLabelSx}>
                        {copy.formPanel.societyNameLabel}
                      </Typography>
                      <TextField
                        placeholder={copy.formPanel.societyNamePlaceholder}
                        value={societyName}
                        onChange={(event) => {
                          setSocietyName(event.target.value);
                          if (event.target.value.trim()) {
                            setFormErrors((prev) => ({ ...prev, societyName: "" }));
                          }
                        }}
                        fullWidth
                        error={Boolean(formErrors.societyName)}
                        helperText={formErrors.societyName || copy.formPanel.societyNameHelper}
                        sx={inputTextFieldSx}
                        FormHelperTextProps={{ sx: helperTextSx }}
                        InputProps={{
                          sx: inputShellSx,
                          startAdornment: <ApartmentRoundedIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={fieldLabelSx}>
                        {copy.formPanel.adminNameLabel}
                      </Typography>
                      <TextField
                        placeholder={copy.formPanel.adminNamePlaceholder}
                        value={fullName}
                        onChange={(event) => {
                          setFullName(event.target.value);
                          if (event.target.value.trim()) {
                            setFormErrors((prev) => ({ ...prev, fullName: "" }));
                          }
                        }}
                        fullWidth
                        error={Boolean(formErrors.fullName)}
                        helperText={formErrors.fullName || copy.formPanel.adminNameHelper}
                        sx={inputTextFieldSx}
                        FormHelperTextProps={{ sx: helperTextSx }}
                        InputProps={{
                          sx: inputShellSx,
                          startAdornment: <PersonIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={fieldLabelSx}>
                        {copy.formPanel.passwordLabel}
                      </Typography>
                      <TextField
                        type={showPassword ? "text" : "password"}
                        placeholder={copy.formPanel.passwordPlaceholder}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (event.target.value) {
                            setFormErrors((prev) => ({ ...prev, password: "" }));
                          }
                        }}
                        fullWidth
                        error={Boolean(formErrors.password)}
                        helperText={formErrors.password || copy.formPanel.passwordHelper}
                        sx={inputTextFieldSx}
                        FormHelperTextProps={{ sx: helperTextSx }}
                        InputProps={{
                          sx: inputShellSx,
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
                      {loading ? copy.formPanel.submitting : copy.formPanel.submit}
                    </Button>
                  </Stack>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {copy.formPanel.alreadyApproved} <Link href="/login">{copy.formPanel.goToLogin}</Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {copy.formPanel.platformAdmin} <Link href="/admin">{copy.formPanel.useAdmin}</Link>
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
