"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import LockIcon from "@mui/icons-material/Lock";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha, useTheme } from "@mui/material/styles";
import { getPublicSocieties, login } from "@/shared/api/client";
import { getDefaultDashboardPath, getSession, setSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getLoginPageCopy } from "@/shared/i18n/login-copy";
import { getCachedPublicSocieties, setCachedPublicSocieties } from "@/shared/public/public-data-cache";
import { toast } from "@/shared/ui/toast";
import type { Society, UserRole } from "@/shared/types";

function matchesSocietyQuery(society: Society, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return (
    society.name.toLowerCase().includes(normalizedQuery) ||
    society.code.toLowerCase().includes(normalizedQuery) ||
    society.registrationState?.toLowerCase().includes(normalizedQuery)
  );
}

function findExactSocietyMatch(societies: Society[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;
  return societies.find(s => s.name.toLowerCase() === normalizedQuery || s.code.toLowerCase() === normalizedQuery) ?? null;
}

function resolveSafeRedirect(target: string | null) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return null;
  return target;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getLoginPageCopy(locale);
  const isDark = theme.palette.mode === "dark";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [societySearch, setSocietySearch] = useState("");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [societiesLoading, setSocietiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [societyLookupError, setSocietyLookupError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [societyCodeError, setSocietyCodeError] = useState("");

  const selectedRole: UserRole = "SUPER_USER";

  useEffect(() => {
    const session = getSession();
    if (session?.role === "SUPER_USER") {
      router.replace(getDefaultDashboardPath("SOCIETY", session.requiresPasswordChange, session.allowedModuleSlugs));
      return;
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    async function loadSocieties() {
      const cached = getCachedPublicSocieties();
      if (cached && active) {
        setSocieties([...cached].sort((a, b) => a.name.localeCompare(b.name)));
        setSocietiesLoading(false);
      }

      try {
        const response = await getPublicSocieties();
        if (!active) return;
        setSocieties([...response].sort((a, b) => a.name.localeCompare(b.name)));
        setCachedPublicSocieties(response);
      } catch (err) {
        console.error("Failed to load societies", err);
        if (active) setSocietyLookupError(copy.lookupError);
      } finally {
        if (active) setSocietiesLoading(false);
      }
    }
    loadSocieties();
    return () => { active = false; };
  }, [copy.lookupError]);

  useEffect(() => {
    const nextUsername = searchParams.get("username")?.trim();
    const nextCode = searchParams.get("societyCode")?.trim().toUpperCase();
    if (nextUsername) setUsername(nextUsername);
    if (nextCode) {
      const match = societies.find(s => s.code.toUpperCase() === nextCode) ?? null;
      if (match) {
        setSelectedSociety(match);
        setSocietySearch(match.name);
      }
    }
  }, [searchParams, societies]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUsernameError("");
    setPasswordError("");
    setSocietyCodeError("");

    const resolvedSociety = selectedSociety ?? findExactSocietyMatch(societies, societySearch);
    const codeToUse = resolvedSociety?.code || societySearch;

    if (!codeToUse) {
      setSocietyCodeError("Please select or enter a society code");
      return;
    }
    if (!username.trim()) {
      setUsernameError(copy.validations.usernameRequired);
      return;
    }
    if (!password) {
      setPasswordError(copy.validations.passwordRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await login(username, password, codeToUse, selectedRole, aadhaarLast4 || undefined, "ADMIN");
      await setSession({
        accessToken: response.accessToken,
        role: response.user.role,
        accountType: "SOCIETY",
        username: response.user.username,
        fullName: response.user.fullName,
        societyCode: response.user.society?.code ?? null,
        subscriptionPlan: response.user.subscription?.plan ?? null,
        avatarDataUrl: null,
        requiresPasswordChange: response.user.requiresPasswordChange,
        allowedModuleSlugs: response.user.allowedModuleSlugs ?? []
      });

      const redirectTarget = resolveSafeRedirect(searchParams.get("redirect"));
      const dashboardPath = getDefaultDashboardPath("SOCIETY", response.user.requiresPasswordChange, response.user.allowedModuleSlugs);
      toast.success(copy.submitSuccess.replace("{{name}}", response.user.fullName));
      router.replace(redirectTarget ?? dashboardPath);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.submitError;
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  const formShellSx = {
    border: `1px solid ${isDark ? alpha("#cbd5e1", 0.18) : "rgba(15, 23, 42, 0.08)"}`,
    bgcolor: isDark ? alpha("#0f172a", 0.7) : "rgba(255,255,255,0.45)",
    backdropFilter: "blur(12px)"
  } as const;
  
  const fieldLabelSx = {
    mb: 1.2,
    fontWeight: 700,
    color: isDark ? "rgba(226, 232, 240, 0.96)" : "#1e293b"
  } as const;

  const inputShellSx = {
    borderRadius: 2.5,
    bgcolor: isDark ? alpha("#0f172a", 0.92) : "#fff",
    "& fieldset": { borderColor: isDark ? alpha("#94a3b8", 0.28) : "rgba(15, 23, 42, 0.12)" }
  } as const;

  const resolvedSociety = selectedSociety ?? findExactSocietyMatch(societies, societySearch);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Card sx={{ overflow: "hidden", borderRadius: 2 }}>
        <Grid container>
          <Grid size={{ xs: 12, md: 5 }} sx={{ p: 4, bgcolor: "#0f172a", color: "#fff" }}>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={800}>{copy.leftPanel.title}</Typography>
              <Typography sx={{ opacity: 0.8 }}>{copy.leftPanel.description}</Typography>
              <Image src="/illustrations/auth-vault.svg" alt="Auth" width={400} height={300} style={{ width: "100%", height: "auto" }} />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{copy.formPanel.title}</Typography>
                  <Typography color="text.secondary">{copy.formPanel.description}</Typography>
                </Box>

                <Box component="form" onSubmit={onSubmit} sx={{ p: 3, borderRadius: 2, ...formShellSx }}>
                  <Stack spacing={3}>
                    {!searchParams.get("societyCode") && (
                      <Box>
                        <Typography variant="subtitle2" sx={fieldLabelSx}>{copy.formPanel.searchSocietyLabel}</Typography>
                        <Autocomplete
                          options={societies}
                          filterOptions={options => options.filter(option => matchesSocietyQuery(option, societySearch))}
                          getOptionLabel={o => o.name}
                          loading={societiesLoading}
                          value={selectedSociety}
                          inputValue={societySearch}
                          onInputChange={(_, val) => setSocietySearch(val)}
                          onChange={(_, val) => {
                            setSelectedSociety(val);
                            if (val) setSocietySearch(val.name);
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              placeholder={copy.formPanel.searchPlaceholder}
                              error={!!societyCodeError}
                              helperText={societyCodeError || copy.formPanel.searchHelper}
                              InputProps={{ ...params.InputProps, sx: inputShellSx }}
                            />
                          )}
                        />
                      </Box>
                    )}

                    {(resolvedSociety || societySearch.length >= 3) && (
                      <>
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary">Society Code</Typography>
                              <Typography fontWeight={800}>{resolvedSociety?.code || societySearch}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary">Access Role</Typography>
                              <Typography fontWeight={800}>Administrative (Full Access)</Typography>
                            </Grid>
                          </Grid>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={fieldLabelSx}>Aadhaar Verification (Last 4 Digits)</Typography>
                          <TextField
                            placeholder="Required if you provided it during registration"
                            value={aadhaarLast4}
                            onChange={e => setAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            fullWidth
                            InputProps={{ sx: inputShellSx }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={fieldLabelSx}>{copy.formPanel.usernameLabel}</Typography>
                          <TextField
                            placeholder={copy.formPanel.usernamePlaceholder}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            error={!!usernameError}
                            helperText={usernameError}
                            fullWidth
                            InputProps={{ sx: inputShellSx }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={fieldLabelSx}>{copy.formPanel.passwordLabel}</Typography>
                          <TextField
                            type={showPassword ? "text" : "password"}
                            placeholder={copy.formPanel.passwordPlaceholder}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            error={!!passwordError}
                            helperText={passwordError}
                            fullWidth
                            InputProps={{
                              sx: inputShellSx,
                              endAdornment: (
                                <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              )
                            }}
                          />
                        </Box>

                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                        <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ height: 54, borderRadius: 2, fontWeight: 900 }}>
                          {loading ? copy.formPanel.authorizing : copy.formPanel.submit}
                        </Button>
                      </>
                    )}
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
