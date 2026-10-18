# TajweedAI — Android Setup & APK Build Guide

This document details the build prerequisites, native Android architecture, microphone security flows, and GitHub Actions CI workflow for compiling the installable Android APK.

---

## 1. Prerequisites & Required SDKs

To compile and package the native Android APK locally, ensure your development machine has:

* **Java Development Kit (JDK):** Version 17 (Eclipse Temurin or OpenJDK recommended).
* **Node.js:** v18.0.0 or v20.x with npm.
* **Android SDK:**
  * **Compile SDK:** 34 (Android 14)
  * **Target SDK:** 34
  * **Minimum SDK:** 24 (Android 7.0 Nougat — ensures >95% global Android device compatibility)
  * **Android SDK Build-Tools:** 34.0.0+
  * **Android SDK Command-line Tools (latest)**
* **Gradle:** v8.2+ (packaged automatically if using `./gradlew`).

---

## 2. Automated Cloud APK Build via GitHub Actions

A ready-to-run GitHub Actions workflow is provided in `.github/workflows/build-apk.yml`.

### How to obtain the APK from GitHub Actions:
1. Push your repository to GitHub.
2. In your GitHub repository, navigate to the **Actions** tab.
3. Select **"Build Android Debug APK"** from the left sidebar.
4. Click **"Run workflow"** (or push any commit to `main`).
5. Once the job succeeds (~3 minutes), click on the completed run.
6. Scroll down to the **Artifacts** section at the bottom of the summary page.
7. Click **`TajweedAI-debug-apk`** to download the ZIP file containing `app-debug.apk`.
8. Transfer the `.apk` to your Android device via USB, Google Drive, or WhatsApp, and tap to install (enable "Install unknown apps" if prompted).

---

## 3. Local APK Compilation (Command Line)

To build the APK on your local Linux, macOS, or Windows machine:

```bash
# 1. Install frontend dependencies and build assets
npm install
npm run build

# 2. Copy the production web bundle into the Android assets directory
mkdir -p android/app/src/main/assets/public
cp -r dist/* android/app/src/main/assets/public/

# 3. Enter Android directory and compile debug APK
cd android
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Install onto a Connected Android Phone via ADB:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Android Microphone Permission & Audio Handling

### Declared Permissions in `AndroidManifest.xml`:
* `android.permission.RECORD_AUDIO`: Allows real-time microphone input for Tartil tempo and acoustic analysis.
* `android.permission.MODIFY_AUDIO_SETTINGS`: Configures voice audio routing.
* `android.permission.INTERNET`: Used exclusively for accessing the verified classical AI assistant and educational reference reciter audio streaming.

### Android WebView Audio Bridge:
`MainActivity.java` contains a custom `WebChromeClient.onPermissionRequest()` callback that bridges Android runtime permissions (`ActivityCompat.requestPermissions`) with the W3C `navigator.mediaDevices.getUserMedia` standard used inside the app.

---

## 5. Model Limitations & Scholarly Integrity Disclosure

In accordance with Islamic scholarly responsibility and the core requirements of this application:

| Feature / Rule Category | Implementation Status | Acoustic Detection Feasibility |
| :--- | :--- | :--- |
| **Madd Timing (2, 4, 5, 6 Harakat)** | Fully Implemented | **High:** Measured acoustic duration against Tartil tempo. |
| **Noon Sakinah & Tanween** | Fully Implemented | **Moderate:** Identifies presence across word boundaries; detects lack of Ghunnah in Idgham Bila Ghunnah. |
| **Qalqalah Bounce on Sukoon** | Fully Implemented | **Moderate:** Acoustic transient bounce detection on quiescent Qutbu Jadd letters. |
| **Ghunnah Degrees (Akmal, etc.)** | Fully Implemented | **High:** Nasal cavity energy resonance detection. |
| **Waqf & Ibtida' Pauses** | Fully Implemented | **High:** Breath and silence boundary detection. |
| **Micro-Makharij & Sifat (e.g. Istitalah, Hams)** | Safeguarded (Abstains) | **Audio-Limited:** Requires physical observation of mouth and tongue posture (Talaqqi wa Musyafahah). The app **abstains** rather than generating inaccurate automated rulings. |

---

## 6. Offline Support & Data Privacy

* **Offline Readiness:** All verified Qur'anic text, Tajweed rules, classical citations, lessons, and practice history are stored in offline-capable local storage.
* **Recording Privacy:** Voice recordings are processed in-memory and are **never stored on remote servers or retained permanently** unless the user explicitly toggles the local recording save option.
* **Resetting Data:** A one-click "Delete All Data & Recordings" control is available inside the application settings.
