/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // The repo uses Prettier via ESLint and currently has formatting warnings.
    // Allow production builds to succeed; run `npm run lint`/`npm run format` to clean up.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
