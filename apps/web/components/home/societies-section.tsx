"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Container, 
  Divider,
  Skeleton, 
  Stack, 
  Typography,
  alpha 
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DomainRoundedIcon from "@mui/icons-material/DomainRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { getPublicSocieties as listSocieties } from "@/shared/api/auth";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSiteCopy } from "@/shared/i18n/site-copy";
import type { Society } from "@/shared/types";

export function SocietiesSection() {
  const { locale } = useLanguage();
  const copy = getSiteCopy(locale).societyDirectory;
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSocieties() {
      try {
        const data = await listSocieties();
        setSocieties(data);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : copy.loadError);
      } finally {
        setLoading(false);
      }
    }
    void loadSocieties();
  }, [copy.loadError]);

  return (
    <Box
      id="societies"
      sx={{
        py: { xs: 8, md: 12 },
        background: "transparent"
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ mb: 6, textAlign: "center", alignItems: "center" }}>
          <Box
            className="pill-soft"
            sx={{
              px: 1.8,
              py: 0.8,
              fontWeight: 800,
              color: "secondary.main",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.76rem"
            }}
          >
            {copy.eyebrow}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", letterSpacing: "-0.04em", textAlign: "center" }}>
            {copy.title}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 700, mx: "auto", fontSize: "1.1rem", textAlign: "center" }}>
            {copy.description}
          </Typography>
        </Stack>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: "center", bgcolor: "rgba(196, 49, 60, 0.05)", borderRadius: 1, border: "1px solid rgba(196, 49, 60, 0.1)" }}>
            <Typography color="error" sx={{ fontWeight: 700 }}>{error}</Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>{copy.retry}</Button>
          </Box>
        ) : societies.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              maxWidth: 720,
              mx: "auto",
              borderRadius: 1,
              border: (theme) => `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
              bgcolor: "background.paper"
            }}
          >
            <CardContent sx={{ px: { xs: 3, md: 6 }, py: { xs: 5, md: 7 } }}>
              <Stack spacing={2.5} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: "20%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
                    color: "secondary.main"
                  }}
                >
                  <SearchRoundedIcon sx={{ fontSize: 44 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {copy.emptyTitle}
                </Typography>
                <Typography sx={{ maxWidth: 520, color: "text.secondary" }}>
                  {copy.emptyDescription}
                </Typography>
                <Button component={Link} href="/register" variant="contained" color="secondary" sx={{ mt: 1, px: 4 }}>
                  {copy.emptyAction}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {societies.map((society) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={society.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: "100%",
                    borderRadius: 4,
                    border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                    backgroundImage: "var(--card-gradient)",
                    transition: "all 300ms ease",
                    backdropFilter: "blur(14px)",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: (theme) => `0 24px 50px ${alpha(theme.palette.common.black, theme.palette.mode === "light" ? 0.12 : 0.3)}`,
                      borderColor: "secondary.light"
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                         <Box sx={{ 
                           p: 1.6, 
                           borderRadius: 2.5, 
                           background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`,
                           color: "secondary.main"
                         }}>
                            <DomainRoundedIcon />
                         </Box>
                         <Chip label={society.code} variant="outlined" size="small" sx={{ fontWeight: 800, color: "text.secondary" }} />
                      </Box>

                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, letterSpacing: "-0.02em" }}>
                          {society.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {copy.authorityPrefix} #SOC-{society.code.slice(-4)}
                        </Typography>
                      </Box>

                      <Divider sx={{ opacity: 0.5 }} />

                      <Stack spacing={1.5}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: 1 }}>
                          {copy.loginTitle}
                        </Typography>
                        <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button 
                              fullWidth
                              component={Link}
                              href={`/${society.code}/agentlogin`}
                              variant="contained"
                              size="small"
                              startIcon={<ManageAccountsRoundedIcon sx={{ fontSize: 16 }} />}
                              sx={{ 
                                background: "linear-gradient(135deg, #047857 0%, #059669 100%)", 
                                "&:hover": { background: "linear-gradient(135deg, #065f46 0%, #047857 100%)" },
                                fontWeight: 800,
                                borderRadius: 2
                              }}
                            >
                              {copy.roleAgent}
                            </Button>
                          </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button 
                              fullWidth
                              component={Link}
                              href={`/${society.code}/stafflogin`}
                              variant="contained"
                              size="small"
                              startIcon={<BadgeRoundedIcon sx={{ fontSize: 16 }} />}
                              sx={{ 
                                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
                                "&:hover": { background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)" },
                                fontWeight: 800,
                                borderRadius: 2
                              }}
                            >
                              {copy.roleStaff}
                            </Button>
                          </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button 
                              fullWidth
                              component={Link}
                              href={`/${society.code}/clientlogin`}
                              variant="contained"
                              size="small"
                              startIcon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                              sx={{ 
                                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", 
                                "&:hover": { background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)" },
                                fontWeight: 800,
                                borderRadius: 2
                              }}
                            >
                              {copy.roleClient}
                            </Button>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
