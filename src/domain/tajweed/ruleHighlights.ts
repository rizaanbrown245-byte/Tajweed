/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tajweed Visual Rule Highlighting System
 * Maps classical Tajweed rules to verified pedagogical color codes (Mushaf Tajweed standards).
 */

import { TAJWEED_KNOWLEDGE_BASE, getRuleById } from './knowledgeBase';
import { TajweedRule } from './types';

export type TajweedColorCategory = 
  | 'ghunnah'     // Ghunnah & Ikhfa
  | 'madd'        // Madd & Elongation
  | 'qalqalah'    // Qalqalah Echoing Bounce
  | 'tafkhim'     // Heavy Letters / Isti'la
  | 'idgham'      // Assimilation
  | 'idhhar'      // Clear Manifestation
  | 'sifat';      // Sifat & Makharij

export interface TajweedCategoryMeta {
  category: TajweedColorCategory;
  nameEnglish: string;
  nameArabic: string;
  description: string;
  dotColor: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  activeRing: string;
}

export const TAJWEED_CATEGORIES: Record<TajweedColorCategory, TajweedCategoryMeta> = {
  ghunnah: {
    category: 'ghunnah',
    nameEnglish: 'Ghunnah / Ikhfa',
    nameArabic: 'غُنَّة وإخفاء',
    description: 'Nasal resonance held for 2 counts in doubled letters and hidden Noon',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-100',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-b-2 border-emerald-400',
    activeRing: 'ring-emerald-400'
  },
  madd: {
    category: 'madd',
    nameEnglish: 'Madd (Elongation)',
    nameArabic: 'مَدّ',
    description: 'Prolongation of sound for 2, 4, 5, or 6 counts',
    dotColor: 'bg-sky-400',
    textColor: 'text-sky-100',
    bgClass: 'bg-sky-500/20',
    borderClass: 'border-b-2 border-sky-400',
    activeRing: 'ring-sky-400'
  },
  qalqalah: {
    category: 'qalqalah',
    nameEnglish: 'Qalqalah (Echo Bounce)',
    nameArabic: 'قَلْقَلَة',
    description: 'Vibrant echo bounce on Qaf, Ta, Ba, Jim, Dal when with sukoon or paused',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-200',
    bgClass: 'bg-amber-500/25',
    borderClass: 'border-b-2 border-amber-400',
    activeRing: 'ring-amber-400'
  },
  tafkhim: {
    category: 'tafkhim',
    nameEnglish: 'Tafkhim (Heavy Letter)',
    nameArabic: 'تَفْخِيم',
    description: 'Deep, full-mouth elevation of back tongue (Isti‘la, Lam Jalalah, Heavy Ra)',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-100',
    bgClass: 'bg-yellow-500/20',
    borderClass: 'border-b-2 border-yellow-400',
    activeRing: 'ring-yellow-400'
  },
  idgham: {
    category: 'idgham',
    nameEnglish: 'Idgham (Assimilation)',
    nameArabic: 'إِدْغَام',
    description: 'Merging one letter into the subsequent letter',
    dotColor: 'bg-purple-400',
    textColor: 'text-purple-100',
    bgClass: 'bg-purple-500/20',
    borderClass: 'border-b-2 border-purple-400',
    activeRing: 'ring-purple-400'
  },
  idhhar: {
    category: 'idhhar',
    nameEnglish: 'Idh-har (Clear Manifest)',
    nameArabic: 'إِظْهَار',
    description: 'Pronouncing the letter clearly without extra elongation or nasal hold',
    dotColor: 'bg-teal-300',
    textColor: 'text-teal-100',
    bgClass: 'bg-teal-500/20',
    borderClass: 'border-b-2 border-teal-300',
    activeRing: 'ring-teal-300'
  },
  sifat: {
    category: 'sifat',
    nameEnglish: 'Sifat / Makhraj',
    nameArabic: 'صِفَات ومَخَارِج',
    description: 'Letter articulation points and sound characteristics (Hams, Safir, Tawassut)',
    dotColor: 'bg-emerald-300/80',
    textColor: 'text-emerald-100',
    bgClass: 'bg-emerald-900/30',
    borderClass: 'border-b-2 border-emerald-600/40',
    activeRing: 'ring-emerald-400'
  }
};

