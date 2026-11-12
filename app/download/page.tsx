import Link from "next/link";

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
      <h2>One-tap installation</h2>
      <ol>
        <li>Open <strong>jaiflix.vercel.app</strong> in Chrome on your Android phone or Chromebook.</li>
        <li>Tap the red <strong>Install JAIFLIX</strong> button when it appears. Chrome will open its installation confirmation.</li>
        <li>Confirm once. JAIFLIX will be added to your device's app launcher or home screen.</li>
      </ol>
      <p className="downloadSafety">The one-tap install option is intended for Android phones and Chromebooks; JAIFLIX does not show its install button on Google TV or Android TV. Browser-level installation menus are controlled by the device and cannot be disabled by a website. If the button is unavailable on a supported device, use Chrome's menu and select Install app. Video playback still requires an internet connection.</p>
    </section>
    <p className="downloadFoot">The install button appears only when Chrome says JAIFLIX is installable. Chrome always requires your confirmation before installing.</p>
  </main>;
}
