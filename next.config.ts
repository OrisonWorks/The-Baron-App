import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sheet PHOTO links (Google Drive, Imgur, WhatsApp CDN, ...) are rendered unoptimized,
    // so no remote host allow-list is needed here.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
