/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
    cpus: 2,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 4,
  },
};

export default nextConfig;
