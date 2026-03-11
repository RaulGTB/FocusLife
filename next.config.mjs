/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'barkkraeomgrzmzqefdj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Vercel handles compression
  compress: true,
  // Strict mode for better React debugging
  reactStrictMode: true,
};

export default nextConfig;
