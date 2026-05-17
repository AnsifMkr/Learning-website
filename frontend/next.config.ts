/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://skillspark-backend-tau.vercel.app';

if (!process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.BACKEND_URL) {
  console.warn(
    '[next.config] WARNING: Neither NEXT_PUBLIC_BACKEND_URL nor BACKEND_URL is set. ' +
    'API rewrites will target the deployed backend https://skillspark-backend-tau.vercel.app.'
  );
}

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [{
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    }];
  },
};