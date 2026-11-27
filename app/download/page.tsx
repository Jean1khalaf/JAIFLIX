import Link from "next/link";
import PwaInstallButton from "@/components/PwaInstallButton";

const androidTvApk = "https://github.com/Jean1khalaf/JAIFLIX/releases/latest/download/JAIFLIX-universal.apk";

export default function DownloadPage() {
  return <main className="downloadPage container">
    <Link className="downloadBack" href="/">← Back to JAIFLIX</Link>
    <div className="downloadHero">
      <img src="/jaiflix-icon.png" width="76" height="76" alt="JAIFLIX" />
      <p className="eyebrow">ANDROID, ANDROID TV & CHROMEBOOK</p>
      <h1>Install JAIFLIX</h1>
      <p>Choose the installation method for your device. The universal Android APK supports compatible Android phones, Android TV and Google TV devices.</p>
    </div>
    <section className="downloadInstructions">
      <h2>Android TV / Google TV</h2>
      <p>Download the universal JAIFLIX APK. Some TV browsers download the file first; if the installer does not open, find the APK in Downloads or your file manager and open it.</p>
      <p><a className="downloadApkButton" href={androidTvApk} download>↓ Download JAIFLIX for Android TV (APK)</a></p>
      <ol>
        <li>Open this page on your Android TV / Google TV, or download the APK elsewhere and copy it to your TV.</li>
        <li>Open <strong>JAIFLIX-universal.apk</strong> from Downloads or your file manager.</li>
        <li>If prompted, allow that browser or file manager to install unknown apps.</li>
        <li>Review the Android installer and tap <strong>Install</strong> to confirm.</li>
      </ol>
      <p className="downloadSafety">Android always requires confirmation before installing an APK. A website cannot silently install apps or bypass this prompt. This APK does not work on proprietary TV systems such as Samsung Tizen or LG webOS. Compatibility depends on the TV's Android version and hardware.</p>
    </section>
    <section className="downloadInstructions">
      <h2>Android phone / Chromebook</h2>
      <p>Install JAIFLIX as a web app in Chrome. No APK download is needed.</p>
      <ol>
        <li>Open <strong>jaiflix.vercel.app</strong> in Chrome.</li>
        <li>Tap <strong>＋ Install JAIFLIX</strong> when offered.</li>
        <li>Confirm the installation in Chrome.</li>
      </ol>
      <p className="downloadSafety">Chrome controls the final PWA installation confirmation. If Chrome does not offer installation, use its menu and look for “Install app” or “Add to Home screen”.</p>
    </section>
    <p className="downloadFoot">The Android TV APK is distributed through JAIFLIX GitHub Releases. Video playback requires an internet connection.</p>
    <PwaInstallButton />
  </main>;
}
