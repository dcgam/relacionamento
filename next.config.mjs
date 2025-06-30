/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,  // ✅ Obrigatório quando usa a pasta /app
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
