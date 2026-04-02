/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
  },
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/society',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
