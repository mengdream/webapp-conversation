/** @type {import('next').NextConfig} */
const nextConfig = {
    // 禁用生产环境的页面缓存
    output: 'standalone',
    generateEtags: false,
    poweredByHeader: false,
    compress: true,
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ],
    productionBrowserSourceMaps: false, // enable browser source map generation during the production build
    // Configure pageExtensions to include md and mdx
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    experimental: {
        // appDir: true,
    },
    // fix all before production. Now it slow the develop speed.
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'app1.showapi.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig