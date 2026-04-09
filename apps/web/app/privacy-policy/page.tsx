import type { Metadata } from "next";
import { LegalPageContent } from "@/components/legal/legal-page-content";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/privacy-policy"
  }
};

export default function PrivacyPolicyPage() {
  return <LegalPageContent kind="privacyPolicy" />;
}
