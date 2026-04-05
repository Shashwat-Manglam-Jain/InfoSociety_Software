"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { getPublicSocieties, login } from "@/shared/api/client";
import { getDefaultDashboardPath, getSession, setSession } from "@/shared/auth/session";
import { toast } from "@/shared/ui/toast";
import type { Society, UserRole } from "@/shared/types";

const societyRoleOptions: Array<{ value: UserRole; label: string; helper: string }> = [
  {
    value: "SUPER_USER",
    label: "Administrator / Authorized Society User",
    helper: "Society dashboard access is restricted by the module permissions assigned to this account."
  }
];

function matchesSocietyQuery(society: Society, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return (
    society.name.toLowerCase().includes(normalizedQuery) ||
    society.code.toLowerCase().includes(normalizedQuery) ||
    society.registrationState?.toLowerCase().includes(normalizedQuery)
  );
}

function findExactSocietyMatch(societies: Society[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  return (
    societies.find(
      (society) => society.name.toLowerCase() === normalizedQuery || society.code.toLowerCase() === normalizedQuery
    ) ?? null
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [societyCode, setSocietyCode] = useState("");
  const [societySearch, setSocietySearch] = useState("");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("SUPER_USER");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [societiesLoading, setSocietiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [societyLookupError, setSocietyLookupError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [societyCodeError, setSocietyCodeError] = useState("");

  useEffect(() => {
    const session = getSession();

    if (session?.role === "SUPER_USER") {
      router.replace(getDefaultDashboardPath("SOCIETY", session.requiresPasswordChange, session.allowedModuleSlugs));
      return;
    }

    router.prefetch("/dashboard/society");
    router.prefetch("/register");
    router.prefetch("/admin");
  }, [router]);

  useEffect(() => {
    let active = true;

    async function loadSocieties() {
      try {
        const response = await getPublicSocieties();

        if (!active) {
          return;
        }

        setSocieties([...response].sort((left, right) => left.name.localeCompare(right.name)));
        setSocietyLookupError(null);
      } catch (caught) {
        console.error("Failed to load public societies", caught);

        if (!active) {
          return;
        }

        setSocietyLookupError("Society search is temporarily unavailable. You can still enter the code manually.");
      } finally {
        if (active) {
          setSocietiesLoading(false);
        }
      }
    }

    loadSocieties();

    return () => {
      active = false;
    };
  }, []);

  function applySocietySelection(society: Society | null) {
    setSelectedSociety(society);
    setSocietySearch(society?.name ?? "");
    setSocietyCode(society?.code ?? "");
    setSocietyCodeError("");
  }

  function syncSocietyFromCode(nextCode: string) {
    const normalizedCode = nextCode.trim().toUpperCase();
    const matchingSociety = societies.find((society) => society.code.toUpperCase() === normalizedCode) ?? null;

    setSelectedSociety(matchingSociety);

    if (matchingSociety) {
      setSocietySearch(matchingSociety.name);
    }
  }

  function commitSocietySearch() {
    const normalizedQuery = societySearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return;
    }

    const exactMatch = findExactSocietyMatch(societies, societySearch);
    if (exactMatch) {
      applySocietySelection(exactMatch);
      return;
    }

    const matchingSocieties = societies.filter((society) => matchesSocietyQuery(society, normalizedQuery));

    if (matchingSocieties.length === 1) {
      applySocietySelection(matchingSocieties[0]);
    }
  }

  function validateForm() {
    let isValid = true;

    setUsernameError("");
    setPasswordError("");
    setSocietyCodeError("");

    if (!societyCode.trim()) {
      setSocietyCodeError("Society code is required");
      isValid = false;
    }

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
      const response = await login(username, password, societyCode.trim().toUpperCase(), selectedRole);

      setSession({
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

      toast.success(`Welcome back, ${response.user.fullName}! Redirecting to your society workspace...`);
      router.replace(
        getDefaultDashboardPath("SOCIETY", response.user.requiresPasswordChange, response.user.allowedModuleSlugs)
      );
    } catch (caught) {
      const status = (caught as { status?: number })?.status ? `[${(caught as { status: number }).status}] ` : "";
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Failed to authenticate. Please check your login details and try again.";

      const fullError = `${status}${message}`;
      setError(fullError);
      toast.error(fullError);
      setLoading(false);
    }
  }

  const selectedRoleCopy = societyRoleOptions.find((option) => option.value === selectedRole) ?? societyRoleOptions[0];
  const selectedSocietyDetails =
    selectedSociety ?? societies.find((society) => society.code.toUpperCase() === societyCode.trim().toUpperCase()) ?? null;
  const approvedSocietyCount = societies.length;

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
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, transparent 70%)",
                zIndex: -1
              }
            }}
          >
            <Stack spacing={2.2} sx={{ height: "100%" }}>
              <Chip label="Society Workspace" sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff" }} />

              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.12 }}>
                  Society Login
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.88)", mt: 1.1 }}>
                  Use this portal for society administrators and other authorized society workspace users.
                  Agent and client logins stay inside the society card on the home page, and platform superadmin uses the dedicated admin terminal.
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                <Chip label="Society Code Bound" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip label="Module Permissions" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
                <Chip label="Role Checked in API" size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />
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
                <Stack spacing={1.2}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 800, letterSpacing: 1 }}>
                    Dedicated Portals
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    Agent and client users should sign in from their society entry on the home page.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    Platform superadmin should use <strong>/admin</strong>.
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.16)",
                  bgcolor: "rgba(7, 16, 34, 0.2)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Stack spacing={1.2}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 800, letterSpacing: 1 }}>
                    Live Directory
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                    {societiesLoading
                      ? "Refreshing the approved society directory..."
                      : `${approvedSocietyCount} approved societies are currently available for login.`}
                  </Typography>
                  {selectedSocietyDetails?.registrationState ? (
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)" }}>
                      Selected region: <strong>{selectedSocietyDetails.registrationState}</strong>
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Image
                  src="/illustrations/auth-vault.svg"
                  alt="Illustration of secure vault login"
                  width={760}
                  height={520}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={2.6}>
              <Box>
                <Typography variant="h4" className="section-title" sx={{ fontSize: { xs: "1.7rem", md: "2.05rem" } }}>
                    Sign In to Your Society
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 640 }}>
                    Search your society by name first. Once selected, we will fill the login code and show the key portal details before you continue with your assigned credentials.
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
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Search Society
                      </Typography>
                      <Autocomplete
                        disablePortal
                        autoHighlight
                        loading={societiesLoading}
                        options={societies}
                        value={selectedSociety}
                        inputValue={societySearch}
                        onChange={(_, society) => applySocietySelection(society)}
                        onInputChange={(_, nextInputValue, reason) => {
                          setSocietySearch(nextInputValue);

                          if (reason === "clear") {
                            applySocietySelection(null);
                            return;
                          }

                          const exactMatch = findExactSocietyMatch(societies, nextInputValue);

                          if (exactMatch) {
                            applySocietySelection(exactMatch);
                            return;
                          }

                          if (reason === "input" && selectedSociety && nextInputValue.trim() !== selectedSociety.name) {
                            setSelectedSociety(null);
                          }
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionLabel={(option) => option.name}
                        filterOptions={(options, state) =>
                          options.filter((society) => matchesSocietyQuery(society, state.inputValue)).slice(0, 8)
                        }
                        noOptionsText={societySearch.trim() ? "No matching society found" : "Start typing the society name"}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.id}>
                            <Stack spacing={0.25}>
                              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.code}
                                {option.registrationState ? ` • ${option.registrationState}` : ""}
                              </Typography>
                            </Stack>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search by society name or code"
                            onBlur={commitSocietySearch}
                            helperText={
                              societyLookupError ??
                              "Pick the society name you recognize. We will fill the workspace code automatically."
                            }
                            InputProps={{
                              ...params.InputProps,
                              sx: {
                                borderRadius: 2.5,
                                bgcolor: "#fff",
                                "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" }
                              },
                              startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />,
                              endAdornment: (
                                <>
                                  {societiesLoading ? <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                      />
                    </Box>

                    {selectedSocietyDetails ? (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid rgba(59, 130, 246, 0.16)",
                          bgcolor: "rgba(239, 246, 255, 0.7)"
                        }}
                      >
                        <Stack spacing={1.3}>
                          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.2 }}>
                            Selected Society
                          </Typography>
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                Registered Name
                              </Typography>
                              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{selectedSocietyDetails.name}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                Society Code
                              </Typography>
                              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{selectedSocietyDetails.code}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                Portal Status
                              </Typography>
                              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>Approved for sign-in</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                Region
                              </Typography>
                              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                                {selectedSocietyDetails.registrationState ?? "Not provided"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Stack>
                      </Box>
                    ) : null}

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Society Code
                      </Typography>
                      <TextField
                        placeholder="e.g. SOC-001"
                        value={societyCode}
                        onChange={(event) => {
                          const nextCode = event.target.value.toUpperCase();

                          setSocietyCode(nextCode);
                          syncSocietyFromCode(nextCode);

                          if (event.target.value.trim()) {
                            setSocietyCodeError("");
                          }
                        }}
                        required
                        fullWidth
                        error={Boolean(societyCodeError)}
                        helperText={societyCodeError || "Filled automatically from society search. You can still edit it manually if needed."}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <ApartmentRoundedIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Access Role
                      </Typography>
                      <TextField
                        select
                        value={selectedRole}
                        onChange={(event) => setSelectedRole(event.target.value as UserRole)}
                        fullWidth
                        helperText={selectedRoleCopy.helper}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <BadgeRoundedIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      >
                        {societyRoleOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Username
                      </Typography>
                      <TextField
                        placeholder="e.g. adm_skyline"
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
                        helperText={usernameError || "Use the username issued for your society workspace account."}
                        InputProps={{
                          sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } },
                          startAdornment: <BadgeRoundedIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>
                        Password
                      </Typography>
                      <TextField
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (event.target.value) {
                            setPasswordError("");
                          }
                        }}
                        required
                        fullWidth
                        error={Boolean(passwordError)}
                        helperText={passwordError}
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
                      {loading ? "Authorizing..." : "Open Society Workspace"}
                    </Button>
                  </Stack>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    New society? <Link href="/register">Submit a registration request</Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Platform admin? <Link href="/admin">Use the admin terminal</Link>
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
