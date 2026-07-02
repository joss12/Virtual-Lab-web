import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    qualities: [75, 100],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default withNextIntl(nextConfig);
