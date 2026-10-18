/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Verified Qur'anic Text Models (Hafs 'an 'Asim)
 */

export interface QuranWord {
  wordIndex: number;
  arabic: string;              // Full Uthmani script with diacritics
  clean: string;               // Normalized Arabic (no tashkeel) for comparison
  transliteration: string;     // Phonetic Latin representation
  translation: string;         // English vocabulary meaning
  activeRules: string[];       // References to TAJWEED_KNOWLEDGE_BASE rule IDs
  ruleExplanation?: string;    // Specific Tajweed note for this word token
}

export interface QuranAyah {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  words: QuranWord[];
  audioUrl?: string;           // Verified reference recitation (Sheikh Al-Husary / Mishary)
  primaryRules: string[];      // Main rules tested in this Ayah
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahCount: number;
  hasVerifiedWordBreakdown: boolean;
}

export interface Reciter {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  style: string;
  description: string;
  subfolder: string;
  gender?: 'male' | 'female';
  customAudioUrl?: (surah: number, ayah: number) => string;
}

