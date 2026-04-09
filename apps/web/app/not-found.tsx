import type { Metadata } from "next";
import { NotFoundContent } from "@/components/feedback/not-found-content";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: `404 | ${appBranding.productShortName}`,
  description: "Page not found"
};

export const dynamic = "force-dynamic";

export default function NotFoundPage() {
  return <NotFoundContent />;
}
