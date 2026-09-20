import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'pot-api.gsh-servers.com',
      },
      {
        protocol: 'https',
        hostname: 'web-cdn.alderongames.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  async redirects() {
    return [
      // Canonical host: send www traffic to the apex domain so Google sees one copy of each page
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.titantech.party' }],
        destination: 'https://titantech.party/:path*',
        permanent: true,
      },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/', permanent: true },
      { source: '/community.html', destination: '/community', permanent: true },
      { source: '/bots.html', destination: '/bots', permanent: true },
      { source: '/dashboard.html', destination: '/dashboard', permanent: true },
      { source: '/login.html', destination: '/login', permanent: true },
      { source: '/admin.html', destination: '/admin', permanent: true },
      { source: '/suggestions.html', destination: '/suggestions', permanent: true },
      { source: '/showcase.html', destination: '/gallery', permanent: true },
      { source: '/showcase-submit.html', destination: '/gallery', permanent: true },
      { source: '/servers.html', destination: '/community', permanent: true },
      { source: '/server-submit.html', destination: '/community/servers/submit', permanent: true },
      { source: '/commission.html', destination: '/', permanent: true },
      { source: '/tos-commission.html', destination: '/', permanent: true },
      { source: '/mod-manager.html', destination: '/tools/mod-manager', permanent: true },
      { source: '/game-ini-generator.html', destination: '/tools/game-ini', permanent: true },
      { source: '/commands-ini-generator.html', destination: '/tools/commands-ini', permanent: true },
      // Rules/MOTD tool moved to NexLink Core — send both the legacy page and the old tool route there
      { source: '/rules-motd-generator.html', destination: 'https://nexlinkcore.com/guides/path-of-titans/tools/path-of-titans-rules-motd-generator', permanent: true },
      { source: '/tools/rules-motd', destination: 'https://nexlinkcore.com/guides/path-of-titans/tools/path-of-titans-rules-motd-generator', permanent: true },
      { source: '/admin-commissions.html', destination: '/admin', permanent: true },
      { source: '/admin-showcase.html', destination: '/admin', permanent: true },
      { source: '/api/community-mods', destination: '/api/gsh/mods', permanent: true },
      { source: '/api/gsh-mods', destination: '/api/gsh/mods', permanent: true },
      { source: '/api/gsh-servers', destination: '/api/gsh/servers', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
