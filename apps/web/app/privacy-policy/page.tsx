import type { Metadata } from "next";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/privacy-policy"
  }
};

const sections = [
  {
    title: "Information We Process",
    points: [
      "Account and operational records required to deliver workflow features.",
      "Basic technical and usage signals required for performance and security.",
      "Role and access data necessary to enforce permission boundaries."
    ]
  },
  {
    title: "How Data Is Used",
    points: [
      "To provide account, transaction, reporting, and administrative operations.",
      "To monitor platform integrity, detect misuse, and maintain reliability.",
      "To support legitimate customer service and onboarding requests."
    ]
  },
  {
    title: "Advertising and Cookies",
    points: [
      "Selected public areas may display Google AdSense advertisements.",
      "Third-party vendors may use cookies to personalize ad delivery.",
      "Users can manage ad personalization in Google Ads settings."
    ]
  },
  {
    title: "Security and Retention",
    points: [
      "Role-based access controls are used to separate operational responsibilities.",
      "Data is retained based on business, compliance, and audit requirements.",
      "Security controls are regularly reviewed as the platform evolves."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <PublicContentShell
      badge="Legal"
      title="Privacy Policy"
      subtitle={`This page describes how ${appBranding.productShortName} handles operational data, technical metadata, and ad-related processing for public pages.`}
    >
      <Stack spacing={2}>
        {sections.map((section) => (
          <Card key={section.title} className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.7 }}>
                {section.title}
              </Typography>
              {section.points.map((point) => (
                <Typography key={point} color="text.secondary" sx={{ mb: 0.45 }}>
                  • {point}
                </Typography>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card className="surface-glass">
          <CardContent>
            <Typography color="text.secondary">
              For privacy or data handling questions, contact: <strong>{appBranding.supportEmail}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </PublicContentShell>
  );
}
