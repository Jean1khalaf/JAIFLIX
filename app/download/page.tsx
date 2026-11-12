import Link from "next/link";
import PwaInstallButton from "@/components/PwaInstallButton";

export default function DownloadPage() {
  return <main className="downloadPage container">
    <Link className="downloadBack" href="/">← Back to JAIFLIX</Link>
    <div className="downloadHero">
      <img src="/jaiflix-icon.png" width="76" height="76" alt="JAIFLIX" />
      <p className="eyebrow">ANDROID & CHROMEBOOK APP</p>
      <h1>Install JAIFLIX</h1>
      <p>Install JAIFLIX on your Android phone or Chromebook and open it in its own app window. No APK download is required.</p>
    </div>
    <section className="downloadInstructions">
      <h2>Install JAIFLIX</h2>
      <p>Tap the red install button at the bottom-right. If Chrome offers the quick-install prompt, it will open directly. Otherwise, use Chrome's menu to install.</p>
      <ol>
        <li>Open <strong>jaiflix.vercel.app</strong> in Chrome on your Android phone or Chromebook.</li>
        <li>Tap <strong>＋ Install JAIFLIX</strong>.</li>
        <li>Confirm the installation in Chrome.</li>
      </ol>
      <p className="downloadSafety">Chrome controls the final installation confirmation. If neither the button nor Chrome's menu offers installation, the website must first pass Chrome's PWA installability checks. Google TV and Android TV are not supported by this install flow. Video playback still requires an internet connection.</p>
    </section>
    <p className="downloadFoot">The install button is shown on this page except on detected Google TV and Android TV devices. Installation availability is decided by Chrome.</p>
    <PwaInstallButton />
  </main>;
}
