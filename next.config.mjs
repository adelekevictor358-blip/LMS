/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gzip/brotli compression on all responses
  compress: true,
  poweredByHeader: false,

  // Optimized image serving
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },

  // Only bundle the icon/component variants that are actually imported
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-avatar',
      '@radix-ui/react-scroll-area',
    ],
  },
};

export default nextConfig;
