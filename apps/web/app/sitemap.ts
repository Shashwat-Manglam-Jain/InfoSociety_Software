import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const publicRoutes = ["", "about", "contact", "privacy-policy", "terms-of-service", "advertising-disclosure", "register"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: route ? `${siteUrl}/${route}` : siteUrl,
    lastModified: now,
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.7 : 1
  }));
}
