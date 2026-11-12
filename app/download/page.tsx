import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const dynamic = "force-dynamic";

function apkAvailable(file: string) {
  return fs.existsSync(path.join(process.cwd(), "public", "downloads", file));
}

export default function DownloadPage() {
  const mobile = apkAvailable("JAIFLIX-mobile.apk");
  const tv = apkAvailable("JAIFLIX-tv.apk");
  return <main className="downloadPage container">
    <Link className="downloadBack" href="/">← Back to JAIFLIX</Link>
    <div className="downloadHero">
      <img src="/jaiflix-icon.png" width="76" height="76" alt="JAIFLIX" />
      <p className="eyebrow">WATCH ANYWHERE</p>
      <h1>Get JAIFLIX on your device</h1>
      <p>Choose the app made for your screen. Android installation requires your approval.</p>
    </div>
    <div className="downloadChoices">
      <article className="downloadCard">
        <div className="downloadIcon">▯</div><h2>JAIFLIX Mobile</h2>
        <p>For Android phones and tablets with touch-friendly navigation.</p>
        {mobile ? <a className="btn red" href="/downloads/JAIFLIX-mobile.apk" download>Download Android APK</a> : <span className="downloadPending">APK is being prepared</span>}
        <small>Android 6.0 or later recommended.</small>
      </article>
      <article className="downloadCard">
        <div className="downloadIcon">▣</div><h2>JAIFLIX TV</h2>
        <p>For Google TV and Android TV, with remote-control navigation.</p>
        {tv ? <a className="btn red" href="/downloads/JAIFLIX-tv.apk" download>Download TV APK</a> : <span className="downloadPending">TV APK is being prepared</span>}
        <small>Requires Android TV / Google TV with app sideloading enabled.</small>
      </article>
    </div>
    <section className="downloadInstructions">
      <h2>How to install</h2>
      <ol><li>Download the APK for your device.</li><li>Open the downloaded file.</li><li>If prompted, allow your browser or file manager to install unknown apps.</li><li>Review the Android prompt and tap Install.</li></ol>
      <p className="downloadSafety">Only install JAIFLIX APKs downloaded from this official website. Android always asks you to approve sideloaded app installation; websites cannot silently install applications.</p>
    </section>
    <p className="downloadFoot">Having trouble? Open JAIFLIX in your browser while the app packages are being prepared.</p>
  </main>;
}
