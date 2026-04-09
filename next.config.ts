import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stimg.emart.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mres.my.homeplus.co.kr",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
