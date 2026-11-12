# JAIFLIX Android apps

This folder contains two Android WebView shells that use the existing JAIFLIX Next.js site as their shared catalogue/playback backend:

- `mobile` flavor: Android phones and tablets.
- `tv` flavor: Android TV and Google TV, with Leanback launcher support and D-pad key forwarding.

The apps load `https://jaiflix.vercel.app/`. Change `homeUrl` and `allowedTopLevelHosts` in `app/src/main/java/org/jaiflix/app/MainActivity.kt` if the production domain changes.

## Build APKs

Requirements: JDK 17, Android SDK Platform 35 and Gradle 8.9 (Android Gradle Plugin 8.7.3).

From this directory:

```bash
gradle assembleMobileDebug assembleTvDebug
```

Outputs:

- `app/build/outputs/apk/mobile/debug/app-mobile-debug.apk`
- `app/build/outputs/apk/tv/debug/app-tv-debug.apk`

Debug APKs are signed with the standard Android debug key and are suitable for device testing / direct sideload testing, not a final public production release. For a production release, create and securely store your own keystore, configure Gradle release signing from CI secrets, and never commit the keystore or passwords.

The repository GitHub Actions workflow `.github/workflows/build-android.yml` builds both debug APKs and publishes them as a downloadable workflow artifact.

## Publish APKs on the website

After building and testing both APKs, copy them to the Next.js public folder with these exact names:

```bash
mkdir -p ../public/downloads
cp app/build/outputs/apk/mobile/debug/app-mobile-debug.apk ../public/downloads/JAIFLIX-mobile.apk
cp app/build/outputs/apk/tv/debug/app-tv-debug.apk ../public/downloads/JAIFLIX-tv.apk
```

Commit and deploy the website. The `/download` page checks whether these files exist and only displays a download link when each APK is present. This avoids publishing broken download links before the packages are uploaded.

## Device installation

On Android, download the APK, open it, allow installation from the browser/file manager if prompted, and approve the Android installer. On Google TV / Android TV, transfer the TV APK to the device (or download it with a TV browser), enable the device's permitted unknown-app installation setting, and install it. Android requires user approval; a website cannot silently install an APK.

## Playback and security notes

The app only restricts external **top-level** navigation away from the configured JAIFLIX website. Third-party video providers run inside embedded frames and control their own content; this wrapper cannot guarantee that every provider will be safe or block all navigation inside cross-origin frames. Use only playback providers you have vetted and are authorized to use. Do not describe the app as an ad-free or redirect-proof environment unless verified against every provider/device combination.
