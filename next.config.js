/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // SWC minification is enabled by default in Next.js 15
  // Font optimization is enabled by default in Next.js 15
  
  // Enable compression
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
      'framer-motion',
      '@tanstack/react-table',
      '@tanstack/react-query',
      'recharts',
      'date-fns',
      'zod'
    ],
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },

  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Remove console logs in production
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
  
  // TypeScript and ESLint improvements
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig