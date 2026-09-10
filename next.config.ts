import type { NextConfig } from "next";
import { assertMediaConfig } from "./src/features/media/config/media-config";

assertMediaConfig();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
