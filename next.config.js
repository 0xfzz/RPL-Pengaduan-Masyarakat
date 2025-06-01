const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure webpack to avoid scanning restricted directories
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  eslint: {
      ignoreDuringBuilds: true,
  },
  allowedDevOrigins: [
    'localhost',
    'tunnel.0xfzz.xyz'
  ]
};


module.exports = nextConfig;