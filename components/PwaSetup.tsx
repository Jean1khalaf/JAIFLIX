 "use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

function isTelevision() {
  return /(Android\s?TV|Google\s?TV|GoogleTV|SmartTV|SMART-TV|HbbTV|AFT[A-Z0-9]*|BRAVIA|NetCast|Tizen.*TV)/i.test(navigator.userAgent);
}

function isSupportedDevice() {
  const ua = navigator.userAgent;
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
  const [onDownloadPage, setOnDownloadPage] = useState(false);
  const [isTv, setIsTv] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const tv = isTelevision();
    setIsTv(tv);
    setEligible(isSupportedDevice());
    setOnDownloadPage(window.location.pathname.startsWith("/download"));
    setInstalled(isAlreadyInstalled());

    if ("serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }

    const onBeforeInstall = (event: Event) => {
      if (tv) return;
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setMessage("JAIFLIX is installed. You can open it from your home screen or app launcher.");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (installing) return;

    if (!eligible) {
      setMessage("To install JAIFLIX, open this page in Chrome on an Android phone or Chromebook.");
      return;
    }

    if (!installEvent) {
      setMessage("Chrome has not offered the one-tap prompt yet. In Chrome, open the ⋮ menu and choose “Install app” or “Add to Home screen”. If that option is missing, check that the site is online and reload it.");
      return;
    }

    setInstalling(true);
    setMessage("");
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setMessage("JAIFLIX installation was accepted.");
      } else {
        setMessage("Installation was cancelled. You can try again from Chrome's menu.");
      }
      setInstallEvent(null);
    } catch {
      setMessage("Chrome could not open the install prompt. Use Chrome's ⋮ menu and choose “Install app” or “Add to Home screen”.");
      setInstallEvent(null);
    } finally {
      setInstalling(false);
    }
  }

  // Never display the install action on TV devices. On the download page,
  // keep the CTA visible on desktop so visitors understand where to install.
  if (isTv || installed || (!eligible && !onDownloadPage)) return null;

  return (
    <div className="pwaInstallWrap">
      <button
        type="button"
        className="pwaInstallButton"
        onClick={install}
        disabled={installing}
        aria-label="Install JAIFLIX"
      >
        {installing ? "Opening installer…" : "＋ Install JAIFLIX"}
      </button>
      {message && <p className="pwaInstallMessage" role="status">{message}</p>}
    </div>
  );
}
