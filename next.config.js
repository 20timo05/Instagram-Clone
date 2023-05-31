/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["loremflickr.com", "cloudflare-ipfs.com"]
  }
}

module.exports = nextConfig
