const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/UMI" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
