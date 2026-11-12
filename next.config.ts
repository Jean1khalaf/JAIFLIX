import type { NextConfig } from "next";
const configuredPlayerHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_VIDAPI_BASE || "https://vaplayer.ru").origin; }
  catch { return "https://vaplayer.ru"; }
})();
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: `object-src 'none'; base-uri 'self'; frame-ancestors 'self'; frame-src ${configuredPlayerHost} https://www.youtube-nocookie.com https://youtube-nocookie.com` }
      ]
    }];
  }
};
export default nextConfig;
