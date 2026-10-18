/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Correction Panel Component - Slides up after recitation analysis
 * Displays specific cards for each identified error detailing:
 * - Rule name & observed issue
 * - Correct Makhraj (Point of Articulation) with anatomical guidance
 * - Correct Sifat (Characteristics) with acoustic details
 * - Button to replay verified correct pronunciation (Muqri' audio)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Bookmark, 
  HelpCircle,
  RotateCcw,
  VolumeX,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PronunciationCorrection } from '../domain/tajweed/types';

interface CorrectionPanelProps {
  corrections: PronunciationCorrection[];
  referenceAudioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onFocusWord?: (wordIndex: number) => void;
  onAskAssistant?: (query: string) => void;
  focusedWordIndex?: number | null;
}

export const CorrectionPanel: React.FC<CorrectionPanelProps> = ({
  corrections,
  referenceAudioUrl,
  isOpen,
  onClose,
  onFocusWord,
  onAskAssistant,
  focusedWordIndex
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync active card if user tapped a word on the Quran screen
  useEffect(() => {
    if (focusedWordIndex !== null && focusedWordIndex !== undefined) {
      const matchIndex = corrections.findIndex(c => c.wordIndex === focusedWordIndex);
      if (matchIndex !== -1) {
        setActiveCardIndex(matchIndex);
        setIsMinimized(false);
      }
    }
  }, [focusedWordIndex, corrections]);

  if (!isOpen || corrections.length === 0) return null;

  const currentCorrection = corrections[activeCardIndex] || corrections[0];

  const handlePlayReferenceAudio = () => {
    const audioSrc = currentCorrection.audioReferenceUrl || referenceAudioUrl;
    if (!audioSrc) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => setIsPlayingAudio(false);
    } else {
      audioRef.current.src = audioSrc;
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(e => {
        console.warn('Audio play failed:', e);
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out transform ${
        isMinimized ? 'translate-y-[calc(100%-54px)]' : 'translate-y-0'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 pb- safe">
        <div className="bg-white rounded-t-3xl shadow-2xl border-2 border-amber-500/40 border-b-0 overflow-hidden ring-1 ring-black/5">
          
          {/* Slide-Up Panel Header Bar */}
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white px-5 py-3.5 flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-900/40 border border-amber-300/40 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                    Pronunciation Correction Panel
                  </h3>
                  <span className="text-[11px] font-mono bg-amber-950/40 text-amber-100 px-2 py-0.5 rounded-full border border-amber-400/40">
                    {corrections.length} {corrections.length === 1 ? 'Adjustment' : 'Adjustments'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1 rounded-lg hover:bg-amber-800/60 text-amber-100 transition-colors"
                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
              >
                {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 rounded-lg hover:bg-amber-800/60 text-amber-100 transition-colors"
                title="Dismiss panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Main Content Area */}
          <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5 bg-[#fdfbf7]">
            
            {/* Multiple Corrections Selector Tabs (if > 1 error) */}
            {corrections.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200/80">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
                  Identified Issues:
                </span>
                {corrections.map((corr, idx) => {
                  const isActive = idx === activeCardIndex;
                  return (
                    <button
                      key={corr.id}
                      onClick={() => {
                        setActiveCardIndex(idx);
                        if (onFocusWord) onFocusWord(corr.wordIndex);
                      }}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span className="font-arabic text-sm">{corr.arabicWord}</span>
                      <span className="font-mono text-[10px] opacity-80 truncate max-w-[90px]">({corr.ruleName})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Correction Card */}
            <div className="bg-white rounded-2xl border border-amber-300/60 shadow-sm p-5 space-y-5">
              
              {/* Word & Rule Identity Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md border border-rose-200">
                      Pronunciation Flag #{activeCardIndex + 1}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      Rule: {currentCorrection.ruleName}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 mt-1">
                    Acoustic Correction for "{currentCorrection.transliteration}"
                  </h4>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="font-quran text-3xl sm:text-4xl text-emerald-950 font-bold bg-amber-50/80 px-4 py-1.5 rounded-2xl border border-amber-200/80" dir="rtl">
                    {currentCorrection.arabicWord}
                  </div>
                </div>
              </div>

              {/* Observed Issue vs Expected Recitation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* What Was Observed */}
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-1.5">
                  <div className="font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Observed Issue (What was heard)
                  </div>
                  <p className="text-rose-900 leading-relaxed font-sans">
                    {currentCorrection.observedIssue}
                  </p>
                </div>

                {/* Expected Standard */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Hafs ‘an ‘Asim Requirement
                  </div>
                  <p className="text-emerald-900 leading-relaxed font-sans">
                    {currentCorrection.expectedRecitation}
                  </p>
                </div>

              </div>

              {/* Makhraj & Sifat Detailed Technical Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* Correct Makhraj (Point of Articulation) */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-300/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      Correct Makhraj (مَخْرَجُ الحَرْف)
                    </span>
                    <span className="text-[10px] font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                      {currentCorrection.makhraj.regionArabic}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-stone-900">
                    {currentCorrection.makhraj.specificPoint}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans">
                    {currentCorrection.makhraj.anatomicalGuidance}
                  </p>
                </div>

                {/* Correct Sifat (Characteristics) */}
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-300/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                      Correct Ṣifāt (صِفَاتُ الحَرْف)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCorrection.sifat.primarySifat.map((sifah, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[11px] font-semibold bg-white border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded-lg shadow-2xs"
                      >
                        {sifah}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans pt-1">
                    {currentCorrection.sifat.sifatExplanation}
                  </p>
                </div>

              </div>

              {/* Action Buttons: Replay Audio & Ask AI Assistant */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                
                {/* Replay Verified Recitation Button */}
                <button
                  type="button"
                  onClick={handlePlayReferenceAudio}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95 ${
                    isPlayingAudio
                      ? 'bg-emerald-900 text-white animate-pulse'
                      : 'bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-amber-400' : ''}`} />
                  <span>{isPlayingAudio ? 'Playing Verified Audio (Shaykh Al-Husary)...' : 'Replay Correct Pronunciation'}</span>
                </button>

                {/* Oral Practice Tip */}
                <div className="text-xs text-stone-600 italic">
                  Tip: {currentCorrection.practiceTip}
                </div>

                {/* Ask AI Assistant Button */}
                {onAskAssistant && (
                  <button
                    type="button"
                    onClick={() => onAskAssistant(`Can you give me step-by-step oral drills to fix my pronunciation on the word "${currentCorrection.arabicWord}" (${currentCorrection.ruleName})?`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-500/30 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ask Assistant for Drills</span>
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
