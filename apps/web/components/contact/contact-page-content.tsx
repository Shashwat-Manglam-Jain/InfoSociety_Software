"use client";

import { Box, Container, Link, Stack, Typography, alpha } from "@mui/material";
import Grid from "@mui/material/Grid";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getContactPageCopy } from "@/shared/i18n/contact-copy";

const contactIcons = [
  { icon: <SupportAgentRoundedIcon sx={{ fontSize: 32 }} />, color: "#3b82f6" },
  { icon: <BusinessRoundedIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6" },
  { icon: <EmailRoundedIcon sx={{ fontSize: 32 }} />, color: "#10b981" }
] as const;

export function ContactPageContent() {
  const { locale } = useLanguage();
  const copy = getContactPageCopy(locale);

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
          <Typography variant="h6" sx={{ color: "text.secondary", mt: 3, maxWidth: 700, mx: "auto", fontWeight: 500 }}>
            {copy.heroDescription}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {copy.methods.map((method, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={method.title}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  height: "100%",
                  border: "1px solid rgba(148, 163, 184, 0.08)",
                  boxShadow: "0 12px 24px -10px rgba(15, 23, 42, 0.05)",
                  transition: "all 300ms ease",
                  "&:hover": { transform: "translateY(-8px)", boxShadow: "0 32px 64px -16px rgba(15, 23, 42, 0.1)" }
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: alpha(contactIcons[index].color, 0.1),
                    color: contactIcons[index].color,
                    width: "fit-content"
                  }}
                >
                  {contactIcons[index].icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, color: "#0f172a" }}>
                  {method.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3 }}>
                  {method.detail}
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", display: "block", mb: 0.5 }}>
                      {copy.labels.email}
                    </Typography>
                    <Link
                      href={`mailto:${method.email}`}
                      sx={{ fontWeight: 700, textDecoration: "none", color: "primary.main", "&:hover": { textDecoration: "underline" } }}
                    >
                      {method.email}
                    </Link>
                  </Box>
                  {method.hours && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", display: "block", mb: 0.5 }}>
                        {copy.labels.hours}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {method.hours}
                      </Typography>
                    </Box>
                  )}
                  {method.location && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", display: "block", mb: 0.5 }}>
                        {copy.labels.location}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {method.location}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ p: 4, borderRadius: 2, bgcolor: alpha("#3b82f6", 0.04), border: "1px solid rgba(59, 130, 246, 0.12)" }}>
          <Stack direction="row" spacing={2.5} alignItems="flex-start">
            <Box sx={{ p: 1, borderRadius: 6, bgcolor: "#3b82f6", color: "#fff" }}>
              <InfoRoundedIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0f172a" }}>
                {copy.commitmentTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                {copy.commitmentBody}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
