import type { Metadata } from "next";
import { Card, CardContent, Container, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "About",
  description: "About Infopath Solutions and the Info Banking platform.",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography component="h1" variant="h4" mb={1.5}>
            About Us
          </Typography>
          <Typography color="text.secondary" paragraph>
            Infopath Solutions provides banking software for societies and cooperative institutions.
          </Typography>
          <Typography color="text.secondary">
            The Info Banking platform includes role-based workflows for clients, agents, and superusers across account
            opening, deposits, loans, transactions, reporting, and monitoring.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
