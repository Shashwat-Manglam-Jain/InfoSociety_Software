import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Infopath Banking Platform",
    template: "%s | Infopath Banking"
  },
  description:
    "Core banking platform for societies with client, agent, and superuser workflows across accounts, deposits, loans, reports, and operations.",
  keywords: [
    "core banking software",
    "society banking",
    "loan management",
    "deposit management",
    "nest js banking api",
    "next js banking dashboard"
  ],
  applicationName: "Infopath Banking Platform",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Infopath Banking Platform",
    description:
      "Unified web banking system for account lifecycle, transactions, loan operations, and role-based society monitoring.",
    url: siteUrl,
    siteName: "Infopath Banking",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Infopath Banking Platform",
    description:
      "Client, agent, and superuser workspaces for society banking operations on a responsive web platform."
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
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
