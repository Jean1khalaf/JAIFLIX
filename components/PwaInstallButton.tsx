"use client";

import { useEffect, useState } from "react";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

function isTelevision() {
  return /(Android\s?TV|Google\s?TV|GoogleTV|SmartTV|SMART-TV|HbbTV|AFT[A-Z0-9]*|BRAVIA|NetCast|Tizen.*TV)/i.test(navigator.userAgent);
}

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: minimal-ui)").matches
    || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

export default function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<DeferredInstallPrompt | null>(null);
  const [tv, setTv] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTv(isTelevision());
    setInstalled(isInstalled());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as DeferredInstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setMessage("JAIFLIX is installed. Open it from your home screen or app launcher.");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (busy) return;

    if (!promptEvent) {
      setMessage("Chrome has not made the quick-install prompt available on this visit. Open Chrome's ⋮ menu and choose “Install app” or “Add to Home screen”. If that option is missing too, JAIFLIX is not yet being recognised as installable by this browser.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await promptEvent.prompt();
      const result = await promptEvent.userChoice;
      setMessage(result.outcome === "accepted"
        ? "JAIFLIX installation was accepted."
        : "Installation was cancelled. You can try again from Chrome's menu.");
      setPromptEvent(null);
    } catch {
      setMessage("Chrome could not open its installation prompt. Try Chrome's ⋮ menu and select “Install app”.");
      setPromptEvent(null);
    } finally {
      setBusy(false);
    }
  }

  if (tv || installed) return null;

  return (
    <div className="pwaInstallWrap">
      <button type="button" className="pwaInstallButton" onClick={handleInstall} disabled={busy}>
        {busy ? "Opening installer…" : "＋ Install JAIFLIX"}
      </button>
      {message && <p className="pwaInstallMessage" role="status">{message}</p>}
    </div>
  );
}
