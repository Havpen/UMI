const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/UMI" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  ...(isPages
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
      }
    : {}),
  images: {
    formats: ["image/webp"],
    unoptimized: isPages,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