/**
 * Returns the color category for a given rule ID
 */
export function getRuleCategory(ruleId: string): TajweedColorCategory {
  if (ruleId.startsWith('madd_')) return 'madd';
  if (ruleId.includes('qalqalah')) return 'qalqalah';
  if (ruleId.includes('ghunnah') || ruleId.includes('ikhfa')) return 'ghunnah';
  if (ruleId.includes('idgham')) return 'idgham';
  if (ruleId.includes('idhhar')) return 'idhhar';
  if (ruleId.includes('tafkhim') || ruleId.includes('lam_jalalah') || ruleId.includes('ra_tafkhim')) return 'tafkhim';
  return 'sifat';
}

export interface WordHighlightStyle {
  hasRule: boolean;
  primaryRule?: TajweedRule;
  category: TajweedColorCategory;
  categoryMeta: TajweedCategoryMeta;
  badgeLabel: string;
  classes: string;
}

/**
 * Resolves highlighting styling for a word in recitation text
 */
export function getWordHighlightStyle(
  activeRules: string[] = [],
  isSelected: boolean = false,
  isError: boolean = false,
  showHighlights: boolean = true,
  filterCategory: TajweedColorCategory | 'all' = 'all'
): WordHighlightStyle {
  if (activeRules.length === 0 || !showHighlights) {
    const defaultMeta = TAJWEED_CATEGORIES.sifat;
    return {
      hasRule: false,
      category: 'sifat',
      categoryMeta: defaultMeta,
      badgeLabel: '',
      classes: isSelected 
        ? 'bg-amber-400 text-stone-950 font-bold ring-2 ring-amber-300 scale-105 shadow-md'
        : 'hover:bg-emerald-800/60 text-[#fdfbf7]'
    };
  }

  // Find most prominent rule (prefer specific rules like Madd, Qalqalah, Ghunnah, Tafkhim over general sifat)
  let bestRuleId = activeRules[0];
  for (const rId of activeRules) {
    if (rId.startsWith('madd_') || rId.includes('qalqalah') || rId.includes('ghunnah') || rId.includes('tafkhim') || rId.includes('idgham') || rId.includes('idhhar')) {
      bestRuleId = rId;
      break;
    }
  }

  const category = getRuleCategory(bestRuleId);
  const categoryMeta = TAJWEED_CATEGORIES[category];
  const primaryRule = getRuleById(bestRuleId);

  // If a category filter is active and does not match, mute the highlight
  const isFilteredMatch = filterCategory === 'all' || filterCategory === category;

  if (isError) {
    return {
      hasRule: true,
      primaryRule,
      category,
      categoryMeta,
      badgeLabel: categoryMeta.nameEnglish.split(' ')[0],
      classes: isSelected
        ? 'bg-rose-600 text-white font-bold ring-4 ring-rose-300 shadow-xl scale-110'
        : 'bg-rose-500/30 text-rose-100 ring-2 ring-rose-400 border-b-4 border-rose-400 font-bold shadow-lg shadow-rose-950/40 animate-pulse'
    };
  }

  if (isSelected) {
    return {
      hasRule: true,
      primaryRule,
      category,
      categoryMeta,
      badgeLabel: categoryMeta.nameEnglish.split(' ')[0],
      classes: 'bg-amber-400 text-stone-950 font-bold ring-4 ring-amber-300 scale-110 shadow-xl'
    };
  }

  if (!isFilteredMatch) {
    return {
      hasRule: true,
      primaryRule,
      category,
      categoryMeta,
      badgeLabel: categoryMeta.nameEnglish.split(' ')[0],
      classes: 'opacity-40 hover:opacity-100 transition-opacity text-stone-300'
    };
  }

  // Normal rule highlight with color-coded underline and subtle background glow
  return {
    hasRule: true,
    primaryRule,
    category,
    categoryMeta,
    badgeLabel: categoryMeta.nameEnglish.split(' ')[0],
    classes: `${categoryMeta.bgClass} ${categoryMeta.textColor} ${categoryMeta.borderClass} hover:brightness-125 shadow-xs`
  };
}
