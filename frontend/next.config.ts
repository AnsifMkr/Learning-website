/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

if (!backendUrl) {
  console.warn(
    '[next.config] WARNING: Neither NEXT_PUBLIC_BACKEND_URL nor BACKEND_URL is set. ' +
    'API rewrites will target http://localhost:5000 which will fail in production!'
  );
}

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const destination = backendUrl || 'http://localhost:5000';
    return [{
      source: '/api/:path*',
      destination: `${destination}/api/:path*`,
    }];
  },
};