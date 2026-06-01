import type { NextConfig } from "next";


// we can igonore eslit and typescript during build
const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "static.vecteezy.com" ,
        port:"",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      }
    ]
  }
};

export default nextConfig;
