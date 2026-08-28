/** Public R2 bucket host for sample room images (derived from the env URL). */
const r2RemotePatterns = (() => {
  const url = process.env.NEXT_PUBLIC_R2_URL;
  if (!url) return [];
  try {
    const { protocol, hostname } = new URL(url);
    return [{ protocol: protocol.replace(/:$/, ""), hostname }];
  } catch {
    return [];
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Clerk-hosted user avatars.
      { protocol: "https", hostname: "img.clerk.com" },
      // R2 public bucket (sample room images).
      ...r2RemotePatterns,
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Force HTTPS for two years, incl. subdomains (safe to preload).
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
