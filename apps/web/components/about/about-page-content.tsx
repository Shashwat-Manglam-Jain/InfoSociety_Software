"use client";

import { Box, Container, Stack, Typography, alpha } from "@mui/material";
import Grid from "@mui/material/Grid";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getAboutPageCopy } from "@/shared/i18n/about-copy";

const valueCardIcons = [
  { icon: <VerifiedRoundedIcon sx={{ fontSize: 32 }} />, color: "#3b82f6" },
  { icon: <GroupsRoundedIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6" },
  { icon: <SpeedRoundedIcon sx={{ fontSize: 32 }} />, color: "#10b981" }
] as const;

export function AboutPageContent() {
  const { locale } = useLanguage();
  const copy = getAboutPageCopy(locale);

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#f8fafc" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 3 }}>
            {copy.heroBadge}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, color: "#0f172a", mt: 1, letterSpacing: "-0.04em" }}>
            {copy.heroTitle}
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", mt: 3, maxWidth: 800, mx: "auto", lineHeight: 1.6, fontWeight: 500 }}>
            {copy.heroDescription}
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 10 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ p: 5, borderRadius: 2, bgcolor: "#fff", border: "1px solid rgba(148, 163, 184, 0.12)", height: "100%", boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.05)" }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: "#0f172a" }}>
                {copy.excellenceTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }} paragraph>
                {copy.excellenceParagraphOne}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
                {copy.excellenceParagraphTwo}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 5, borderRadius: 2, background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", color: "#fff", height: "100%", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", bottom: -20, right: -20, opacity: 0.1 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 200 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
                {copy.snapshotTitle}
              </Typography>
              <Stack spacing={2}>
                {copy.snapshotItems.map((item) => (
                  <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                    <VerifiedRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {copy.valueCards.map((item, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.title}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 1,
                  bgcolor: "#fff",
                  height: "100%",
                  border: "1px solid rgba(148, 163, 184, 0.08)",
                  transition: "all 300ms ease",
                  "&:hover": { transform: "translateY(-8px)", boxShadow: "0 32px 64px -16px rgba(15, 23, 42, 0.1)" }
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: alpha(valueCardIcons[index].color, 0.1),
                    color: valueCardIcons[index].color,
                    width: "fit-content"
                  }}
                >
                  {valueCardIcons[index].icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, color: "#0f172a" }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                  {item.detail}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
