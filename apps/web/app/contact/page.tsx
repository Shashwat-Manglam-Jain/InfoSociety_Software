import type { Metadata } from "next";
import { Box, Card, CardContent, Container, Link, Stack, Typography, alpha } from "@mui/material";
import Grid from "@mui/material/Grid";
import { appBranding } from "@/shared/config/branding";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${appBranding.companyName} support and business team.`,
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  const contactMethods = [
    {
      title: "General Support",
      icon: <SupportAgentRoundedIcon sx={{ fontSize: 32 }} />,
      color: "#3b82f6",
      detail: "Operational assistance and implementation support.",
      email: "support@infopath.local",
      hours: "Mon - Sat, 9:30 AM - 6:30 PM"
    },
    {
      title: "Business & Sales",
      icon: <BusinessRoundedIcon sx={{ fontSize: 32 }} />,
      color: "#8b5cf6",
      detail: "Enterprise onboarding and pricing inquiries.",
      email: "business@infopath.local",
      hours: "Mon - Fri, 10:00 AM - 6:00 PM"
    },
    {
      title: "Corporate HQ",
      icon: <EmailRoundedIcon sx={{ fontSize: 32 }} />,
      color: "#10b981",
      detail: `${appBranding.companyName} Society Operations`,
      location: "New Delhi, India",
      email: "admin@infopath.local"
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#f8fafc" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
           <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 3 }}>
              REACH OUT TO US
           </Typography>
           <Typography variant="h2" sx={{ fontWeight: 900, color: "#0f172a", mt: 1, letterSpacing: "-0.04em" }}>
              Get the Support You Need
           </Typography>
           <Typography variant="h6" sx={{ color: "text.secondary", mt: 3, maxWidth: 700, mx: "auto", fontWeight: 500 }}>
              Whether you're a society owner looking to onboard or an agent requiring operational assistance, our team is ready to help.
           </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {contactMethods.map((method) => (
            <Grid size={{ xs: 12, md: 4 }} key={method.title}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 6,
                  bgcolor: "#fff",
                  height: "100%",
                  border: "1px solid rgba(148, 163, 184, 0.08)",
                  boxShadow: "0 12px 24px -10px rgba(15, 23, 42, 0.05)",
                  transition: "all 300ms ease",
                  "&:hover": { transform: "translateY(-8px)", boxShadow: "0 32px 64px -16px rgba(15, 23, 42, 0.1)" }
                }}
              >
                <Box sx={{ mb: 3, p: 1.5, borderRadius: 3, bgcolor: alpha(method.color, 0.1), color: method.color, width: "fit-content" }}>
                   {method.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, color: "#0f172a" }}>{method.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3 }}>{method.detail}</Typography>
                
                <Stack spacing={2}>
                   <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", display: "block", mb: 0.5 }}>EMAIL</Typography>
                      <Link href={`mailto:${method.email}`} sx={{ fontWeight: 700, textDecoration: "none", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
                         {method.email}
                      </Link>
                   </Box>
                   {method.hours && (
                      <Box>
                         <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", display: "block", mb: 0.5 }}>WORKING HOURS</Typography>
                         <Typography variant="body2" sx={{ fontWeight: 700 }}>{method.hours}</Typography>
                      </Box>
                   )}
                   {method.location && (
                      <Box>
                         <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", display: "block", mb: 0.5 }}>LOCATION</Typography>
                         <Typography variant="body2" sx={{ fontWeight: 700 }}>{method.location}</Typography>
                      </Box>
                   )}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ p: 4, borderRadius: 6, bgcolor: alpha("#3b82f6", 0.04), border: "1px solid rgba(59, 130, 246, 0.12)" }}>
           <Stack direction="row" spacing={2.5} alignItems="flex-start">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#3b82f6", color: "#fff" }}>
                 <InfoRoundedIcon />
              </Box>
              <Box>
                 <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0f172a" }}>Our Support Commitment</Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    All requests are triaged by role impact and priority. For production-related inquiries, please ensure your society identifier and regional code are included in the subject line for faster processing.
                 </Typography>
              </Box>
           </Stack>
        </Box>
      </Container>
    </Box>
  );
}
