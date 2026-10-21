# SafaMarwah Android — Capacitor

This is an Android wrapper for the existing SafaMarwah static website. It does not replace the existing PWA. The web assets are copied locally into the APK, retaining offline-capable content; network-dependent features still need a connection.

## Build with GitHub Actions

Open **Actions → SafaMarwah Android APK → Run workflow**. After a successful run, download the **SafaMarwah-Android-debug-APK** artifact, unzip it and install app-debug.apk on your Android test device. The APK is a debug/test build, not a Play Store release. The Android application is separate from the Chrome-installed PWA.

## Local build

Install Node.js 22, Android SDK and Java 21. From this directory run:

```bash
npm install
npm run android:init
cd android
./gradlew assembleDebug
```

The generated project is intentionally not committed; GitHub Actions generates it each time. The native MainActivity sets decorFitsSystemWindows(false), transparent status bar and light-colored status icons. Android OS and manufacturer may still impose restrictions. Test on an actual Android device and inspect screenshots. The source site remains untouched.

## Important

The home background currently uses **kaaba.jpg**, not the AI mockup image with the Clock Tower. A matching licensed image must be added separately for visual parity. Production distribution requires signing, icon review, app testing and an Android release workflow.

## v1.1 Hybrid online-first updates

The APK opens a local `hybrid-shell.html` that embeds `https://app.safamarwah.my/` when reachable. The website replies to a same-origin-restricted handshake to confirm it actually rendered. After 10 seconds without confirmation, or when offline, the shell loads a bundled `offline.html` snapshot. Use the **Cuba lagi** button or reconnect to retry.

Web UI/content changes deployed to app.safamarwah.my can appear without an APK reinstall, **provided the site allows framing in Android WebView**. If the host sends `X-Frame-Options: DENY/SAMEORIGIN` or restrictive `Content-Security-Policy: frame-ancestors`, the online frame cannot load; in that case the APK falls back to its offline snapshot. Inspect real-device logs/screenshots before treating the hybrid approach as production ready. Network-only content and service APIs still require internet.

The bundled offline snapshot and native functionality (launcher icon, Android status bar, native plugins) require rebuilding and reinstalling a signed APK. A GitHub Actions green run confirms build success only, not that online embedding works. The debug APK signing identity may differ between builds; uninstall/reinstall may be necessary and can erase local app data.
