import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { appBranding } from "@/shared/config/branding";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appBranding.productName,
    template: `%s | ${appBranding.productShortName}`
  },
  description: appBranding.metaDescription,
  keywords: appBranding.keywords,
  applicationName: appBranding.productName,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: appBranding.productName,
    description: appBranding.metaDescription,
    url: siteUrl,
    siteName: appBranding.productShortName,
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: appBranding.productName,
    description: appBranding.metaDescription
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteNavbar />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
