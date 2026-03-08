import type { Metadata } from "next";
import { Card, CardContent, Container, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Infopath Banking platform and advertising disclosures.",
  alternates: {
    canonical: "/privacy-policy"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography component="h1" variant="h4" mb={1.5}>
            Privacy Policy
          </Typography>

          <Typography variant="h6" mt={2} mb={0.5}>
            Information We Collect
          </Typography>
          <Typography color="text.secondary" paragraph>
            We process account and operational data needed to provide banking workflows. We may also collect basic
            technical usage data to secure and improve the application.
          </Typography>

          <Typography variant="h6" mt={2} mb={0.5}>
            Advertising and Cookies
          </Typography>
          <Typography color="text.secondary" paragraph>
            This site may display Google AdSense ads. Third-party vendors, including Google, may use cookies to serve
            ads based on prior visits. Users can manage ad personalization settings through Google Ads Settings.
          </Typography>

          <Typography variant="h6" mt={2} mb={0.5}>
            Data Security
          </Typography>
          <Typography color="text.secondary" paragraph>
            Access is controlled through role-based authentication. We apply technical and operational safeguards to
            protect financial and identity-related information.
          </Typography>

          <Typography variant="h6" mt={2} mb={0.5}>
            Contact
          </Typography>
          <Typography color="text.secondary">For privacy questions, contact support@infopath.local.</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
