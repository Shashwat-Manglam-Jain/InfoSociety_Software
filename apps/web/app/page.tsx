import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Infopath Info Banking helps societies run account opening, deposits, loans, transactions, instruments, and reports with role-based controls.",
  alternates: {
    canonical: "/"
  }
};

const highlights = [
  "Client, agent, and superuser role workspaces",
  "Account opening, deposits, loans, transactions, clearing and reports",
  "Society-wise monitoring and supervision from one panel",
  "Responsive Material UI interface for web and mobile",
  "Common free plan with ads + premium ad-free monthly plan"
];

const planCards = [
  {
    title: "Common Plan",
    price: "Free",
    ads: "Ads Enabled",
    points: ["Create account and use core banking workflows", "Ad-supported dashboard for monetization", "Suitable for standard users"]
  },
  {
    title: "Premium Plan",
    price: "Monthly Bill",
    ads: "Ads Free",
    points: ["No ads in dashboard and workspace", "Priority support and cleaner UI", "Upgrade anytime after signup"]
  }
];

const serviceGroups = [
  {
    title: "Core Banking",
    items: ["Account Opening", "Deposit Accounts", "Loan Accounts", "Account Modification", "Account Status Change"]
  },
  {
    title: "Transactions",
    items: ["General Transaction", "Pass Transaction", "Cheque Clearing", "Demand Draft", "IBC/OBC Instruments"]
  },
  {
    title: "Operations",
    items: ["Cash Book & Trial Balance", "Interest Calculation", "Day End / Month End / Year End", "Locker Operations", "Investment House"]
  },
  {
    title: "Reports & Monitoring",
    items: ["Daybook and Statements", "Loan and Deposit Reports", "Balance Sheet / P&L", "User Directory", "Cross-society Monitoring"]
  }
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infopath Solutions",
  url: siteUrl,
  description: "Core banking software platform for societies and cooperative institutions."
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Infopath Banking Platform",
  url: siteUrl,
  inLanguage: "en-US"
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Card className="fade-rise surface-glass" sx={{ overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 2.2, md: 4 } }}>
            <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Chip
                  label="Infopath Solutions"
                  sx={{ bgcolor: "rgba(13, 94, 143, 0.1)", color: "#0c5d90", fontWeight: 700, mb: 1.5 }}
                />
                <Typography component="h1" variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, lineHeight: 1.08 }}>
                  Banking Operations, Reimagined for Societies
                </Typography>
                <Typography sx={{ mt: 1.2, color: "text.secondary", maxWidth: 520 }}>
                  Infopath Info Banking gives your society a unified platform for accounts, loans, deposits, transactions,
                  clearing, reporting, and superuser monitoring.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} mt={2.5}>
                  <Button
                    component={Link}
                    href="/register"
                    endIcon={<ArrowForwardIcon />}
                    variant="contained"
                    color="secondary"
                    size="large"
                  >
                    Start Free
                  </Button>
                  <Button component={Link} href="/login" variant="outlined">
                    Login
                  </Button>
                  <Button component={Link} href="http://localhost:4000/api/docs" target="_blank" variant="text">
                    API Swagger
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box className="float-soft" sx={{ width: "100%", maxWidth: 560, mx: "auto" }}>
                  <Image
                    src="/illustrations/hero-banking.svg"
                    alt="Illustrated dashboard and banking workflow preview"
                    width={960}
                    height={720}
                    style={{ width: "100%", height: "auto", display: "block" }}
                    priority
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2} mt={2}>
          {highlights.map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item}>
              <Card className="surface-glass">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={650}>
                    {item}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography component="h2" variant="h5" mt={3} mb={1}>
          Free vs Premium
        </Typography>
        <Grid container spacing={2}>
          {planCards.map((plan) => (
            <Grid size={{ xs: 12, md: 6 }} key={plan.title}>
              <Card className="surface-glass" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{plan.title}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={plan.price} color="primary" variant="outlined" />
                      <Chip label={plan.ads} color={plan.ads === "Ads Free" ? "success" : "warning"} />
                    </Stack>
                    {plan.points.map((point) => (
                      <Typography key={point} color="text.secondary">
                        • {point}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography component="h2" variant="h5" mt={3} mb={1}>
          Services Included
        </Typography>
        <Grid container spacing={2}>
          {serviceGroups.map((group) => (
            <Grid size={{ xs: 12, md: 6 }} key={group.title}>
              <Card className="surface-glass" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" mb={1}>
                    {group.title}
                  </Typography>
                  {group.items.map((item) => (
                    <Typography key={item} color="text.secondary">
                      • {item}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card className="surface-glass" sx={{ mt: 2.5 }}>
          <CardContent>
            <Typography component="h2" variant="h5" mb={1}>
              AdSense and Compliance
            </Typography>
            <Typography color="text.secondary">
              This website uses compliant ad placements and policy pages for AdSense eligibility. Ads should only be
              clicked by users who are genuinely interested in the content.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
