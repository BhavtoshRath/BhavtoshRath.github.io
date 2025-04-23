/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  basePath: '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 