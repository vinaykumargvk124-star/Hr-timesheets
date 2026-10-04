import { config } from "dotenv";

// One .env at the repo root serves both sites.
config({ path: "../../.env", quiet: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@timenod/shared"],
};

export default nextConfig;
