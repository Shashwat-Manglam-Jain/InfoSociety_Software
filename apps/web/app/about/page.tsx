import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/about-page-content";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "About",
  description: `About ${appBranding.companyName} and the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return <AboutPageContent />;
}
