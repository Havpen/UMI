const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/UMI" : "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru https://*.maps.yandex.net https://yastatic.net",
  "style-src 'self' 'unsafe-inline' https://yastatic.net",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src https://api-maps.yandex.ru https://yandex.ru https://*.yandex.ru https://*.yandex.net",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  ...(isPages
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
      }
    : {
        headers: async () => {
          const global = [...securityHeaders];
          if (process.env.NODE_ENV === "production") {
            global.push({ key: "Content-Security-Policy", value: csp });
          }
          return [
            { source: "/:path*", headers: global },
            { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
            { source: "/admin", headers: [{ key: "Cache-Control", value: "no-store" }] },
            { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
            {
              source: "/media/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
            },
            {
              source: "/brand/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
            },
          ];
        },
      }),
  images: {
    formats: ["image/webp"],
    unoptimized: isPages,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC: isPages ? "1" : "",
  },
  serverExternalPackages: isPages ? [] : ["ffmpeg-static"],
  ...(isPages
    ? {}
    : {
        experimental: {
          serverActions: {
            bodySizeLimit: "1mb",
          },
        },
      }),
};

export default nextConfig;
