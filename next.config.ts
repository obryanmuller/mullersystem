import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Desabilita otimização de imagem no Vercel
  },
};

export default nextConfig;
