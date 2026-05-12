import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 静的エクスポートを有効にする
  output: 'export', 
  
  // 2. 画像の最適化を無効化する
  // (Firebase Hosting のような静的ホスティングでは Next.js 標準の画像最適化サーバーが動かないため)
  images: {
    unoptimized: true,
  },

  // 3. 末尾のスラッシュを強制する（任意ですが、ルーティングのトラブル防止に役立ちます）
  trailingSlash: true,
};

export default nextConfig;