import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "JAIFLIX",
    short_name: "JAIFLIX",
    description: "JAIFLIX — Movies and series from around the world",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone"],
    background_color: "#08090b",
    theme_color: "#08090b",
    icons: [
      { src: "/icons/jaiflix-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/jaiflix-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/jaiflix-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
