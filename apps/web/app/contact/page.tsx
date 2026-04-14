import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact/contact-page-content";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${appBranding.companyName} support and business team.`,
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return <ContactPageContent />;
}
