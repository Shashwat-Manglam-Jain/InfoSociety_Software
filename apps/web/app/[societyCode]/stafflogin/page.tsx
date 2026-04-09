"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Grid, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { getPublicSocieties, getPublicSocietyBranches, login } from "@/shared/api/auth";
import { getDefaultDashboardPath, setSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSiteCopy, interpolateCopy } from "@/shared/i18n/site-copy";
import { toast } from "@/shared/ui/toast";
import type { Society } from "@/shared/types";

type BranchOption = { id: string; code: string; name: string; isHead: boolean };

export default function StaffLoginPage() {
  const router = useRouter();
  const params = useParams() as { societyCode?: string | string[] };
  const { locale } = useLanguage();
  const copy = getSiteCopy(locale).staffPortal;
  const normalizedSocietyCode = String(Array.isArray(params.societyCode) ? params.societyCode[0] : params.societyCode ?? "").toUpperCase();
  const headOfficeOption: BranchOption = { id: "__HEAD_OFFICE__", code: "HEAD", name: copy.headOffice, isHead: true };
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [society, setSociety] = useState<Society | null>(null);
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([headOfficeOption]);
  const [selectedBranchId, setSelectedBranchId] = useState(headOfficeOption.id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/dashboard/society");
  }, [router]);

  useEffect(() => {
    async function fetchSociety() {
      try {
        const [societies, branches] = await Promise.all([getPublicSocieties(), getPublicSocietyBranches(normalizedSocietyCode).catch(() => [])]);
        const found = societies.find((entry) => entry.code.toUpperCase() === normalizedSocietyCode);
        if (found) setSociety(found);
        const nextOptions = branches.length > 0 ? [headOfficeOption, ...branches] : [headOfficeOption];
        setBranchOptions(nextOptions);
        setSelectedBranchId(nextOptions[0]?.id ?? headOfficeOption.id);
      } catch (caught) {
        console.error("Failed to fetch society info", caught);
      }
    }

    void fetchSociety();
  }, [headOfficeOption, normalizedSocietyCode]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError(copy.credentialError);
      return;
    }

    setLoading(true);

    try {
      const response = await login(username, password, normalizedSocietyCode, "SUPER_USER");

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
        allowedModuleSlugs: response.user.allowedModuleSlugs ?? [],
        selectedBranchId: selectedBranchId === headOfficeOption.id ? null : selectedBranchId,
        selectedBranchName: branchOptions.find((branch) => branch.id === selectedBranchId)?.name ?? headOfficeOption.name,
        selectedBranchCode: branchOptions.find((branch) => branch.id === selectedBranchId)?.code ?? headOfficeOption.code
      });

      toast.success(interpolateCopy(copy.success, { name: response.user.fullName }));
      router.replace(getDefaultDashboardPath("SOCIETY", response.user.requiresPasswordChange, response.user.allowedModuleSlugs));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.fallbackError;
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Card className="surface-vibrant fade-rise" sx={{ overflow: "hidden", borderRadius: 4 }}>
        <Grid container>
          <Grid size={{ xs: 12, md: 5 }} sx={{ p: { xs: 2.5, md: 4.5 }, color: "#fff", position: "relative", overflow: "hidden", zIndex: 1, background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)" }}>
            <Stack spacing={2.5} sx={{ height: "100%" }}>
              <Chip label={copy.chip} sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 800 }} />
              <Box>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.15 }}>{interpolateCopy(copy.heroTitle, { society: society?.name ?? normalizedSocietyCode })}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.88)", mt: 1.2 }}>{copy.heroDescription}</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3.5, border: "1px solid rgba(255,255,255,0.18)", bgcolor: "rgba(15, 23, 42, 0.28)", backdropFilter: "blur(12px)" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(59, 130, 246, 0.18)", color: "#fff" }}><BusinessRoundedIcon fontSize="small" /></Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 800, letterSpacing: 0.5 }}>{copy.statusLabel}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{interpolateCopy(copy.statusValue, { code: normalizedSocietyCode })}</Typography>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ mt: "auto" }}>
                <Image src="/illustrations/auth-insight.svg" alt={copy.imageAlt} width={600} height={400} style={{ width: "100%", height: "auto", display: "block", opacity: 0.9 }} />
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 5 } }}>
              <Stack spacing={3.5}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <BadgeRoundedIcon sx={{ color: "#0f172a", fontSize: 32 }} />
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>{copy.formTitle}</Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ maxWidth: 500 }}>{copy.formDescription}</Typography>
                </Box>
                <Box component="form" onSubmit={onSubmit} sx={{ p: { xs: 2, md: 3.5 }, borderRadius: 4.5, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "rgba(255,255,255,0.45)", backdropFilter: "blur(12px)" }}>
                  <Stack spacing={3.2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>{copy.usernameLabel}</Typography>
                      <TextField placeholder={copy.usernamePlaceholder} value={username} onChange={(event) => setUsername(event.target.value)} fullWidth InputProps={{ sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } } }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>{copy.branchLabel}</Typography>
                      <TextField select fullWidth value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} InputProps={{ sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } } }}>
                        {branchOptions.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
                      </TextField>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700, color: "#1e293b" }}>{copy.passwordLabel}</Typography>
                      <TextField type={showPassword ? "text" : "password"} placeholder={copy.passwordPlaceholder} value={password} onChange={(event) => setPassword(event.target.value)} fullWidth InputProps={{ sx: { borderRadius: 2.5, bgcolor: "#fff", "& fieldset": { borderColor: "rgba(15, 23, 42, 0.12)" } }, startAdornment: <LockIcon sx={{ mr: 1, color: "#0f172a", fontSize: 20 }} />, endAdornment: <IconButton onClick={() => setShowPassword((previous) => !previous)} edge="end" size="small">{showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}</IconButton> }} />
                    </Box>
                    {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}
                    <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ height: 54, borderRadius: 3.5, fontWeight: 900, fontSize: "1rem", bgcolor: "#0f172a", "&:hover": { bgcolor: "#111827" } }}>
                      {loading ? <CircularProgress size={24} sx={{ color: "inherit" }} /> : copy.submit}
                    </Button>
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
