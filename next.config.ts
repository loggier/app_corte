import type { NextConfig } from 'next';
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  /* config options here */
  output: 'export', // Agrega esta línea
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // o 'http' si es el caso
        hostname: process.env.NEXT_PUBLIC_REMOTE_IMAGE_HOSTNAME as string,
        port: '453', // o el puerto si no es el estándar (80 para http, 443 para https)
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
