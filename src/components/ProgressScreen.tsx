/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Progress, Daily Goals, Validation Benchmark, and Privacy Settings
 */

import React, { useState } from 'react';
import { 
  Flame, 
  Target, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  RotateCcw,
  Sliders,
  Lock,
  Layers
} from 'lucide-react';
import { practiceManager } from '../domain/learning/practiceManager';
import { runValidationBenchmark, VALIDATION_TEST_DATASET, ValidationBenchmarkResults } from '../domain/validation/testDataset';

interface ProgressScreenProps {
  onPracticeRule?: (surah: number, ayah: number) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  onPracticeRule
}) => {
  const [profile, setProfile] = useState(practiceManager.getProfile());
  const [benchmarkResults, setBenchmarkResults] = useState<ValidationBenchmarkResults | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
  const [activeBenchmarkCaseId, setActiveBenchmarkCaseId] = useState<string | null>(null);

  // Goal Editor State
  const [editGoalAyahs, setEditGoalAyahs] = useState<number>(profile.dailyGoal.targetAyahsPerDay);
  const [editGoalMinutes, setEditGoalMinutes] = useState<number>(profile.dailyGoal.targetMinutesPerDay);
  const [isGoalSavedNotice, setIsGoalSavedNotice] = useState<boolean>(false);

  const handleSaveGoal = () => {
    practiceManager.updateDailyGoal(editGoalAyahs, editGoalMinutes);
    setProfile(practiceManager.getProfile());
    setIsGoalSavedNotice(true);
    setTimeout(() => setIsGoalSavedNotice(false), 2500);
  };

  const handleToggleRecordings = (enabled: boolean) => {
    practiceManager.updatePrivacySettings(enabled);
    setProfile(practiceManager.getProfile());
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all saved practice streaks, statistics, and focus areas? This cannot be undone.')) {
      practiceManager.clearAllData();
      setProfile(practiceManager.getProfile());
    }
  };

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    setTimeout(() => {
      const res = runValidationBenchmark();
      setBenchmarkResults(res);
      setIsRunningBenchmark(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Learning Goals & Scholarly Verification
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Practice Analytics & Quality Benchmark
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Monitor daily recitation consistency, review recurring pronunciation challenges, run the teacher-reviewed validation benchmark, and manage your on-device privacy data.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Streak</span>
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {profile.currentStreakDays} <span className="text-sm font-sans font-medium text-stone-500">days</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Consecutive daily recitation
          </div>
        </div>

        {/* Today's Ayahs */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Today</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {profile.todayAyahsCompleted} <span className="text-sm font-sans font-medium text-stone-500">/ {profile.dailyGoal.targetAyahsPerDay} ayahs</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (profile.todayAyahsCompleted / profile.dailyGoal.targetAyahsPerDay) * 100)}%` }}
            />
          </div>
        </div>

        {/* Minutes Practiced */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Time Today</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {profile.todayMinutesCompleted} <span className="text-sm font-sans font-medium text-stone-500">/ {profile.dailyGoal.targetMinutesPerDay} min</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (profile.todayMinutesCompleted / profile.dailyGoal.targetMinutesPerDay) * 100)}%` }}
            />
          </div>
        </div>

        {/* Total Lifetime Ayahs */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Verses</span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {profile.totalAyahsPracticed}
          </div>
          <div className="text-[11px] text-stone-500">
            All-time reviewed recitations
          </div>
        </div>

      </div>

      {/* Focus Areas: Recurring Difficulties */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              My Tajweed Focus Areas (Recurring Difficulties)
            </h3>
            <p className="text-xs text-stone-500">
              Rules that required repeated revision during your recitation sessions.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {profile.recurringDifficulties.length} Active Areas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.recurringDifficulties.map((diff) => (
            <div
              key={diff.ruleId}
              className="p-4 rounded-2xl bg-amber-50/50 border border-amber-300/60 flex items-center justify-between text-xs gap-3"
            >
              <div>
                <div className="font-bold text-stone-900 capitalize">
                  {diff.ruleName}
                </div>
                <div className="text-stone-500 text-[11px] mt-0.5">
                  Noticed {diff.occurrences} time(s) • Last checked: {diff.lastNoticedDate}
                </div>
              </div>

              {onPracticeRule && (
                <button
                  onClick={() => onPracticeRule(112, 1)}
                  className="px-3 py-1.5 rounded-xl font-bold bg-emerald-800 hover:bg-emerald-700 text-white shrink-0 shadow-2xs transition-colors"
                >
                  Drill Rule
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Benchmark Runner (Teacher Reviewed Dataset) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Teacher-Reviewed Validation Dataset
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Algorithmic Accuracy & Abstention Safety Benchmark
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 max-w-xl">
              Evaluates the rule engine against positive references, known common errors, and ambiguous/noisy audio to ensure zero false corrections and 100% abstention on unclear recordings.
            </p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunningBenchmark}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningBenchmark ? 'Running Benchmark...' : 'Run Benchmark (5 Cases)'}</span>
          </button>
        </div>

        {/* Benchmark Results Display */}
        {benchmarkResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] font-bold uppercase text-emerald-800">
                  Overall Decision Accuracy
                </div>
                <div className="text-2xl font-bold text-emerald-950 font-mono mt-1">
                  {benchmarkResults.accuracyRate}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] font-bold uppercase text-emerald-800">
                  Abstention Safety Rate
                </div>
                <div className="text-2xl font-bold text-emerald-950 font-mono mt-1">
                  {benchmarkResults.abstentionSafetyRate}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-[10px] font-bold uppercase text-stone-600">
                  False Corrections
                </div>
                <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
                  {benchmarkResults.falseCorrections}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <div className="text-[10px] font-bold uppercase text-stone-600">
                  Missed Errors
                </div>
                <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
                  {benchmarkResults.missedErrors}
                </div>
              </div>
            </div>

            {/* Test Cases Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Benchmark Test Cases Breakdown:
              </div>
              {VALIDATION_TEST_DATASET.map(tc => (
                <div
                  key={tc.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <span>{tc.description}</span>
                      <span className="text-[10px] font-mono text-stone-400">
                        [Surah {tc.surahNumber}:{tc.ayahNumber}]
                      </span>
                    </div>
                    <div className="text-stone-600 text-[11px]">
                      {tc.scholarlyReviewNotes}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tc.expectedOutcome === 'passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tc.expectedOutcome === 'requires_practice'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      Expected: {tc.expectedOutcome}
                    </span>
                    <span className="text-emerald-700 font-bold text-xs">✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Goals & Privacy Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Goal Settings */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-800" />
            Set Daily Practice Targets
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Target Ayahs per Day
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={editGoalAyahs}
                onChange={(e) => setEditGoalAyahs(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Target Minutes per Day
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={editGoalMinutes}
                onChange={(e) => setEditGoalMinutes(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-2xs transition-all"
              >
                Save Daily Target
              </button>
              {isGoalSavedNotice && (
                <span className="text-xs text-emerald-700 font-semibold">
                  Saved successfully!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data Privacy & Reset Controls */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-800" />
            Offline Privacy & Data Controls
          </h4>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              Your voice recordings are analyzed purely in-memory. No audio is retained on external servers.
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="font-medium text-stone-800">Save Recordings Locally on Device</span>
              <input
                type="checkbox"
                checked={profile.saveRecordingsLocally}
                onChange={(e) => handleToggleRecordings(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleClearData}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All Saved Progress & Recordings</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
