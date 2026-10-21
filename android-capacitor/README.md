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
