import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaSetup from "@/components/PwaSetup";

export const metadata: Metadata = {
  title: { default: "JAIFLIX", template: "%s | JAIFLIX" },
  description: "JAIFLIX — Movies and series from around the world",
  manifest: "/manifest.webmanifest",
  applicationName: "JAIFLIX",
  appleWebApp: { capable: true, title: "JAIFLIX", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icons/jaiflix-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/jaiflix-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/apple-touch-icon.png"
  }
};

export const viewport: Viewport = { themeColor: "#08090b", width: "device-width", initialScale: 1 };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><PwaSetup />{children}</body></html>;
}
