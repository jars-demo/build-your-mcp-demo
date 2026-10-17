import path from 'node:path'

import type { NextConfig } from 'next'

// Chapters (../workshop) and the quoted server code (../server/src) live outside this folder,
// so tracing starts at the repo root and those files are included explicitly.
const repoRoot = path.join(process.cwd(), '..')

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
  outputFileTracingIncludes: {
    '/**': ['../workshop/*.md', '../server/src/*.ts'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
        ],
      },
    ]
  },
}

export default nextConfig
