/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true, // ✅ FIX SVG
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // ✅ FIX: Supabase Storage — required for product images uploaded via Supabase
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },

  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/backend/:path*',
            destination: 'http://localhost:5000/api/v1/:path*',
          },
        ]
      : [];
  },
};

export default nextConfig;
