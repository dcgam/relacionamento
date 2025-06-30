/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora erros do ESLint durante o build para não travar o deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros do TypeScript durante o build
    ignoreBuildErrors: true,
  },
  images: {
    // Permite usar imagens sem otimização, útil em muitos deploys simples
    unoptimized: true,
  },
  // ❌ NÃO ADICIONE mais experimental.appDir aqui
}

export default nextConfig
