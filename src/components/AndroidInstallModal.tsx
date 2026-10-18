/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Android APK & Mobile Installation Modal
 */

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  FileCode, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  GitBranch,
  Copy,
  Check
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'apk' | 'pwa' | 'gradle'>('github');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  if (!isOpen) return null;

  const gitPushCommand = `# In your terminal or command prompt:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gitPushCommand).then(() => {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-lg shadow-sm">
              <Smartphone className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Android APK & GitHub Actions Build
              </h3>
              <p className="text-xs text-emerald-300">
                Package: <span className="font-mono text-amber-300">com.tajweedai.app</span> • Min SDK 24
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs: GitHub Push, Download APK, 1-Tap PWA, Local Gradle */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'github'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. Push to GitHub
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            2. Download APK Artifact
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            3. Instant Android Install (PWA)
          </button>
          <button
            onClick={() => setActiveTab('gradle')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'gradle'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            4. Local Gradle Build
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-700 leading-relaxed">
          
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  GitHub Actions Cloud APK Builder Ready (.github/workflows/build-apk.yml)
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  The native Android configuration, Capacitor assets, and automated GitHub Actions workflow are fully prepared and committed. When you push to your GitHub repository, GitHub Actions will compile the Android APK automatically in the cloud.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900">Run this to push to your GitHub repo:</h4>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                    <span>{copiedCmd ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>

                <div className="bg-stone-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1 shadow-inner border border-stone-800">
                  <div className="text-stone-400"># Set your GitHub repository URL:</div>
                  <div className="text-white">git remote add origin https://github.com/<span className="text-amber-400">YOUR_USERNAME</span>/<span className="text-amber-400">YOUR_REPOSITORY</span>.git</div>
                  <div className="text-stone-400 pt-1"># Push all code, native Android files, and CI workflows:</div>
                  <div className="text-white">git branch -M main</div>
                  <div className="text-emerald-300 font-bold">git push -u origin main</div>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-800 text-xs">What happens when you push:</div>
                <ol className="space-y-1 list-decimal list-inside text-xs text-stone-600">
                  <li>GitHub Actions triggers the <strong>"Build Android Debug APK"</strong> job.</li>
                  <li>Ubuntu runner provisions Java 17, Android SDK 34, and builds the web bundle.</li>
                  <li>Gradle compiles <span className="font-mono text-emerald-800 font-bold">app-debug.apk</span> and attaches it to the workflow run.</li>
                  <li>You can download the APK file directly to your phone from the GitHub Actions tab!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Downloading the APK Artifact from GitHub
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Every commit pushed to <span className="font-mono font-bold">main</span> compiles the installable Android package and saves it under GitHub Actions Artifacts.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900">Step-by-step download instructions:</h4>
                <ol className="space-y-2.5 list-decimal list-inside text-xs text-stone-600">
                  <li>Navigate to your GitHub repository in your web browser.</li>
                  <li>Click on the <strong className="text-stone-900">Actions</strong> tab at the top.</li>
                  <li>Click on the most recent run titled <strong className="text-stone-900">"Build Android Debug APK"</strong>.</li>
                  <li>Scroll down to the <strong className="text-stone-900">Artifacts</strong> section at the bottom of the summary page.</li>
                  <li>Click <span className="font-mono text-emerald-800 bg-stone-100 px-1.5 py-0.5 rounded font-bold">TajweedAI-debug-apk</span> to download the ZIP file.</li>
                  <li>Extract the ZIP to find <span className="font-mono text-emerald-800 font-bold">app-debug.apk</span>.</li>
                  <li>Transfer the APK to your Android device (via USB, Google Drive, WhatsApp, or email) and tap to install! (Enable <em>"Install unknown apps"</em> if prompted by Android).</li>
                </ol>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Configured Native Android Permissions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] text-stone-600">
                  <div>✓ android.permission.RECORD_AUDIO</div>
                  <div>✓ android.permission.INTERNET</div>
                  <div>✓ android.permission.MODIFY_AUDIO_SETTINGS</div>
                  <div>✓ android.permission.ACCESS_NETWORK_STATE</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="font-bold">Instant Android Mobile App Experience</div>
                <p>
                  TajweedAI is configured with a Web App Manifest and offline caching. You can install it on your Android home screen as a standalone full-screen app right now without waiting for compilation!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900">How to Install on Android Chrome:</h4>
                <ol className="space-y-2 list-decimal list-inside text-xs text-stone-600">
                  <li>Open this URL in <strong className="text-stone-900">Chrome for Android</strong>.</li>
                  <li>Tap the three vertical dots <strong className="text-stone-900">(⋮)</strong> menu in the top-right corner.</li>
                  <li>Tap <strong className="text-stone-900">"Install app"</strong> or <strong className="text-stone-900">"Add to Home screen"</strong>.</li>
                  <li>Tap <strong className="text-stone-900">Install</strong>. The TajweedAI icon with emerald and gold theme will appear on your phone home screen!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'gradle' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                To build the Android project locally using Gradle command line tools on your computer:
              </p>

              <div className="bg-stone-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1 shadow-inner border border-stone-800">
                <div className="text-stone-400"># 1. Build frontend distribution</div>
                <div className="text-white">npm run build</div>
                <div className="text-stone-400 pt-2"># 2. Bundle into Android assets directory</div>
                <div className="text-white">mkdir -p android/app/src/main/assets/public</div>
                <div className="text-white">cp -r dist/* android/app/src/main/assets/public/</div>
                <div className="text-stone-400 pt-2"># 3. Assemble debug APK</div>
                <div className="text-white">cd android</div>
                <div className="text-emerald-300 font-bold">./gradlew assembleDebug</div>
              </div>

              <div className="text-xs text-stone-600">
                The output APK is generated at: <br />
                <span className="font-mono text-emerald-900 bg-stone-100 px-2 py-0.5 rounded font-semibold">
                  android/app/build/outputs/apk/debug/app-debug.apk
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            TajweedAI v1.0.0 (Hafs ‘an ‘Asim Edition)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
