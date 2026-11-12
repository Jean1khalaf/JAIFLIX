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
      <h2>Install in one tap</h2>
      <p>Use the red <strong>＋ Install JAIFLIX</strong> button at the bottom-right of this page. On a supported device, it opens Chrome's installation confirmation.</p>
      <ol>
        <li>Open <strong>jaiflix.vercel.app</strong> in Chrome on your Android phone or Chromebook.</li>
        <li>Tap <strong>＋ Install JAIFLIX</strong>.</li>
        <li>Confirm the installation. JAIFLIX will appear on your home screen or app launcher.</li>
      </ol>
      <p className="downloadSafety">If the button says Chrome has not offered the prompt, open Chrome's ⋮ menu and select “Install app” or “Add to Home screen”. The website cannot bypass Chrome's confirmation. Google TV and Android TV are not supported by this install flow. Video playback still requires an internet connection.</p>
    </section>
    <p className="downloadFoot">The install button is hidden on Google TV and Android TV. On desktop previews it remains visible, but installation is intended for Android phones and Chromebooks.</p>
  </main>;
}
