import type { Metadata } from "next";
import { Card, CardContent, Container, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for use of Infopath Banking platform.",
  alternates: {
    canonical: "/terms-of-service"
  }
};

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography component="h1" variant="h4" mb={1.5}>
            Terms of Service
          </Typography>

          <Typography color="text.secondary" paragraph>
            By using this platform, users agree to authorized use only and compliance with applicable banking and
            operational rules set by the organization.
          </Typography>
          <Typography color="text.secondary" paragraph>
            Unauthorized access, misuse of data, attempts to manipulate financial records, or abuse of ad systems is
            prohibited.
          </Typography>
          <Typography color="text.secondary">
            We may update these terms from time to time. Continued use of the platform indicates acceptance of the
            latest version.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
