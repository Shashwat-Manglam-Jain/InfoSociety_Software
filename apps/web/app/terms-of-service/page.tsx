import type { Metadata } from "next";
import { LegalPageContent } from "@/components/legal/legal-page-content";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for use of the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/terms-of-service"
  }
};

export default function TermsPage() {
  return <LegalPageContent kind="termsOfService" />;
}
