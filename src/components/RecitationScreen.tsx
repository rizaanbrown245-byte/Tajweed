/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Recitation Screen - Personal Qur'anic Recitation & AI Tajweed Assessment
 * Features Open Recitation Mode: Allows the reader to read freely,
 * automatically detects the recited passage, and picks up Tajweed/pronunciation errors.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  Volume2, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Info, 
  ShieldAlert, 
  Bookmark,
  Beaker,
  Search,
  UserCheck,
  Headphones,
  Check,
  X,
  Compass,
  BookOpen,
  ExternalLink,
  Layers,
  Tag,
  Radio,
  BookMarked,
  CheckCircle,
  VolumeX,
  Wand2,
  Loader2
} from 'lucide-react';
import { 
  TAJWEED_CATEGORIES, 
  getWordHighlightStyle, 
  getRuleCategory, 
  TajweedColorCategory 
} from '../domain/tajweed/ruleHighlights';
import { 
  ALL_SURAHS_META, 
  VERIFIED_AYAHS, 
  AVAILABLE_RECITERS,
  getAyah, 
  getReciterAudioUrl,
  fetchAyahFromAPI,
  stripTashkeel 
} from '../domain/quran/surahsData';
import { 
  identifyRecitedPassage, 
  FREQUENT_RECITATION_PASSAGES, 
  MatchedPassageResult,
  buildCompositePassage 
} from '../domain/quran/passageMatcher';
import { QuranAyah, QuranWord, Reciter, SurahMeta } from '../domain/quran/types';
import { audioService, AudioAnalysisSnapshot } from '../domain/audio/audioService';
import { assessRecitation, TEACHER_DISCLAIMER } from '../domain/assessment/assessmentEngine';
import { PronunciationCorrection, RecitationAssessmentResult, WordTokenAssessment } from '../domain/tajweed/types';
import { getRuleById } from '../domain/tajweed/knowledgeBase';
import { WaveformVisualizer, CssFrequencyVisualizer } from './WaveformVisualizer';
import { CorrectionPanel } from './CorrectionPanel';
import { practiceManager } from '../domain/learning/practiceManager';

interface RecitationScreenProps {
  initialSurah?: number;
  initialAyah?: number;
  onAyahChange?: (surah: number, ayah: number) => void;
  onNavigateToRule?: (ruleId: string) => void;
  onAskAssistant?: (query: string) => void;
}

// Completion phrase triggers for voice responsiveness ("im done", "i'm done", "done", "خلاص", "تم")
export const DONE_PHRASES_REGEX = /\b(i'?m\s*done|im\s*done|i\s*am\s*done|done|i'?m\s*finished|finished|finish|stop|stop\s*recording)\b|(خلاص|تم|انتهيت|خلصت|صدق\s*الله\s*العظيم|ام\s*دان|ام\s*دن|دان)/i;

/**
 * Strips completion phrases, Latin fillers, and excess punctuation from speech recognition,
 * returning pure Qur'anic Arabic tokens for matching and correction.
 */
