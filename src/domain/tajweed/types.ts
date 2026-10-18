/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tajweed Core Domain Types (Hafs 'an 'Asim Tradition)
 */

export type TajweedSubject =
  | 'makharij'        // Makharij al-huruf (Articulation points)
  | 'sifat'           // Sifat al-huruf (Characteristics)
  | 'noon_sakinah'    // Noon Sakinah & Tanween
  | 'meem_sakinah'    // Meem Sakinah
  | 'ghunnah'         // Ghunnah & its levels
  | 'madd'            // Madd & its categories
  | 'qalqalah'        // Qalqalah & its degrees
  | 'tafkhim_tarqiq'  // Tafkhim & Tarqiq (Heavy/Light letters)
  | 'lam_ra'          // Special rules of Lam and Ra
  | 'waqf_ibtida';     // Waqf (Stopping) & Ibtida (Starting)

export type DetectionReliability = 
  | 'high'                 // Consistently detectable via acoustic/phonetic feature analysis (e.g., duration of Madd, silent pauses, prominent nasalization)
  | 'moderate'             // Detectable with conservative thresholds (e.g., Qalqalah bounce, rough assimilation)
  | 'audio_limited_abstain'; // Subtle acoustic distinction requiring physical mouth shape confirmation / Talaqqi (e.g., fine Ikhfa tongue hovering, subtle Tawassut in 'ayn). System must abstain rather than misguide!

export interface ClassicalReference {
  work: string;            // e.g. "Tuhfat al-Atfal", "Al-Muqaddimah al-Jazariyyah", "Hidayat al-Qari"
  author: string;          // e.g. "Sulayman al-Jamzuri", "Ibn al-Jazari"
  verseOrChapter?: string; // e.g. "Bab Ahkam an-Noon as-Sakinah wa at-Tanween, Bayt 6-9"
  quoteArabic?: string;    // Classical poetic line or text
  quoteEnglish?: string;   // Translation of classical verse
}

export interface TajweedExample {
  surahNumber: number;
  ayahNumber: number;
  arabicWord: string;
  contextPhrase: string;
  transliteration: string;
  meaning: string;
  phoneticCue: string;
}

export interface TajweedRule {
  id: string;
  subject: TajweedSubject;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  description: string;
  conditions: string[];
  letters: string[];
  colorCode: string;
  examples: TajweedExample[];
  exceptions: string[];
  classicalReference: ClassicalReference;
  detectionReliability: DetectionReliability;
  practiceInstructions: string;
}

export type AssessmentTokenStatus =
  | 'accurate'
  | 'needs_attention'
  | 'abstained';

export interface WordTokenAssessment {
  wordIndex: number;
  arabicWord: string;
  cleanText: string;
  transliteration: string;
  status: AssessmentTokenStatus;
  detectedRules: string[]; // Rule IDs active on this word
  feedbackTitle?: string;
  feedbackDetail?: string;
  practiceSuggestion?: string;
  acousticMetrics?: {
    durationMs?: number;
    elongationHarakatEstimate?: number;
    nasalityDetected?: boolean;
    energyDipPause?: boolean;
    confidence: number;
  };
}

export interface CorrectMakhrajInfo {
  region: 'Jawf' | 'Halq' | 'Lisan' | 'Shafatayn' | 'Khayshum';
  regionArabic: string;
  specificPoint: string;
  anatomicalGuidance: string;
}

export interface CorrectSifatInfo {
  primarySifat: string[];
  sifatExplanation: string;
}

export interface PronunciationCorrection {
  id: string;
  wordIndex: number;
  arabicWord: string;
  cleanText: string;
  transliteration: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'moderate' | 'warning';
  observedIssue: string;
  expectedRecitation: string;
  makhraj: CorrectMakhrajInfo;
  sifat: CorrectSifatInfo;
  practiceTip: string;
  classicalCitation?: string;
  audioReferenceUrl?: string;
}

export interface RecitationAssessmentResult {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  timestamp: string;
  transcriptionConfidence: number; // 0-100 (text match confidence)
  pronunciationConfidence: number; // 0-100 (rule adherence confidence)
  overallStatus: 'passed' | 'requires_practice' | 'abstained';
  abstained: boolean;
  abstentionReason?: string;
  wordAssessments: WordTokenAssessment[];
  corrections: PronunciationCorrection[]; // Populated when pronunciation or Tajweed issues are flagged
  rulesEvaluated: {
    ruleId: string;
    ruleName: string;
    status: 'adhered' | 'review_needed' | 'uncertain_abstention' | 'not_present';
    notes: string;
  }[];
  disclaimer: string;
  audioDurationSeconds: number;
}

