import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from Supabase storage domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Turbopack (Next.js 16 default) – no custom webpack needed since
  // Leaflet is loaded dynamically (dynamic import + ssr: false)
  turbopack: {},
};

export default nextConfig;
