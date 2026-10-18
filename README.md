# TajweedAI — Qur’anic Recitation & Tajweed Learning Assistant
**Recitation Tradition:** Hafs ‘an ‘Asim via Ash-Shatibiyyah  
**Platform Target:** Android-First (with responsive cross-platform web architecture)

---

## 1. Core Purpose & Religious Responsibility

TajweedAI is an Islamic recitation and Tajweed learning companion designed to help students identify possible pronunciation and Tajweed inconsistencies using verified classical knowledge.

### Sacred Integrity & Safety Standard:
* **Zero Fabrication:** The app never fabricates Qur'anic verses, Tajweed rulings, or scholarly quotations.
* **Separated Confidences:** Transcription confidence (verse text matching) is strictly separated from pronunciation-assessment confidence (Tajweed rule adherence).
* **Safe Abstention Standard:** Whenever acoustic evidence, signal-to-noise ratio, or duration is ambiguous, the app strictly abstains rather than producing confident misinformation:  
  > *"I could not assess this recitation reliably. Please repeat this portion or ask a qualified Tajweed teacher."*
* **Talaqqi Disclaimer:** Automated feedback assists personal study and can **never** replace oral recitation (*Talaqqi wa Musyafahah*) before an authorized Qur'an teacher (*Muqri'*) holding an unbroken chain of transmission (*Isnad*).

---

## 2. Android-First Architecture & APK Build Workflow

The codebase is built with an Android-first architecture using Capacitor and native Gradle configurations, allowing the exact same TypeScript domain models, Tajweed rule engine, and audio processing pipelines to run on mobile APK and responsive web.

### Automated GitHub Actions APK Build
The repository includes `.github/workflows/build-apk.yml`. To obtain a debug APK:
1. Push to your GitHub repository or click **Run workflow** in the **Actions** tab.
2. The CI environment compiles the Android project using JDK 17 and Android SDK 34.
3. Download the zipped artifact **`TajweedAI-debug-apk`** containing `app-debug.apk` directly from the workflow summary.
4. Install onto any Android device (Android 7.0+ / API 24+).

### Local Android Build Steps
```bash
# 1. Install dependencies and compile production assets
npm install
npm run build

# 2. Sync distribution assets into Android assets folder
mkdir -p android/app/src/main/assets/public
cp -r dist/* android/app/src/main/assets/public/

# 3. Compile the debug APK
cd android
./gradlew assembleDebug

# Output APK: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Verified Tajweed Rule Coverage

Structured rule catalog strictly referenced against **Tuḥfat al-Aṭfāl** (by Imam al-Jamzuri) and **Al-Muqaddimah al-Jazariyyah** (by Imam Ibn al-Jazari):

1. **Makhārij al-Ḥurūf:** The 17 specific articulation points across the 5 general regions (Al-Jawf, Al-Halq, Al-Lisan, Ash-Shafatayn, Al-Khayshum).
2. **Ṣifāt al-Ḥurūf:** Intrinsic characteristics with opposites (Hams, Jahr, Shiddah, Rakhawah, Tawassut, Isti'la, Istifal, Itbaq, Infitah) and without opposites (Qalqalah, Safir, Leen, Inhiraf, Takrir, Tafashshi, Istitalah, Ghunnah).
3. **Aḥkām an-Nūn as-Sākinah wa at-Tanwīn:**
   * Idh-hār Ḥalqī (ء ه ع ح غ خ)
   * Idghām bi-Ghunnah (ي ن م و) & Idghām bi-Ghayri Ghunnah (ل ر)
   * Iqlāb (ب)
   * Ikhfā’ Ḥaqīqī (15 letters with heavy/light Ghunnah tracking)
4. **Aḥkām al-Mīm as-Sākinah:**
   * Ikhfā’ Shafawī (ب)
   * Idghām Mithlayn Ṣaghīr (م)
   * Idh-hār Shafawī (remaining 26 letters with Waw/Fa caution)
5. **Marātib al-Ghunnah:** Four classical degrees (Akmal, Kamilah, Naqisah, Anqas).
6. **Aḥkām al-Madd:**
   * Madd Ṭabī‘ī / Aṣlī (2 harakat)
   * Madd Wājib Muttaṣil (4-5 harakat)
   * Madd Jā’iz Munfaṣil (4-5 harakat)
   * Madd ‘Āriḍ li-s-Sukūn (2, 4, or 6 harakat)
   * Madd Lāzim Kalimī / Ḥarfī (strict 6 harakat)
7. **Al-Qalqalah:** Degrees of Qalqalah (Sughrā in continuous speech, Kubrā upon stopping, Akbar on doubled letters) on *Quṭbu Jaddin* (ق ط ب ج د).
8. **Tafkhīm & Tarqīq:** Heavy letters (*Khuṣṣa Ḍaghṭin Qizh*), Lam in Lafẓ al-Jalālah, and the eight cases of Ra Tafkhim vs four cases of Ra Tarqiq.
9. **Aḥkām al-Waqf wa al-Ibtidā’:** Rules of stopping and starting (Tām, Kāfī, Ḥasan, Qabīḥ) and Mushaf stop symbols.

---

## 4. Feature Implementation & Disclosure Status

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Qur'anic Text & Typography** | Implemented | Verified Uthmani script (Amiri Quran font) with word-by-word tokenization and diacritics. |
| **Live Recitation & Waveform** | Implemented | Real-time audio waveform and frequency spectrum analysis via WebAudio API. |
| **Word-by-Word Review** | Implemented | Interactive token review showing active rules, phonetics, and practice tips. |
| **Reference Reciter Audio** | Implemented | Shaykh Mahmoud Khalil Al-Husary educational reference audio integration. |
| **Memorization Mode** | Implemented | Conceals verse text to test memory recall with scores kept separate from Tajweed phonetics. |
| **Grounded AI Teaching Assistant** | Implemented | Powered by Gemini 3.8 Flash (`/api/assistant`) with strict Islamic system instructions and classical citations. |
| **Beginner Lessons & Quizzes** | Implemented | Interactive modular curriculum with comprehension checks and progress tracking. |
| **Daily Goals & Focus Areas** | Implemented | Tracking streak, minutes practiced, and recurring pronunciation difficulties. |
| **Teacher Validation Benchmark** | Implemented | Labeled validation dataset measuring false corrections, missed errors, and 100% abstention on noisy input. |
| **Micro-Makharij Fine Assessment** | Safeguarded (Abstains) | Subtle mouth/tongue shape attributes require physical Talaqqi. System abstains rather than making unverified guesses. |

---

## 5. Privacy & Offline Operation

* Audio recordings are processed in-memory and are **never** permanently stored or shared without user consent.
* A one-click **"Delete All Saved Progress & Recordings"** control allows complete data wipes at any time.
* All verified Qur'anic text, Tajweed rules, lessons, and progress data operate offline.
