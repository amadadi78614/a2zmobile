/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  reactStrictMode: true,
};

export default nextConfig;
