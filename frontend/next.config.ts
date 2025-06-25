import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,
    experimental: {
        optimizeCss: false,
        // optimizePackageImports: [
        //   "@mui/material",
        //   "@emotion/react",
        //   "@emotion/styled",
        // ],
    },
};

export default nextConfig;