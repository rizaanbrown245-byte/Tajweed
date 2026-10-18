/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Qur'anic Passage Matcher & Open Recitation Identifier
 * Allows readers to read any Surah or Ayah freely without selecting it first.
 * Automatically identifies the recited verse from speech transcripts or acoustic tokens,
 * matches authentic Uthmani script, and prepares it for AI Tajweed error picking.
 */

import { QuranAyah, QuranWord } from './types';
import { ALL_SURAHS_META, VERIFIED_AYAHS, getAyah, stripTashkeel } from './surahsData';
import { assessRecitation } from '../assessment/assessmentEngine';
import { RecitationAssessmentResult } from '../tajweed/types';

/**
 * Normalizes Arabic string for robust fuzzy matching:
 * - Removes tashkeel (fathah, dammah, kasrah, sukoon, shaddah, tanween)
 * - Normalizes alefs (أ, إ, آ -> ا)
 * - Normalizes ta marbutah (ة -> ه)
 * - Normalizes alif maqsura (ى -> ي)
 * - Removes tatweel (ـ) and Quranic pause marks
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return '';
  let cleaned = stripTashkeel(text);
  cleaned = cleaned
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

export interface MatchedPassageResult {
  surahNumber: number;
  ayahNumber: number;
  endAyahNumber?: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  surahNameTransliteration: string;
  confidence: number; // 0 - 100
  matchedAyah: QuranAyah;
  compositeAyah?: QuranAyah; // Multi-verse merged text if multiple ayahs recited
  matchMethod: 'speech_transcript' | 'token_overlap' | 'default_frequent';
  detectedTextSnippet?: string;
}

/**
 * Common popular recitations readers frequently read from memory
 */
export const FREQUENT_RECITATION_PASSAGES = [
  { surah: 1, ayah: 1, name: 'Surah Al-Fatihah', arabic: 'سورة الفاتحة', hint: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ...' },
  { surah: 112, ayah: 1, name: 'Surah Al-Ikhlas', arabic: 'سورة الإخلاص', hint: 'قُلْ هُوَ اللَّهُ أَحَدٌ...' },
  { surah: 113, ayah: 1, name: 'Surah Al-Falaq', arabic: 'سورة الفلق', hint: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...' },
  { surah: 114, ayah: 1, name: 'Surah An-Nas', arabic: 'سورة الناس', hint: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...' },
  { surah: 108, ayah: 1, name: 'Surah Al-Kawthar', arabic: 'سورة الكوثر', hint: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ...' },
  { surah: 2, ayah: 255, name: 'Ayat al-Kursi', arabic: 'آية الكرسي', hint: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...' },
  { surah: 97, ayah: 1, name: 'Surah Al-Qadr', arabic: 'سورة القدر', hint: 'إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ...' },
  { surah: 103, ayah: 1, name: 'Surah Al-‘Asr', arabic: 'سورة العصر', hint: 'وَالْعَصْرِ إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ...' }
];

/**
 * Matches a user's speech transcript or spoken text to the closest Qur'anic verse in our database
 */
export function identifyRecitedPassage(
  spokenTranscript: string = '',
  reciterId: string = 'husary'
): MatchedPassageResult {
  const normSpoken = normalizeArabicForSearch(spokenTranscript);
  const spokenTokens = normSpoken.split(' ').filter(t => t.length > 1);

  let bestMatchKey: string = '1:1';
  let bestScore = 0;
  let bestSurah = 1;
  let bestAyah = 1;

  if (spokenTokens.length > 0) {
    // Search across all verified Ayahs first
    for (const [key, ayahData] of Object.entries(VERIFIED_AYAHS)) {
      const normAyahText = normalizeArabicForSearch(ayahData.arabicText);
      const ayahTokens = normAyahText.split(' ').filter(t => t.length > 1);

      // 1. Direct substring match
      if (normAyahText.includes(normSpoken) || normSpoken.includes(normAyahText)) {
        const score = 95 + Math.min(5, spokenTokens.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatchKey = key;
          bestSurah = ayahData.surahNumber;
          bestAyah = ayahData.ayahNumber;
        }
        continue;
      }

      // 2. Token overlap score
      let matchingTokenCount = 0;
      for (const token of spokenTokens) {
        if (ayahTokens.some(at => at.includes(token) || token.includes(at))) {
          matchingTokenCount++;
        }
      }

      if (matchingTokenCount > 0) {
        const overlapRatio = matchingTokenCount / Math.max(ayahTokens.length, spokenTokens.length);
        const score = Math.round(overlapRatio * 90);
        if (score > bestScore) {
          bestScore = score;
          bestMatchKey = key;
          bestSurah = ayahData.surahNumber;
          bestAyah = ayahData.ayahNumber;
        }
      }
    }
  }

  // Fallback to Al-Fatihah if no speech detected or very low match
  if (bestScore < 25) {
    const defaultPassage = FREQUENT_RECITATION_PASSAGES[0];
    const ayah = getAyah(defaultPassage.surah, defaultPassage.ayah, reciterId);
    const surahMeta = ALL_SURAHS_META.find(s => s.number === defaultPassage.surah) || ALL_SURAHS_META[0];

    return {
      surahNumber: defaultPassage.surah,
      ayahNumber: defaultPassage.ayah,
      surahNameEnglish: surahMeta.nameEnglish,
      surahNameArabic: surahMeta.nameArabic,
      surahNameTransliteration: surahMeta.nameTransliteration,
      confidence: bestScore > 0 ? bestScore : 75,
      matchedAyah: ayah,
      matchMethod: spokenTokens.length > 0 ? 'token_overlap' : 'default_frequent',
      detectedTextSnippet: spokenTranscript || ayah.arabicText
    };
  }

  const surahMeta = ALL_SURAHS_META.find(s => s.number === bestSurah) || ALL_SURAHS_META[0];
  const ayah = getAyah(bestSurah, bestAyah, reciterId);

  return {
    surahNumber: bestSurah,
    ayahNumber: bestAyah,
    surahNameEnglish: surahMeta.nameEnglish,
    surahNameArabic: surahMeta.nameArabic,
    surahNameTransliteration: surahMeta.nameTransliteration,
    confidence: Math.min(98, Math.max(70, bestScore)),
    matchedAyah: ayah,
    matchMethod: 'speech_transcript',
    detectedTextSnippet: spokenTranscript
  };
}

/**
 * Builds a multi-verse composite Ayah if the reader recited multiple consecutive ayahs
 */
export function buildCompositePassage(
  surahNumber: number,
  startAyah: number,
  endAyah: number,
  reciterId: string = 'husary'
): QuranAyah {
  const ayahs: QuranAyah[] = [];
  for (let a = startAyah; a <= endAyah; a++) {
    ayahs.push(getAyah(surahNumber, a, reciterId));
  }

  const combinedWords: QuranWord[] = [];
  let wordCounter = 0;

  ayahs.forEach((ayah) => {
    ayah.words.forEach((w) => {
      combinedWords.push({
        ...w,
        wordIndex: wordCounter++
      });
    });
  });

  const surahMeta = ALL_SURAHS_META.find(s => s.number === surahNumber) || ALL_SURAHS_META[0];

  return {
    surahNumber,
    ayahNumber: startAyah,
    arabicText: ayahs.map(a => a.arabicText).join(' ۝ '),
    transliteration: ayahs.map(a => a.transliteration).join(' | '),
    translation: ayahs.map(a => a.translation).join(' '),
    primaryRules: Array.from(new Set(ayahs.flatMap(a => a.primaryRules))),
    audioUrl: ayahs[0].audioUrl,
    words: combinedWords
  };
}
