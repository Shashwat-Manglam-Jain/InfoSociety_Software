"use client";

import Link from "next/link";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { appBranding } from "@/shared/config/branding";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getFooterCopy } from "@/shared/i18n/marketing-copy";

export function WorkspaceFooter() {
  const { locale } = useLanguage();
  const footerCopy = getFooterCopy(locale);
  const links = [
    { href: "/about", label: footerCopy.aboutLabel },
    { href: "/contact", label: footerCopy.contactLabel },
    { href: "/privacy-policy", label: footerCopy.privacyLabel },
    { href: "/terms-of-service", label: footerCopy.termsLabel },
    { href: "/advertising-disclosure", label: footerCopy.advertisingLabel }
  ] as const;

  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: { xs: 3, md: 4 },
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        background: (theme) =>
          `radial-gradient(100% 120% at 10% 0%, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0)} 65%),
          linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.92)} 0%, ${theme.palette.background.default} 100%)`
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              {appBranding.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mt: 0.5 }}>
              {footerCopy.summary}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {footerCopy.workspaceOperationsNote}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap justifyContent={{ md: "flex-end" }}>
              {links.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  size="small"
                  variant="text"
                  color="inherit"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.6, borderColor: "divider" }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {footerCopy.workspaceSupportNote}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {appBranding.companyName}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
