import Link from "next/link";

export default function DownloadPage() {
  return <main className="downloadPage container">
    <Link className="downloadBack" href="/">← Back to JAIFLIX</Link>
    <div className="downloadHero">
      <img src="/jaiflix-icon.png" width="76" height="76" alt="JAIFLIX" />
      <p className="eyebrow">ANDROID APP</p>
      <h1>Install JAIFLIX on Android</h1>
      <p>Add JAIFLIX to your Android phone's home screen and open it in its own app window. No APK download is required.</p>
    </div>
    <section className="downloadInstructions">
      <h2>How to install</h2>
      <ol>
        <li>Open <strong>jaiflix.vercel.app</strong> in Google Chrome on your Android phone.</li>
        <li>Tap the browser menu (⋮), then choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
        <li>Confirm the installation. The JAIFLIX icon will appear on your home screen.</li>
      </ol>
      <p className="downloadSafety">JAIFLIX is provided as an Android phone PWA. Google TV and Android TV installation are not supported in this version. Video playback still requires an internet connection.</p>
    </section>
    <p className="downloadFoot">If Chrome does not show the install option, open the website directly in Chrome, refresh it, and check the browser menu again.</p>
  </main>;
}
