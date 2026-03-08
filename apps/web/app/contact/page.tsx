import type { Metadata } from "next";
import { Card, CardContent, Container, Link, Stack, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Infopath Banking support and business team.",
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography component="h1" variant="h4" mb={1.5}>
            Contact Us
          </Typography>
          <Typography color="text.secondary" paragraph>
            For support, partnerships, and onboarding requests, contact our team.
          </Typography>
          <Stack spacing={0.8}>
            <Typography>
              Email: <Link href="mailto:support@infopath.local">support@infopath.local</Link>
            </Typography>
            <Typography>Business Hours: Monday to Saturday, 9:30 AM to 6:30 PM</Typography>
            <Typography>Address: Infopath Solutions, Banking Operations Center, India</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
