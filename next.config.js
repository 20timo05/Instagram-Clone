/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["loremflickr.com", "cloudflare-ipfs.com"]
  }
}

module.exports = nextConfig
