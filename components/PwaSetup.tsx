"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

function isSupportedDevice() {
  const ua = navigator.userAgent;
  // Never offer installation on televisions or TV-oriented Android devices.
  const isTelevision = /(Android\s?TV|Google\s?TV|GoogleTV|SmartTV|SMART-TV|HbbTV|AFT[A-Z0-9]*|BRAVIA|NetCast|Tizen.*TV)/i.test(ua);
  if (isTelevision) return false;

  // Android phones and ChromeOS devices (Chromebooks) are the supported targets.
  const isAndroidPhone = /Android/i.test(ua) && /Mobile/i.test(ua);
  const isChromebook = /CrOS/i.test(ua);
  return isAndroidPhone || isChromebook;
}

function isAlreadyInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: minimal-ui)").matches
    || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

export default function PwaSetup() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [eligible, setEligible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setEligible(isSupportedDevice());
    setInstalled(isAlreadyInstalled());

    if ("serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }

    const onBeforeInstall = (event: Event) => {
      if (!isSupportedDevice()) return;
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent || installing) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setInstallEvent(null);
    } catch {
      // Keep the page usable; Chrome's own menu remains an installation fallback.
      setInstallEvent(null);
    } finally {
      setInstalling(false);
    }
  }

  if (!eligible || installed || !installEvent) return null;

  return (
    <button type="button" className="pwaInstallButton" onClick={install} disabled={installing} aria-label="Install JAIFLIX">
      {installing ? "Opening installer…" : "＋ Install JAIFLIX"}
    </button>
  );
}
