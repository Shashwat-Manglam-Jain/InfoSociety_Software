import type { Metadata } from "next";
import { Box, Card, CardContent, Chip, Container, Stack, Typography, alpha } from "@mui/material";
import Grid from "@mui/material/Grid";
import { appBranding } from "@/shared/config/branding";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

export const metadata: Metadata = {
  title: "About",
  description: `About ${appBranding.companyName} and the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/about"
  }
};

const valueCards = [
  {
    title: "Operational Clarity",
    icon: <VerifiedRoundedIcon sx={{ fontSize: 32 }} />,
    color: "#3b82f6",
    detail: "We design around real day-to-day society savings operations so teams can execute with fewer handoffs."
  },
  {
    title: "Cooperative Focus",
    icon: <GroupsRoundedIcon sx={{ fontSize: 32 }} />,
    color: "#8b5cf6",
    detail: `${appBranding.productShortName} is built specifically for societies and cooperative groups, not generic enterprise workflows.`
  },
  {
    title: "Platform Scalability",
    icon: <SpeedRoundedIcon sx={{ fontSize: 32 }} />,
    color: "#10b981",
    detail: "Our architecture is structured for role-based workflows, auditable records, and repeatable operational quality across institutions."
  }
];

export default function AboutPage() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#f8fafc" }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
           <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 3 }}>
              OUR MISSION AT INFOPATH
           </Typography>
           <Typography variant="h2" sx={{ fontWeight: 900, color: "#0f172a", mt: 1, letterSpacing: "-0.04em" }}>
              Digital Sovereignty for Societies
           </Typography>
           <Typography variant="h6" sx={{ color: "text.secondary", mt: 3, maxWidth: 800, mx: "auto", lineHeight: 1.6, fontWeight: 500 }}>
              {appBranding.companyName} builds software that helps societies run structured savings collections, interest tracking, and reporting with disciplined, role-based workflows.
           </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 10 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ p: 5, borderRadius: 2, bgcolor: "#fff", border: "1px solid rgba(148, 163, 184, 0.12)", height: "100%", boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.05)" }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: "#0f172a" }}>
                Institutional Excellence Delivered
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }} paragraph>
                {appBranding.productShortName} combines member onboarding, savings collections, interest tracking, and reporting into a unified executive surface. We believe that professional cooperative management requires more than just spreadsheets—it requires auditable workflows and verified data.
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
                The product supports clients, agents, and administrators with specialized tools, ensuring that every financial interaction is recorded and every institutional policy is enforced systematically.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 5, borderRadius: 2, background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", color: "#fff", height: "100%", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", bottom: -20, right: -20, opacity: 0.1 }}>
                 <VerifiedRoundedIcon sx={{ fontSize: 200 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
                Platform Snapshot
              </Typography>
              <Stack spacing={2}>
                {[
                  "Hierarchical Role-based Access Control",
                  "Automated Interest & Dividend Engines",
                  "Real-time Operational Monitoring",
                  "Verified Institutional Record Keeping",
                  "SaaS Deployment for Universal Access"
                ].map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                    <VerifiedRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {valueCards.map((item) => (
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
                <Box sx={{ mb: 3, p: 1.5, borderRadius: 3, bgcolor: alpha(item.color, 0.1), color: item.color, width: "fit-content" }}>
                   {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5, color: "#0f172a" }}>{item.title}</Typography>
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
