# JAIFLIX Android phone app

The recommended installation is the website's Progressive Web App (PWA): open `https://jaiflix.vercel.app/` in Chrome on an Android phone or Chromebook, then tap the **Install JAIFLIX** button when it appears. Chrome asks the user to confirm installation. If the button is unavailable, use Chrome’s menu and choose **Install app**. The PWA opens in a standalone app window and does not require an APK.

This project retains an optional Android phone WebView wrapper for testing. Android TV and Google TV support has been removed.

## Build the optional phone APK

Requirements: JDK 17, Android SDK Platform 35 and Gradle 8.9.

```bash
gradle assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`. Debug APKs are for testing/sideloading, not a signed public release.