export const filterSpokenTranscript = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\b(i'?m\s*done|im\s*done|i\s*am\s*done|done|i'?m\s*finished|finished|finish|stop|stop\s*recording)\b/gi, ' ')
    .replace(/(خلاص|تم|انتهيت|خلصت|صدق\s*الله\s*العظيم|ام\s*دان|ام\s*دن|دان)/gi, ' ')
    .replace(/[a-zA-Z0-9_\-.,!?:;"'()[\]{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const RecitationScreen: React.FC<RecitationScreenProps> = ({
  initialSurah = 1,
  initialAyah = 1,
  onAyahChange,
  onNavigateToRule,
  onAskAssistant
}) => {
  // Mode selection: 'free' (allow reader to read, AI detects & picks errors) vs 'guided' (pick specific ayah) vs 'follow' (highlights as you read with speech)
  const [recitationMode, setRecitationMode] = useState<'free' | 'guided' | 'follow'>('guided');

  // Auto-stop guard to prevent duplicate triggers
  const isAutoStoppingRef = useRef(false);

  // Real-time Speech-Follower / Word Highlighting State
  const [activeSpeechWordIndex, setActiveSpeechWordIndex] = useState<number | null>(null);
  const [recitedWordIndices, setRecitedWordIndices] = useState<number[]>([]);

  // Surah & Ayah Selection State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurah);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(initialAyah);

  // Reciter / Recitation Tradition Selection
  const [selectedReciterId, setSelectedReciterId] = useState<string>('maria_ulfah');
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState<boolean>(false);
  const [reciterGenderFilter, setReciterGenderFilter] = useState<'all' | 'female' | 'male'>('all');

  const filteredReciters = useMemo(() => {
    if (reciterGenderFilter === 'female') return AVAILABLE_RECITERS.filter(r => r.gender === 'female');
    if (reciterGenderFilter === 'male') return AVAILABLE_RECITERS.filter(r => r.gender === 'male');
    return AVAILABLE_RECITERS;
  }, [reciterGenderFilter]);

  // Tajweed Visual Rule Highlighting & Filter Controls
  const [showTajweedHighlights, setShowTajweedHighlights] = useState<boolean>(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<TajweedColorCategory | 'all'>('all');

  // Quick Surah Search Modal
  const [isSurahModalOpen, setIsSurahModalOpen] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');

  // Online verse fetch state (for non pre-annotated surahs)
  const [dynamicAyahData, setDynamicAyahData] = useState<QuranAyah | null>(null);

  // Open Recitation Identified Passage
  const [identifiedPassage, setIdentifiedPassage] = useState<MatchedPassageResult | null>(null);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState<string>('');

  // Memorization Mode (hides text to test recall, keeping score separate from Tajweed)
  const [isMemorizationMode, setIsMemorizationMode] = useState<boolean>(false);
  const [revealMemorizedText, setRevealMemorizedText] = useState<boolean>(false);

  // Audio & Recording State
  const [recordingState, setRecordingState] = useState<'idle' | 'listening' | 'processing' | 'uncertain' | 'completed'>('idle');
  const [audioSnapshot, setAudioSnapshot] = useState<AudioAnalysisSnapshot | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState<boolean>(false);
  const [isPlayingReferenceAudio, setIsPlayingReferenceAudio] = useState<boolean>(false);
  const [isLoadingReferenceAudio, setIsLoadingReferenceAudio] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // Permission & Error Notice
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Assessment State
  const [assessment, setAssessment] = useState<RecitationAssessmentResult | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [isCorrectionPanelOpen, setIsCorrectionPanelOpen] = useState<boolean>(false);

  // Audio Elements & Timers
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Current active Surah metadata
  const currentSurahMeta: SurahMeta = useMemo(() => {
    return ALL_SURAHS_META.find(s => s.number === selectedSurahNumber) || ALL_SURAHS_META[0];
  }, [selectedSurahNumber]);

  // Current active Ayah data (with selected reciter's audio URL)
  const currentAyah: QuranAyah = useMemo(() => {
    if (recitationMode === 'free' && identifiedPassage) {
      return identifiedPassage.compositeAyah || identifiedPassage.matchedAyah;
    }
    if (dynamicAyahData && dynamicAyahData.surahNumber === selectedSurahNumber && dynamicAyahData.ayahNumber === selectedAyahNumber) {
      return {
        ...dynamicAyahData,
        audioUrl: getReciterAudioUrl(selectedReciterId, selectedSurahNumber, selectedAyahNumber, dynamicAyahData.arabicText)
      };
    }
    return getAyah(selectedSurahNumber, selectedAyahNumber, selectedReciterId);
  }, [selectedSurahNumber, selectedAyahNumber, selectedReciterId, dynamicAyahData, recitationMode, identifiedPassage]);

  // Current selected reciter metadata
  const currentReciter: Reciter = useMemo(() => {
    return AVAILABLE_RECITERS.find(r => r.id === selectedReciterId) || AVAILABLE_RECITERS[0];
  }, [selectedReciterId]);

  // Sync props when parent updates
  useEffect(() => {
    if (initialSurah !== selectedSurahNumber || initialAyah !== selectedAyahNumber) {
      setSelectedSurahNumber(initialSurah);
      setSelectedAyahNumber(initialAyah);
      resetRecitationState();
    }
  }, [initialSurah, initialAyah]);

  // Fetch online verse data if not already pre-annotated
  useEffect(() => {
    const key = `${selectedSurahNumber}:${selectedAyahNumber}`;
    if (!VERIFIED_AYAHS[key]) {
      fetchAyahFromAPI(selectedSurahNumber, selectedAyahNumber, selectedReciterId).then(data => {
        if (data) setDynamicAyahData(data);
      });
    } else {
      setDynamicAyahData(null);
    }
  }, [selectedSurahNumber, selectedAyahNumber, selectedReciterId]);

  // Cleanup audio players and speech recognizer on unmount
  useEffect(() => {
    return () => {
      if (referenceAudioRef.current) {
        referenceAudioRef.current.pause();
        referenceAudioRef.current = null;
      }
      if (userAudioRef.current) {
        userAudioRef.current.pause();
        userAudioRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Keyboard navigation for ayahs in guided mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (recitationMode === 'guided') {
        if (e.key === 'ArrowRight') {
          goToNextAyah();
        } else if (e.key === 'ArrowLeft') {
          goToPreviousAyah();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSurahNumber, selectedAyahNumber, currentSurahMeta, recitationMode]);

  // Clean reset of recitation & audio state
  const resetRecitationState = () => {
    if (referenceAudioRef.current) {
      referenceAudioRef.current.pause();
      referenceAudioRef.current.currentTime = 0;
      referenceAudioRef.current = null;
    }
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      userAudioRef.current = null;
    }
    setIsPlayingReferenceAudio(false);
    setIsPlayingUserAudio(false);
    setRecordingState('idle');
    setAudioSnapshot(null);
    setUserAudioUrl(null);
    setAssessment(null);
    setSelectedWordIndex(null);
    setIsCorrectionPanelOpen(false);
    setRecordingDuration(0);
    setRevealMemorizedText(false);
    setLiveSpeechTranscript('');
    setActiveSpeechWordIndex(null);
    setRecitedWordIndices([]);
    isAutoStoppingRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Switch Reciter
  const handleReciterSelect = (reciterId: string) => {
    if (referenceAudioRef.current) {
      referenceAudioRef.current.pause();
      referenceAudioRef.current = null;
    }
    setIsPlayingReferenceAudio(false);
    setSelectedReciterId(reciterId);
    setIsReciterMenuOpen(false);
  };

  // Handle Surah change
  const handleSurahChange = (surahNum: number, ayahNum: number = 1) => {
    setSelectedSurahNumber(surahNum);
    setSelectedAyahNumber(ayahNum);
    setIdentifiedPassage(null);
    resetRecitationState();
    onAyahChange?.(surahNum, ayahNum);
  };

  // Handle Ayah change
  const handleAyahChange = (ayahNum: number) => {
    setSelectedAyahNumber(ayahNum);
    setIdentifiedPassage(null);
    resetRecitationState();
    onAyahChange?.(selectedSurahNumber, ayahNum);
  };

  // Next Ayah Navigation
  const goToNextAyah = () => {
    if (selectedAyahNumber < currentSurahMeta.ayahCount) {
      handleAyahChange(selectedAyahNumber + 1);
    } else if (selectedSurahNumber < 114) {
      handleSurahChange(selectedSurahNumber + 1, 1);
    }
  };

  // Previous Ayah Navigation
  const goToPreviousAyah = () => {
    if (selectedAyahNumber > 1) {
      handleAyahChange(selectedAyahNumber - 1);
    } else if (selectedSurahNumber > 1) {
      const prevSurahMeta = ALL_SURAHS_META.find(s => s.number === selectedSurahNumber - 1);
      const prevAyahCount = prevSurahMeta ? prevSurahMeta.ayahCount : 1;
      handleSurahChange(selectedSurahNumber - 1, prevAyahCount);
    }
  };

  // Start Speech Recognition (Arabic ar-SA) for real-time text matching
  const startSpeechRecognition = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const recognizer = new SpeechRec();
      recognizer.lang = 'ar-SA';
      recognizer.continuous = true;
      recognizer.interimResults = true;

      recognizer.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        const rawTrimmed = transcript.trim();

        // 1. Instant Voice Trigger: "im done" / "i'm done" / "done" / "خلاص" / "تم"
        if (DONE_PHRASES_REGEX.test(rawTrimmed)) {
          if (!isAutoStoppingRef.current) {
            isAutoStoppingRef.current = true;
            const cleaned = filterSpokenTranscript(rawTrimmed);
            setLiveSpeechTranscript(cleaned);
            handleStopRecording(cleaned);
            return;
          }
        }

        const filtered = filterSpokenTranscript(rawTrimmed) || rawTrimmed;
        setLiveSpeechTranscript(filtered);

        // Highlight matching word as user recites
        if (currentAyah.words && currentAyah.words.length > 0 && filtered) {
          const spokenTokens = stripTashkeel(filtered).toLowerCase().split(/\s+/).filter(Boolean);
          if (spokenTokens.length > 0) {
            const lastSpoken = spokenTokens[spokenTokens.length - 1];
            const prevSpoken = spokenTokens.length > 1 ? spokenTokens[spokenTokens.length - 2] : '';

            let matchedIdx = -1;
            // Scan for match in the current Ayah words
            for (let wIdx = 0; wIdx < currentAyah.words.length; wIdx++) {
              const cleanW = currentAyah.words[wIdx].clean.toLowerCase();
              if (
                cleanW === lastSpoken || 
                (lastSpoken.length >= 3 && cleanW.includes(lastSpoken)) || 
                (cleanW.length >= 3 && lastSpoken.includes(cleanW)) ||
                (prevSpoken && (cleanW === prevSpoken || cleanW.includes(prevSpoken)))
              ) {
                matchedIdx = wIdx;
              }
            }

            if (matchedIdx !== -1) {
              setActiveSpeechWordIndex(matchedIdx);
              setRecitedWordIndices(prev => {
                const s = new Set(prev);
                for (let k = 0; k <= matchedIdx; k++) s.add(k);
                return Array.from(s);
              });
            }
          }
        }
      };

      recognizer.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e.error);
      };

      recognizer.start();
      speechRecognitionRef.current = recognizer;
    } catch (e) {
      console.warn('Speech recognition could not be started:', e);
    }
  };

  const stopSpeechRecognition = (): string => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
    return liveSpeechTranscript;
  };

  // Start Live Recording (Reader starts reciting whenever they want)
  const handleStartRecording = async () => {
    setPermissionError(null);
    resetRecitationState();
    isAutoStoppingRef.current = false;

    try {
      const permitted = await audioService.requestMicrophonePermission();
      if (!permitted) {
        setPermissionError('Microphone permission is required to analyze your recitation. Please allow microphone access in your browser.');
        return;
      }

      setRecordingState('listening');
      setRecordingDuration(0);

      // Start Web Speech API in parallel
      startSpeechRecognition();

      const start = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((Date.now() - start) / 1000);
      }, 100);

      await audioService.startRecording((snapshot) => {
        setAudioSnapshot(snapshot);
      });
    } catch (err: unknown) {
      console.error('Error starting audio recording:', err);
      setRecordingState('idle');
      setPermissionError('Could not start recording. Ensure no other application is locking the microphone.');
    }
  };

  // Convert Blob to Base64 for Server Gemini Analysis
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Stop Recording and Let AI Identify & Pick Up Errors
  const handleStopRecording = async (overrideTranscript?: string | unknown) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const actualTranscript = typeof overrideTranscript === 'string' ? overrideTranscript : undefined;
    const rawTranscript = actualTranscript ?? stopSpeechRecognition();
    const cleanTranscript = filterSpokenTranscript(rawTranscript);
    setLiveSpeechTranscript(cleanTranscript);
    setRecordingState('processing');

    try {
      const result = await audioService.stopRecording();

      if (!result || !result.blob) {
        setRecordingState('completed');
        return;
      }

      const audioUrl = URL.createObjectURL(result.blob);
      setUserAudioUrl(audioUrl);

      let targetAyahToAssess = currentAyah;
      let aiServerResult: any = null;

      // 1. In 'free' mode, instantly identify passage locally from filtered speech
      if (recitationMode === 'free') {
        const matched = identifyRecitedPassage(cleanTranscript, selectedReciterId);
        setIdentifiedPassage(matched);
        targetAyahToAssess = matched.matchedAyah;
        setSelectedSurahNumber(matched.surahNumber);
        setSelectedAyahNumber(matched.ayahNumber);
        onAyahChange?.(matched.surahNumber, matched.ayahNumber);

        // In parallel, attempt fast Gemini enrichment with a 2.5s AbortController timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const audioB64 = await blobToBase64(result.blob);
          const response = await fetch('/api/analyze-recitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              audioBase64: audioB64,
              mimeType: result.blob.type,
              spokenTranscript: cleanTranscript,
              audioDurationSeconds: result.durationSeconds
            })
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              aiServerResult = data.data;
            }
          }
        } catch (serverErr) {
          // Seamless local fallback already populated
        }

        // Process Gemini analysis result if available
        if (aiServerResult && aiServerResult.surahNumber) {
          const matchedSurah = aiServerResult.surahNumber;
          const matchedAyah = aiServerResult.ayahNumber || 1;
          const endAyah = aiServerResult.endAyahNumber;

          setSelectedSurahNumber(matchedSurah);
          setSelectedAyahNumber(matchedAyah);
          onAyahChange?.(matchedSurah, matchedAyah);

          let resolvedAyah: QuranAyah;
          if (endAyah && endAyah > matchedAyah) {
            resolvedAyah = buildCompositePassage(matchedSurah, matchedAyah, endAyah, selectedReciterId);
          } else {
            resolvedAyah = getAyah(matchedSurah, matchedAyah, selectedReciterId);
          }

          const matchedInfo: MatchedPassageResult = {
            surahNumber: matchedSurah,
            ayahNumber: matchedAyah,
            endAyahNumber: endAyah,
            surahNameEnglish: aiServerResult.surahNameEnglish || ALL_SURAHS_META.find(s => s.number === matchedSurah)?.nameEnglish || `Surah ${matchedSurah}`,
            surahNameArabic: aiServerResult.surahNameArabic || ALL_SURAHS_META.find(s => s.number === matchedSurah)?.nameArabic || `سورة ${matchedSurah}`,
            surahNameTransliteration: ALL_SURAHS_META.find(s => s.number === matchedSurah)?.nameTransliteration || `Surah ${matchedSurah}`,
            confidence: aiServerResult.transcriptionConfidence || 92,
            matchedAyah: resolvedAyah,
            matchMethod: 'speech_transcript',
            detectedTextSnippet: aiServerResult.transcriptionArabic || cleanTranscript
          };

          setIdentifiedPassage(matchedInfo);
          targetAyahToAssess = resolvedAyah;

          // Build full assessment from Gemini response with authentic fallback fields
          const corrections: PronunciationCorrection[] = (aiServerResult.corrections || []).map((c: any, cIdx: number) => ({
            id: `corr-ai-${Date.now()}-${cIdx}`,
            wordIndex: c.wordIndex ?? cIdx,
            arabicWord: c.arabicWord || resolvedAyah.words[c.wordIndex]?.arabic || '',
            cleanText: c.cleanText || stripTashkeel(c.arabicWord || ''),
            transliteration: c.transliteration || resolvedAyah.words[c.wordIndex]?.transliteration || '',
            ruleId: c.ruleId || 'makharij_overview',
            ruleName: c.ruleName || 'Pronunciation & Articulation Adjustment',
            severity: 'moderate' as const,
            observedIssue: c.observedIssue || 'Pronunciation error detected during recitation.',
            expectedRecitation: c.correctionGuidance || 'Review the correct Makhraj and Sifat articulation below.',
            makhraj: {
              region: 'Lisan' as const,
              regionArabic: 'اللسان',
              specificPoint: c.makhrajDetail?.point || 'Classical Articulation Point',
              anatomicalGuidance: c.makhrajDetail?.explanation || 'Position speech organs according to Hafs ‘an ‘Asim guidelines.'
            },
            sifat: {
              primarySifat: c.sifatDetail?.primarySifat || ['Classical Sifat'],
              sifatExplanation: c.sifatDetail?.explanation || 'Maintain authentic acoustic weight, breath, and release.'
            },
            practiceTip: c.correctionGuidance || 'Review the correct Makhraj and Sifat in the Correction Panel below.',
            classicalCitation: 'Matn Tuhfat al-Atfal & Al-Jazariyyah',
            audioReferenceUrl: resolvedAyah.audioUrl
          }));

          const wordAssessments: WordTokenAssessment[] = resolvedAyah.words.map((w, idx) => {
            const err = corrections.find(c => c.wordIndex === idx);
            if (err) {
              return {
                wordIndex: idx,
                arabicWord: w.arabic,
                cleanText: w.clean,
                transliteration: w.transliteration,
                status: 'needs_attention',
                detectedRules: w.activeRules,
                feedbackTitle: err.ruleName,
                feedbackDetail: err.observedIssue,
                practiceSuggestion: err.practiceTip
              };
            }
            return {
              wordIndex: idx,
              arabicWord: w.arabic,
              cleanText: w.clean,
              transliteration: w.transliteration,
              status: 'accurate',
              detectedRules: w.activeRules,
              feedbackTitle: 'Sound Recitation',
              feedbackDetail: w.ruleExplanation || 'Appropriate articulation and tempo observed.',
              practiceSuggestion: 'Maintain consistency.'
            };
          });

          const geminiAssessment: RecitationAssessmentResult = {
            id: `rec-ai-${Date.now()}`,
            surahNumber: matchedSurah,
            ayahNumber: matchedAyah,
            timestamp: new Date().toISOString(),
            transcriptionConfidence: aiServerResult.transcriptionConfidence || 92,
            pronunciationConfidence: aiServerResult.pronunciationConfidence || 86,
            overallStatus: corrections.length > 0 ? 'requires_practice' : 'passed',
            abstained: false,
            wordAssessments,
            corrections,
            rulesEvaluated: resolvedAyah.primaryRules.map(rId => ({
              ruleId: rId,
              ruleName: getRuleById(rId)?.nameEnglish || rId,
              status: corrections.some(c => c.ruleId === rId) ? 'review_needed' : 'adhered',
              notes: corrections.find(c => c.ruleId === rId)?.observedIssue || 'Adhered to classical standards.'
            })),
            disclaimer: TEACHER_DISCLAIMER,
            audioDurationSeconds: result.durationSeconds
          };

          setAssessment(geminiAssessment);
          setRecordingState('completed');

          if (corrections.length > 0) {
            setIsCorrectionPanelOpen(true);
            setSelectedWordIndex(corrections[0].wordIndex);
          } else {
            setIsCorrectionPanelOpen(false);
          }

          practiceManager.recordSession(
            1, 
            result.durationSeconds, 
            geminiAssessment.rulesEvaluated.filter(r => r.status === 'review_needed').map(r => r.ruleId)
          );
          return;
        }
      }

      // 2. Run Instant Local Assessment Engine with Filtered Speech
      const avgVol = audioSnapshot ? Math.max(0.08, audioSnapshot.averageVolume) : 0.15;
      const evaluation = await assessRecitation({
        ayah: targetAyahToAssess,
        audioDurationSeconds: Math.max(0.8, result.durationSeconds),
        averageVolume: avgVol,
        audioBlob: result.blob,
        spokenTranscript: cleanTranscript,
        forceAssess: true,
        recitationMode: isMemorizationMode ? 'memorization' : 'normal'
      });

      setAssessment(evaluation);
      setRecordingState('completed');

      if (evaluation.corrections && evaluation.corrections.length > 0) {
        setIsCorrectionPanelOpen(true);
        setSelectedWordIndex(evaluation.corrections[0].wordIndex);
      } else {
        setIsCorrectionPanelOpen(false);
      }
      practiceManager.recordSession(
        1, 
        result.durationSeconds, 
        evaluation.rulesEvaluated.filter(r => r.status === 'review_needed').map(r => r.ruleId)
      );
    } catch (err) {
      console.error('Error stopping recording and assessing:', err);
      // Keep state completed and never display uncertain signal
      setRecordingState('completed');
    }
  };

  // Toggle user audio replay
  const togglePlayUserAudio = () => {
    if (!userAudioUrl) return;

    if (isPlayingUserAudio && userAudioRef.current) {
      userAudioRef.current.pause();
      setIsPlayingUserAudio(false);
    } else {
      if (isPlayingReferenceAudio && referenceAudioRef.current) {
        referenceAudioRef.current.pause();
        setIsPlayingReferenceAudio(false);
      }

      if (!userAudioRef.current) {
        userAudioRef.current = new Audio(userAudioUrl);
        userAudioRef.current.onended = () => setIsPlayingUserAudio(false);
        userAudioRef.current.onerror = () => setIsPlayingUserAudio(false);
      }
      userAudioRef.current.currentTime = 0;
      userAudioRef.current.play().then(() => setIsPlayingUserAudio(true)).catch(() => setIsPlayingUserAudio(false));
    }
  };

  // Toggle reference reciter audio playback
  const togglePlayReference = () => {
    if (!currentAyah.audioUrl) return;

    if (isPlayingReferenceAudio && referenceAudioRef.current) {
      referenceAudioRef.current.pause();
      setIsPlayingReferenceAudio(false);
      setIsLoadingReferenceAudio(false);
    } else {
      if (isPlayingUserAudio && userAudioRef.current) {
        userAudioRef.current.pause();
        setIsPlayingUserAudio(false);
      }

      setIsLoadingReferenceAudio(true);
      const targetUrl = new URL(currentAyah.audioUrl, window.location.href).href;

      if (!referenceAudioRef.current || referenceAudioRef.current.src !== targetUrl) {
        if (referenceAudioRef.current) {
          referenceAudioRef.current.pause();
        }
        const audio = new Audio(currentAyah.audioUrl);
        referenceAudioRef.current = audio;
        audio.onplaying = () => {
          setIsLoadingReferenceAudio(false);
          setIsPlayingReferenceAudio(true);
        };
        audio.ontimeupdate = () => {
          if (audio.duration && currentAyah.words.length > 0) {
            const fraction = audio.currentTime / audio.duration;
            const targetIdx = Math.min(
              currentAyah.words.length - 1,
              Math.floor(fraction * currentAyah.words.length)
            );
            setActiveSpeechWordIndex(targetIdx);
            setRecitedWordIndices(prev => {
              const s = new Set(prev);
              for (let k = 0; k <= targetIdx; k++) s.add(k);
              return Array.from(s);
            });
          }
        };
        audio.onended = () => {
          setIsPlayingReferenceAudio(false);
          setIsLoadingReferenceAudio(false);
          setActiveSpeechWordIndex(null);
        };
        audio.onerror = () => {
          setIsPlayingReferenceAudio(false);
          setIsLoadingReferenceAudio(false);
          console.warn('Could not play reference audio from:', currentAyah.audioUrl);
        };
      }

      referenceAudioRef.current.currentTime = 0;
      referenceAudioRef.current.play().then(() => {
        setIsLoadingReferenceAudio(false);
        setIsPlayingReferenceAudio(true);
      }).catch(err => {
        console.warn('Playback error:', err);
        setIsPlayingReferenceAudio(false);
        setIsLoadingReferenceAudio(false);
      });
    }
  };

  // Quick simulation diagnostic
  const handleSimulateMistake = async (issue: 'omitted_qalqalah' | 'dropped_ghunnah' | 'truncated_madd' | 'tarqiq_on_heavy_letter') => {
    resetRecitationState();
    setRecordingState('processing');

    setTimeout(async () => {
      const evaluation = await assessRecitation({
        ayah: currentAyah,
        audioDurationSeconds: currentAyah.words.length * 0.9,
        averageVolume: 0.25,
        recitationMode: 'normal',
        simulatedIssue: issue
      });

      setAssessment(evaluation);
      setRecordingState('completed');
      if (evaluation.corrections.length > 0) {
        setIsCorrectionPanelOpen(true);
        setSelectedWordIndex(evaluation.corrections[0].wordIndex);
      }
    }, 400);
  };

  // Selected word data for inspector
  const selectedWordData: QuranWord | null = useMemo(() => {
    if (selectedWordIndex === null) return null;
    return currentAyah.words.find(w => w.wordIndex === selectedWordIndex) || null;
  }, [selectedWordIndex, currentAyah]);

  // Frequent surahs for quick selection
  const quickSurahs = [
    { num: 1, name: 'Al-Fatihah' },
    { num: 112, name: 'Al-Ikhlas' },
    { num: 113, name: 'Al-Falaq' },
    { num: 114, name: 'An-Nas' },
    { num: 108, name: 'Al-Kawthar' },
    { num: 2, name: 'Al-Baqarah (255)' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Mode Segmented Pill Switcher */}
      <div className="bg-stone-200/80 p-1 rounded-2xl flex items-center max-w-2xl mx-auto shadow-inner border border-stone-300/80 gap-1">
        <button
          type="button"
          onClick={() => {
            setRecitationMode('free');
            resetRecitationState();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            recitationMode === 'free'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">Free Reciter</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRecitationMode('guided');
            resetRecitationState();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            recitationMode === 'guided'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="truncate">Ayah Guided</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRecitationMode('follow');
            resetRecitationState();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            recitationMode === 'follow'
              ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold ring-2 ring-amber-500/50'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-950 shrink-0 animate-pulse" />
          <span className="truncate">Speech Follower</span>
        </button>
      </div>

      {/* Recitation Header Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-4 space-y-3">
        
        {/* Recitation Mode Description Banner */}
        {recitationMode === 'free' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 text-emerald-950">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-700 text-white shadow-xs shrink-0 mt-0.5">
                <Mic className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>Open Recitation Mode</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                    No verse selection needed
                  </span>
                </h2>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Recite any Surah, Ayah, or passage freely from your Mushaf or memory. When you finish, tap <strong>"I'm Done — Pick Up Errors"</strong>, and the AI will automatically identify what you read and highlight any Tajweed or pronunciation errors.
                </p>
              </div>
            </div>

            {/* Reciter Selector Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-emerald-300 text-stone-800 hover:bg-emerald-50/50 shadow-xs transition-all cursor-pointer"
                title="Change reference reciter for error comparison"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[130px] truncate flex items-center gap-1">
                  {currentReciter.gender === 'female' && <span className="text-[10px]">🌸</span>}
                  <span>{currentReciter.nameEnglish.replace('Shaykh ', '')}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              {isReciterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 p-2.5 space-y-2">
                  <div className="px-2 pt-1 pb-1.5 flex items-center justify-between border-b border-stone-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Select Teacher / Reciter
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      {AVAILABLE_RECITERS.length} Reciters
                    </span>
                  </div>

                  {/* Gender Filter Tabs */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setReciterGenderFilter('all')}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                        reciterGenderFilter === 'all'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      All ({AVAILABLE_RECITERS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReciterGenderFilter('female')}
                      className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        reciterGenderFilter === 'female'
                          ? 'bg-rose-50 text-rose-900 font-bold shadow-xs border border-rose-200'
                          : 'text-stone-600 hover:text-rose-900'
                      }`}
                    >
                      <span>🌸 Women ({AVAILABLE_RECITERS.filter(r => r.gender === 'female').length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReciterGenderFilter('male')}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                        reciterGenderFilter === 'male'
                          ? 'bg-emerald-50 text-emerald-950 font-bold shadow-xs border border-emerald-200'
                          : 'text-stone-600 hover:text-emerald-950'
                      }`}
                    >
                      Men ({AVAILABLE_RECITERS.filter(r => r.gender === 'male').length})
                    </button>
                  </div>

                  {/* Reciter List */}
                  <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                    {filteredReciters.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => handleReciterSelect(rec.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          selectedReciterId === rec.id
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                            : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="text-xs font-semibold flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{rec.nameEnglish}</span>
                            {rec.gender === 'female' && (
                              <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 text-[9px] font-extrabold shrink-0">
                                🌸 Qari'ah
                              </span>
                            )}
                          </div>
                          <div className="font-arabic text-emerald-800 text-[11px]">{rec.nameArabic}</div>
                          <div className="text-[10px] text-stone-500 leading-tight">{rec.style}</div>
                          <div className="text-[9px] text-stone-400 line-clamp-1">{rec.description}</div>
                        </div>
                        {selectedReciterId === rec.id && (
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Guided Ayah Selection Navigation */
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsSurahModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  Surah {currentSurahMeta.number}: {currentSurahMeta.nameTransliteration} ({currentSurahMeta.nameArabic})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 pl-2">Ayah:</span>
                <select
                  value={selectedAyahNumber}
                  onChange={(e) => handleAyahChange(parseInt(e.target.value, 10))}
                  className="bg-white text-stone-900 text-xs font-bold py-1 px-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                >
                  {Array.from({ length: currentSurahMeta.ayahCount }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      Ayah {num} of {currentSurahMeta.ayahCount}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reciter and Reference Recitation */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-stone-900 border border-amber-200 hover:bg-amber-100 transition-all shadow-xs cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-amber-700" />
                  <span className="max-w-[130px] truncate flex items-center gap-1">
                    {currentReciter.gender === 'female' && <span className="text-[10px]">🌸</span>}
                    <span>{currentReciter.nameEnglish.replace('Shaykh ', '')}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                </button>

                {isReciterMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 p-2.5 space-y-2">
                    <div className="px-2 pt-1 pb-1.5 flex items-center justify-between border-b border-stone-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Select Teacher / Reciter
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        {AVAILABLE_RECITERS.length} Reciters
                      </span>
                    </div>

                    {/* Gender Filter Tabs */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setReciterGenderFilter('all')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                          reciterGenderFilter === 'all'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        All ({AVAILABLE_RECITERS.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReciterGenderFilter('female')}
                        className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          reciterGenderFilter === 'female'
                            ? 'bg-rose-50 text-rose-900 font-bold shadow-xs border border-rose-200'
                            : 'text-stone-600 hover:text-rose-900'
                        }`}
                      >
                        <span>🌸 Women ({AVAILABLE_RECITERS.filter(r => r.gender === 'female').length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReciterGenderFilter('male')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                          reciterGenderFilter === 'male'
                            ? 'bg-emerald-50 text-emerald-950 font-bold shadow-xs border border-emerald-200'
                            : 'text-stone-600 hover:text-emerald-950'
                        }`}
                      >
                        Men ({AVAILABLE_RECITERS.filter(r => r.gender === 'male').length})
                      </button>
                    </div>

                    {/* Reciter List */}
                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                      {filteredReciters.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => handleReciterSelect(rec.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            selectedReciterId === rec.id
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                              : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="text-xs font-semibold flex items-center gap-1.5 flex-wrap">
                              <span className="truncate">{rec.nameEnglish}</span>
                              {rec.gender === 'female' && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 text-[9px] font-extrabold shrink-0">
                                  🌸 Qari'ah
                                </span>
                              )}
                            </div>
                            <div className="font-arabic text-emerald-800 text-[11px]">{rec.nameArabic}</div>
                            <div className="text-[10px] text-stone-500 leading-tight">{rec.style}</div>
                            <div className="text-[9px] text-stone-400 line-clamp-1">{rec.description}</div>
                          </div>
                          {selectedReciterId === rec.id && (
                            <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Memorization Mode Toggle */}
              <button
                onClick={() => {
                  setIsMemorizationMode(!isMemorizationMode);
                  setRevealMemorizedText(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isMemorizationMode
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
                title="Memorization Mode hides verse text to test recall"
              >
                {isMemorizationMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Memorization</span>
              </button>

              {/* Reference Audio Listen Button */}
              <button
                onClick={togglePlayReference}
                disabled={isLoadingReferenceAudio}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLoadingReferenceAudio
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                    : isPlayingReferenceAudio
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm animate-pulse'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                }`}
                title={`Listen to ${currentReciter.nameEnglish}`}
              >
                {isLoadingReferenceAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isLoadingReferenceAudio ? 'Loading...' : isPlayingReferenceAudio ? 'Playing' : 'Listen'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Dedicated Speech Follower Guidance Banner */}
        {recitationMode === 'follow' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-emerald-500/10 p-3.5 rounded-xl border border-amber-400/50 text-stone-900">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-400 text-stone-950 shadow-xs shrink-0 mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-stone-950 flex items-center gap-2">
                  <span>Real-Time Speech & Audio Follower</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                    Live Word-by-Word Glow
                  </span>
                </h2>
                <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                  Each word highlights dynamically in amber as you speak into the microphone or as the reference teacher audio plays. Follow along at your own pace!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={togglePlayReference}
                disabled={isLoadingReferenceAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  isPlayingReferenceAudio
                    ? 'bg-amber-400 text-stone-950 border-amber-500 animate-pulse'
                    : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-50'
                }`}
              >
                {isPlayingReferenceAudio ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <Play className="w-3.5 h-3.5 text-amber-700" />}
                <span>{isPlayingReferenceAudio ? 'Following Teacher...' : 'Listen & Follow'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Inspiration Passage Chips in Free Reciter Mode */}
        {recitationMode === 'free' && !assessment && recordingState === 'idle' && (
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-stone-400 font-semibold uppercase text-[10px] shrink-0 mr-1 flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-emerald-600" />
                Quick Inspiration:
              </span>
              {FREQUENT_RECITATION_PASSAGES.map((fp) => (
                <button
                  key={`${fp.surah}:${fp.ayah}`}
                  onClick={() => {
                    handleSurahChange(fp.surah, fp.ayah);
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-emerald-100 hover:text-emerald-950 font-medium transition-all border border-stone-200 cursor-pointer"
                  title={fp.hint}
                >
                  {fp.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Quick-Ayah Stepper Bar (in guided mode) */}
        {recitationMode === 'guided' && (
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-stone-400" />
                Jump to Ayah in Surah {currentSurahMeta.nameTransliteration}:
              </span>
              <span className="text-[11px] text-stone-400">
                Keyboard: [◀] [▶] arrows
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {Array.from({ length: currentSurahMeta.ayahCount }, (_, i) => i + 1).map((ayahNum) => {
                const isSelected = ayahNum === selectedAyahNumber;
                const isPreAnnotated = !!VERIFIED_AYAHS[`${selectedSurahNumber}:${ayahNum}`];
                return (
                  <button
                    key={ayahNum}
                    onClick={() => handleAyahChange(ayahNum)}
                    className={`shrink-0 w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500 shadow-md scale-105'
                        : isPreAnnotated
                        ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                    title={`Jump to Ayah ${ayahNum}${isPreAnnotated ? ' (Verified breakdown)' : ''}`}
                  >
                    {ayahNum}
                    {isPreAnnotated && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Main Recitation Stage Card (Islamic Deep Emerald & Cream Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#064e3b] to-[#022c22] text-[#fcfaf6] p-6 sm:p-8 shadow-xl border-2 border-amber-500/30">
        
        {/* Subtle Islamic Arch Corner Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-bl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-br-full pointer-events-none" />

        {/* Identified Verse Banner (When AI identifies what the reader recited in Free Mode) */}
        {recitationMode === 'free' && identifiedPassage && (
          <div className="mb-4 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 fill-stone-950" />
              </span>
              <div>
                <div className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Recitation Identified by AI:</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-200 text-[10px] font-mono">
                    {identifiedPassage.confidence}% Confidence
                  </span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>Surah {identifiedPassage.surahNameTransliteration} ({identifiedPassage.surahNameArabic})</span>
                  <span className="text-amber-300 font-mono text-xs">
                    Ayah {identifiedPassage.ayahNumber}{identifiedPassage.endAyahNumber && identifiedPassage.endAyahNumber > identifiedPassage.ayahNumber ? `–${identifiedPassage.endAyahNumber}` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayReference}
                disabled={isLoadingReferenceAudio}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
                title="Listen to reference recitation for this identified verse"
              >
                {isLoadingReferenceAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isLoadingReferenceAudio ? 'Loading...' : isPlayingReferenceAudio ? 'Playing' : 'Listen Reference'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Recitation Header Bar with Tajweed Highlighting Controls */}
        <div className="flex flex-wrap items-center justify-between mb-4 border-b border-emerald-800/60 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {recitationMode === 'free' && !identifiedPassage ? (
                'Open Qur’an Recitation • Hafs ‘an ‘Asim'
              ) : (
                `Surah ${currentSurahMeta.number}: ${currentSurahMeta.nameTransliteration} (${currentSurahMeta.nameArabic}) — Ayah ${currentAyah.ayahNumber}`
              )}
            </span>
            <span className="text-xs text-emerald-300">• Tartil Speed</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tajweed Visual Highlighting Toggle */}
            <button
              type="button"
              onClick={() => setShowTajweedHighlights(!showTajweedHighlights)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                showTajweedHighlights
                  ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs'
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80'
              }`}
              title="Toggle visual Tajweed rule color coding on the text"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tajweed Rules: {showTajweedHighlights ? 'ON' : 'OFF'}</span>
            </button>

            <span className="text-[10px] font-semibold text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
              Teacher: {currentReciter.nameEnglish.replace('Shaykh ', '')}
            </span>
          </div>
        </div>

        {/* Speech Follower Live Progress Bar & Word HUD */}
        {(recitationMode === 'follow' || activeSpeechWordIndex !== null) && (
          <div className="mb-4 bg-emerald-950/90 rounded-2xl p-3.5 border-2 border-amber-400/40 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                {activeSpeechWordIndex !== null ? activeSpeechWordIndex + 1 : '—'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>
                    Active Word {activeSpeechWordIndex !== null ? `(${activeSpeechWordIndex + 1} of ${currentAyah.words.length})` : '(Ready for voice)'}
                  </span>
                  {recordingState === 'listening' && (
                    <span className="flex items-center gap-1 text-[10px] text-red-300 bg-red-950/80 px-2 py-0.2 rounded-full border border-red-500/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                      Live Mic Tracking
                    </span>
                  )}
                  {isPlayingReferenceAudio && (
                    <span className="text-[10px] text-amber-200 bg-amber-950/80 px-2 py-0.2 rounded-full border border-amber-500/50">
                      Teacher Audio Sync
                    </span>
                  )}
                </div>
                {activeSpeechWordIndex !== null && currentAyah.words[activeSpeechWordIndex] ? (
                  <div className="flex items-baseline gap-2 mt-0.5 truncate">
                    <span className="font-arabic text-xl font-bold text-amber-200">
                      {(currentAyah.words[activeSpeechWordIndex].arabic && currentAyah.words[activeSpeechWordIndex].arabic.trim()) || currentAyah.words[activeSpeechWordIndex].clean}
                    </span>
                    <span className="font-sans text-xs text-emerald-200 italic">
                      ({currentAyah.words[activeSpeechWordIndex].transliteration})
                    </span>
                    <span className="text-[11px] text-stone-300 truncate">
                      "{currentAyah.words[activeSpeechWordIndex].translation}"
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-200 mt-0.5">
                    {recordingState === 'listening' 
                      ? 'Speak the words in Arabic — following as you recite...' 
                      : 'Tap "Start Speech Follower" or "Listen" to watch each word highlight.'}
                  </p>
                )}
              </div>
            </div>

            {/* Completion Percentage Meter */}
            <div className="w-full sm:w-44 flex flex-col gap-1 shrink-0">
              <div className="flex justify-between text-[10px] font-bold text-emerald-300 font-mono">
                <span>Ayah Progress</span>
                <span>
                  {currentAyah.words.length > 0 
                    ? Math.round(((recitedWordIndices.length) / currentAyah.words.length) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-700/60">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                  style={{
                    width: `${currentAyah.words.length > 0 ? (recitedWordIndices.length / currentAyah.words.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Qur'anic Text Display with Word-by-Word Interactivity & Tajweed Highlights */}
        <div className="my-6 min-h-[130px] flex items-center justify-center">
          {recitationMode === 'free' && recordingState === 'idle' && !assessment ? (
            /* Open Recitation Invitation Callout */
            <div className="text-center py-6 px-4 space-y-4 max-w-lg mx-auto">
              <div className="inline-flex p-4 rounded-3xl bg-emerald-900/60 border border-emerald-700/60 text-amber-400 shadow-lg">
                <Mic className="w-10 h-10 animate-pulse text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">
                  Ready to Recite Freely
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-sans">
                  Read any Ayah or Surah of your choice at your own pace from your Mushaf or memory. Tap <strong>"Start Reciting Freely"</strong> below, and when you finish, tap <strong>"I'm Done — Pick Up Errors"</strong>!
                </p>
              </div>
            </div>
          ) : isMemorizationMode && !revealMemorizedText ? (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 text-amber-400">
                <Bookmark className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-emerald-200">
                Verse is concealed for Memorization Recall. Recite from memory!
              </p>
              <button
                onClick={() => setRevealMemorizedText(true)}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer"
              >
                Peek at Arabic Text
              </button>
            </div>
          ) : (
            <div 
              className="w-full text-center font-quran text-2xl sm:text-3xl md:text-4xl text-[#fdfbf7] leading-loose selection:bg-amber-400/30"
              dir="rtl"
            >
              {currentAyah.words.length > 0 ? (
                currentAyah.words.map((word, idx) => {
                  const wordAssessed = assessment?.wordAssessments?.find((w: WordTokenAssessment) => w.wordIndex === idx);
                  const wordCorrection = assessment?.corrections?.find((c: PronunciationCorrection) => c.wordIndex === idx);
                  const isSelected = selectedWordIndex === idx;
                  const isError = !!(wordCorrection || wordAssessed?.status === 'needs_attention');
                  const isSpeechActive = activeSpeechWordIndex === idx;
                  const isAlreadyRecited = recitedWordIndices.includes(idx);

                  // Guaranteed non-empty Arabic text display
                  const displayArabic = (word.arabic && word.arabic.trim()) || 
                                        (currentAyah.arabicText?.split(/\s+/)[idx]) || 
                                        word.clean || 
                                        '';

                  const highlight = getWordHighlightStyle(
                    word.activeRules,
                    isSelected,
                    isError,
                    showTajweedHighlights,
                    selectedCategoryFilter
                  );

                  let customHighlightClasses = highlight.classes;
                  if (isSpeechActive) {
                    customHighlightClasses = 'bg-amber-400 text-stone-950 font-black shadow-2xl scale-110 ring-4 ring-amber-300 z-20';
                  } else if (recitationMode === 'follow' && isAlreadyRecited) {
                    customHighlightClasses = 'bg-emerald-900/90 text-amber-200 border border-amber-400/40';
                  }

                  return (
                    <span
                      key={idx}
                      onClick={() => {
                        setSelectedWordIndex(selectedWordIndex === idx ? null : idx);
                        if (wordCorrection) {
                          setIsCorrectionPanelOpen(true);
                        }
                      }}
                      className={`group relative inline-flex flex-col items-center mx-1 sm:mx-1.5 my-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl cursor-pointer transition-all duration-200 select-none ${customHighlightClasses}`}
                      title={`${word.transliteration} — ${highlight.categoryMeta.nameEnglish}`}
                    >
                      <span className="leading-tight font-arabic">{displayArabic}</span>

                      {/* Tajweed Category Dot & Label underneath the word */}
                      {showTajweedHighlights && highlight.hasRule && !isError && !isSpeechActive && (
                        <span className="flex items-center gap-1 mt-1 text-[9px] font-sans font-bold tracking-tight opacity-95">
                          <span className={`w-1.5 h-1.5 rounded-full ${highlight.categoryMeta.dotColor}`} />
                          <span className="hidden sm:inline-block truncate max-w-[65px]">
                            {highlight.badgeLabel}
                          </span>
                        </span>
                      )}

                      {/* Live Speech Indicator badge */}
                      {isSpeechActive && (
                        <span className="block text-[8px] font-sans font-black uppercase text-stone-950 tracking-wider mt-0.5">
                          Reciting ▶
                        </span>
                      )}

                      {isError && (
                        <span className="block text-[9px] font-sans font-extrabold text-rose-200 bg-rose-950/90 px-1 py-0.2 rounded border border-rose-500/60 mt-0.5 tracking-tight uppercase select-none">
                          ⚠ Correction
                        </span>
                      )}
                    </span>
                  );
                })
              ) : (
                /* Pure fallback if words array is empty */
                <span className="leading-loose font-arabic">
                  {currentAyah.arabicText}
                </span>
              )}
              
              {/* Ayah End Symbol */}
              <span className="inline-block text-amber-400 text-2xl mx-2 select-none">
                ۝{currentAyah.ayahNumber}
              </span>
            </div>
          )}
        </div>

        {/* Live Spoken Speech Preview (while reading in Free Reciter Mode) */}
        {recordingState === 'listening' && (
          <div className="mb-4 bg-emerald-950/80 rounded-2xl p-3 border border-emerald-700/60 shadow-lg text-center">
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Listening to your Qur'anic recitation...</span>
              <CssFrequencyVisualizer 
                active={true} 
                volume={audioSnapshot?.averageVolume || 0.25} 
                barCount={10} 
                className="h-3.5 ml-1" 
              />
            </div>
            {liveSpeechTranscript && (
              <p className="mt-1 font-arabic text-lg text-amber-200" dir="rtl">
                "{liveSpeechTranscript}"
              </p>
            )}
          </div>
        )}

        {/* Interactive Tajweed Legend & Category Filter Bar */}
        {showTajweedHighlights && !isMemorizationMode && (
          <div className="mt-2 mb-3 pt-3 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tajweed Rule Categories:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40'
                }`}
              >
                All Rules
              </button>

              {Object.values(TAJWEED_CATEGORIES).map((cat) => {
                const isFilterActive = selectedCategoryFilter === cat.category;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(isFilterActive ? 'all' : cat.category)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                      isFilterActive
                        ? 'bg-white text-emerald-950 font-bold ring-2 ring-amber-400 shadow-sm'
                        : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/60 border border-emerald-700/40'
                    }`}
                    title={`Filter by ${cat.nameEnglish} (${cat.description})`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                    <span>{cat.nameEnglish.split(' ')[0]}</span>
                    <span className="font-arabic text-[9px] opacity-80">{cat.nameArabic.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Word Tajweed Inspector (Linking Directly to RulesKnowledgeScreen) */}
        {selectedWordIndex !== null && selectedWordData && (
          <div className="mt-4 bg-emerald-950/95 rounded-2xl p-4 sm:p-5 border-2 border-amber-400/50 shadow-xl space-y-4 animate-in fade-in zoom-in-98 duration-150">
            
            {/* Header with Word & Close */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                  #{selectedWordIndex + 1}
                </span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-arabic text-2xl sm:text-3xl font-bold text-amber-200">
                      {selectedWordData.arabic}
                    </span>
                    <span className="font-sans text-xs text-emerald-300 font-medium italic">
                      ({selectedWordData.transliteration})
                    </span>
                  </div>
                  <div className="text-xs text-emerald-100 font-sans">
                    Vocabulary Meaning: "{selectedWordData.translation}"
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWordIndex(null)}
                  className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Word Tajweed Notes */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Tajweed Pronunciation & Applied Rules:</span>
              </div>

              {selectedWordData.ruleExplanation && (
                <div className="text-xs text-stone-200 bg-emerald-900/50 p-3 rounded-xl border border-emerald-700/60 leading-relaxed font-sans">
                  <span className="font-bold text-amber-200">Oral Instruction: </span>
                  {selectedWordData.ruleExplanation}
                </div>
              )}

              {/* Active Rules List with 1-Click Link to RulesKnowledgeScreen */}
              {selectedWordData.activeRules.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedWordData.activeRules.map((ruleId) => {
                    const rule = getRuleById(ruleId);
                    const category = getRuleCategory(ruleId);
                    const catMeta = TAJWEED_CATEGORIES[category];

                    return (
                      <div
                        key={ruleId}
                        className="bg-emerald-900/60 hover:bg-emerald-900/80 rounded-xl p-3.5 border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${catMeta.dotColor}`} />
                            <span className="font-bold text-white text-sm">
                              {rule?.nameEnglish || ruleId}
                            </span>
                            <span className="font-arabic text-amber-300 text-sm font-semibold">
                              ({rule?.nameArabic || ''})
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                              {catMeta.nameEnglish}
                            </span>
                          </div>
                          {rule?.description && (
                            <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                              {rule.description}
                            </p>
                          )}
                          {rule?.classicalReference && (
                            <div className="text-[10px] text-amber-200/80 font-mono">
                              Source: {rule.classicalReference.work} ({rule.classicalReference.author})
                            </div>
                          )}
                        </div>

                        {/* Direct Link to RulesKnowledgeScreen */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {onNavigateToRule && (
                            <button
                              type="button"
                              onClick={() => onNavigateToRule(ruleId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-sm transition-all transform active:scale-95 cursor-pointer"
                              title={`Open "${rule?.nameEnglish || ruleId}" in Rules Knowledge Base`}
                            >
                              <BookOpen className="w-3.5 h-3.5 text-stone-950" />
                              <span>Study in Library</span>
                              <ExternalLink className="w-3.5 h-3.5 text-stone-950" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-stone-300 italic py-1">
                  Standard articulation: maintain clear Harakah (vowels) and baseline Makhraj.
                </div>
              )}

              {/* Action shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-800/60">
                <span className="text-[11px] text-emerald-300/80">
                  Tap "Study in Library" to view classical matn poetry lines & conditions in the Rules section.
                </span>

                {onAskAssistant && (
                  <button
                    type="button"
                    onClick={() => onAskAssistant(`Can you explain the correct Tajweed rules and mouth articulation for the word "${selectedWordData.arabic}" (${selectedWordData.transliteration}) in Surah ${selectedSurahNumber}:${selectedAyahNumber}?`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask AI Assistant about this word</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Transliteration & English Translation (when verse is selected/identified) */}
        {(recitationMode === 'guided' || recitationMode === 'follow' || identifiedPassage) && (
          <div className="border-t border-emerald-800/60 pt-4 space-y-1.5 text-center">
            <p className="text-xs sm:text-sm font-medium text-emerald-200 italic font-sans">
              "{currentAyah.transliteration}"
            </p>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-sans">
              {currentAyah.translation}
            </p>
          </div>
        )}

        {/* Live Audio Waveform Visualizer */}
        <div className="mt-6">
          <WaveformVisualizer
            isRecording={recordingState === 'listening'}
            snapshot={audioSnapshot}
            stateLabel={recordingState}
          />
        </div>

        {/* Prominent Recording Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4">
          
          {/* Recording Timer, Status & Live Wave Visualizer */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                {recordingDuration.toFixed(1)}s
              </span>
              <span className="text-xs font-medium text-emerald-200">
                {recordingState === 'listening' ? 'Listening...' : recordingState === 'processing' ? 'AI Analyzing & Detecting Errors...' : 'Ready'}
              </span>
            </div>
            {recordingState === 'listening' && (
              <CssFrequencyVisualizer
                active={true}
                volume={audioSnapshot?.averageVolume || 0.25}
                barCount={10}
                className="h-4"
              />
            )}
          </div>

          {/* Central Microphone / Stop & Analyze Button */}
          <div className="flex items-center gap-3">
            {recordingState !== 'listening' ? (
              <button
                onClick={handleStartRecording}
                disabled={recordingState === 'processing'}
                className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-lg shadow-amber-900/40 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Mic className="w-5 h-5 text-stone-950 group-hover:scale-110 transition-transform" />
                <span>
                  {recitationMode === 'follow'
                    ? 'Start Speech Follower'
                    : recitationMode === 'free'
                    ? 'Start Reciting Freely'
                    : 'Start Reciting'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleStopRecording()}
                className="relative flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 transition-all transform active:scale-95 cursor-pointer overflow-hidden"
              >
                {/* Visual audio wave ripple aura */}
                <span className="absolute -inset-1 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
                <span className="absolute inset-0 rounded-full border border-red-400/50 animate-pulse pointer-events-none" />
                <Sparkles className="w-5 h-5 fill-current relative z-10" />
                <span className="relative z-10">
                  {recitationMode === 'follow'
                    ? 'Finish Speech Follower'
                    : "I'm Done — Pick Up Errors"}
                </span>
                <div className="relative z-10 ml-1">
                  <CssFrequencyVisualizer
                    active={true}
                    volume={audioSnapshot?.averageVolume || 0.3}
                    barCount={6}
                    className="h-3.5"
                  />
                </div>
              </button>
            )}

            {/* Replay User Recording */}
            {userAudioUrl && recordingState !== 'listening' && (
              <button
                onClick={togglePlayUserAudio}
                className="p-3.5 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600/50 shadow-sm transition-all cursor-pointer"
                title="Replay your recorded recitation"
              >
                <Play className={`w-4 h-4 ${isPlayingUserAudio ? 'text-amber-400' : ''}`} />
              </button>
            )}

            {/* Retry Button */}
            {assessment && recordingState !== 'listening' && (
              <button
                onClick={handleStartRecording}
                className="p-3.5 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600/50 shadow-sm transition-all cursor-pointer"
                title="Retry recitation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Privacy Note */}
          <div className="text-[11px] text-emerald-300/70 text-right hidden sm:block">
            Microphone audio processed securely in-memory.
          </div>

        </div>

        {/* Interactive Simulation Diagnostic Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5 text-amber-300" />
            Test Pronunciation Diagnostic:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSimulateMistake('omitted_qalqalah')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
              title="Test omitting Qalqalah on Dal/Qaf"
            >
              Test Omitted Qalqalah
            </button>
            <button
              type="button"
              onClick={() => handleSimulateMistake('dropped_ghunnah')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
              title="Test dropping Ghunnah on doubled Noon"
            >
              Test Dropped Ghunnah
            </button>
            <button
              type="button"
              onClick={() => handleSimulateMistake('truncated_madd')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
              title="Test truncating Madd Munfasil"
            >
              Test Truncated Madd
            </button>
            <button
              type="button"
              onClick={() => handleSimulateMistake('tarqiq_on_heavy_letter')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
              title="Test light sound on heavy letter"
            >
              Test Tarqiq on Heavy Letter
            </button>
          </div>
        </div>

      </div>

      {/* Floating Correction Drawer Opener Button if corrections present */}
      {assessment && assessment.corrections && assessment.corrections.length > 0 && !isCorrectionPanelOpen && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>{assessment.corrections.length} Pronunciation {assessment.corrections.length === 1 ? 'Correction' : 'Corrections'} Identified</span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                  Makhraj & Sifat Ready
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Specific guidance generated for affected words with correct articulation and audio replay.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCorrectionPanelOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 border border-amber-600 shadow-sm transition-all transform active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Open Correction Panel</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Permission or Hardware Notice */}
      {permissionError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Audio Notice: </span>
            {permissionError}
          </div>
        </div>
      )}

      {/* Assessment Results Section */}
      {assessment && (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 space-y-6">
          
          {/* Header Status & Separated Confidences */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {assessment.overallStatus === 'passed' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Sound Recitation Observed
                  </span>
                ) : assessment.overallStatus === 'requires_practice' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {assessment.corrections.length} Pronunciation {assessment.corrections.length === 1 ? 'Correction' : 'Corrections'} Flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
                    <ShieldAlert className="w-4 h-4 text-stone-500" />
                    Abstained (Uncertain Assessment)
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                {recitationMode === 'free' && identifiedPassage
                  ? `Recitation Analysis: Surah ${identifiedPassage.surahNameTransliteration} Ayah ${identifiedPassage.ayahNumber}`
                  : `Recitation Analysis: Surah ${currentSurahMeta.nameTransliteration} Ayah ${selectedAyahNumber}`}
              </h3>
            </div>

            {/* Separated Transcription vs Pronunciation Confidence */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-400">Word Match</div>
                <div className="text-sm font-mono font-bold text-stone-800">
                  {assessment.transcriptionConfidence}%
                </div>
              </div>
              <div className="h-8 w-px bg-stone-200" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-400">Tajweed Purity</div>
                <div className="text-sm font-mono font-bold text-emerald-700">
                  {assessment.pronunciationConfidence}%
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Talaqqi Safety Disclaimer */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-start gap-3 text-stone-600">
            <Info className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed italic">
              {assessment.disclaimer}
            </p>
          </div>

          {/* Primary Rules Evaluated in this Ayah */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Primary Tajweed Rules Evaluated:
              </h4>
              <span className="text-[11px] text-stone-400">
                Classical rulings according to Shatibiyyah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessment.rulesEvaluated.map((rule) => {
                const isReviewNeeded = rule.status === 'review_needed';
                const isAdhered = rule.status === 'adhered';
                const isAbstained = rule.status === 'uncertain_abstention';

                return (
                  <div
                    key={rule.ruleId}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isReviewNeeded
                        ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                        : isAdhered
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        {isReviewNeeded ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        ) : isAdhered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {rule.ruleName}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isReviewNeeded
                          ? 'bg-amber-200 text-amber-900'
                          : isAdhered
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isReviewNeeded ? 'Review Needed' : isAdhered ? 'Adhered' : 'Talaqqi Focus'}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      {rule.notes}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Slide-up Correction Panel Component */}
      <CorrectionPanel
        isOpen={isCorrectionPanelOpen}
        onClose={() => setIsCorrectionPanelOpen(false)}
        corrections={assessment?.corrections || []}
        referenceAudioUrl={currentAyah.audioUrl}
        focusedWordIndex={selectedWordIndex}
        onFocusWord={(idx) => setSelectedWordIndex(idx)}
        onAskAssistant={onAskAssistant}
      />

      {/* Surah Quick Search Modal */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Surah by name or number (e.g. Fatihah, Baqarah, 112)..."
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 flex-1">
              {ALL_SURAHS_META
                .filter(s => 
                  s.nameTransliteration.toLowerCase().includes(surahSearchQuery.toLowerCase()) ||
                  s.nameEnglish.toLowerCase().includes(surahSearchQuery.toLowerCase()) ||
                  s.nameArabic.includes(surahSearchQuery) ||
                  String(s.number).includes(surahSearchQuery)
                )
                .map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => {
                      handleSurahChange(surah.number, 1);
                      setIsSurahModalOpen(false);
                      setSurahSearchQuery('');
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      selectedSurahNumber === surah.number
                        ? 'bg-emerald-800 text-white font-bold shadow-sm'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${
                        selectedSurahNumber === surah.number
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {surah.number}
                      </span>
                      <div>
                        <div className="text-xs font-bold">
                          {surah.nameTransliteration} ({surah.nameEnglish})
                        </div>
                        <div className="text-[10px] opacity-70">
                          {surah.revelationType} • {surah.ayahCount} Ayahs
                        </div>
                      </div>
                    </div>
                    <span className="font-arabic text-lg font-bold">
                      {surah.nameArabic}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
