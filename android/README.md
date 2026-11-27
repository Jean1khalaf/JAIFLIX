# JAIFLIX Android builds

This project provides separate phone and Android TV WebView variants. Both load `https://jaiflix.vercel.app/` and require an internet connection for video playback.

## Android TV APK

The `tv` product flavor adds the Android TV / Leanback launcher category, marks touchscreen as optional, supplies a TV launcher banner, and keeps the app navigable with a D-pad/OK/Back remote through the WebView activity.

Build a debug APK with JDK 17, Android SDK Platform 35, and Gradle 8.9:

```bash
cd android
gradle assembleTvDebug
```

Output: `app/build/outputs/apk/tv/debug/app-tv-debug.apk`.

Install the APK by sideloading it from a USB drive or through ADB. The TV must run Android TV / Google TV (or a compatible Android build that supports APK sideloading and WebView). A TV marketed as “Smart TV” may instead use a proprietary operating system; confirm its OS and model before attempting installation.

## Android phone APK

```bash
cd android
gradle assemblePhoneDebug
```

Debug APKs are for testing/sideloading, not signed public releases. Use a properly signed release build for distribution.
