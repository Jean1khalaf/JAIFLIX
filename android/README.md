# JAIFLIX Android universal APK

The Android project builds one APK for compatible Android phones, Android TV and Google TV. It loads `https://jaiflix.vercel.app/` in a WebView and requires an internet connection for video playback. The same APK exposes both the normal Android launcher and Android TV / Leanback launcher. Touchscreen and Leanback are optional features so the package can be discovered on both device types.

## Build locally

Use JDK 17, Android SDK Platform 35, and Gradle 8.9 or newer compatible with Android Gradle Plugin 8.7.3:

```bash
cd android
gradle assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`.

For a debug build, run `gradle assembleDebug`.

## Install on Android TV / Google TV

Sideload the APK from USB, a trusted download location, or ADB. If Android asks, allow the file manager/browser to install unknown apps, then review and confirm the system installer. A website cannot silently install an APK. This package cannot run on proprietary TV operating systems such as Samsung Tizen or LG webOS.

## Signed GitHub releases

The workflow `.github/workflows/android-tv-release.yml` builds the APK and attaches it to a GitHub Release when a version tag such as `v1.0.0` is pushed. The website's stable download URL is:

`https://github.com/Jean1khalaf/JAIFLIX/releases/latest/download/JAIFLIX-universal.apk`

Before tagging a public release, create a private signing keystore once:

```bash
keytool -genkeypair -v -keystore jaiflix-release.jks -alias jaiflix -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 jaiflix-release.jks
```

On macOS, use `base64 jaiflix-release.jks | tr -d '\\n'` for the second command. Add the following repository Settings → Secrets and variables → Actions secrets. Never commit the keystore or passwords:

- `ANDROID_KEYSTORE_BASE64`: base64 output from the keystore
- `ANDROID_KEYSTORE_PASSWORD`: keystore password
- `ANDROID_KEY_ALIAS`: `jaiflix` (or the alias you chose)
- `ANDROID_KEY_PASSWORD`: key password

Keep a secure backup of the keystore: every future APK update must be signed with the same key. After adding secrets, publish a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The APK download URL only starts serving a file after the first successful GitHub Release. The workflow also supports manual runs, which upload an APK build artifact for testing; a public tagged release requires all four signing secrets.
