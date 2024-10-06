/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "open.api.nexon.com",
        pathname: "/static/maplestory/**",
      },
    ],
  },
};

export default nextConfig;
