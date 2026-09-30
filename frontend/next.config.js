/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isPages ? '/sales' : '',
  assetPrefix: isPages ? '/sales/' : '',
}

module.exports = nextConfig
