import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@rio-negro/db', '@rio-negro/ui'],
}

export default nextConfig
