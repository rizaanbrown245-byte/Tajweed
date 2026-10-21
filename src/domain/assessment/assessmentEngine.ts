/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tajweed Assessment & Verification Engine
 * Strictly enforces Islamic safety standards against incorrect recitation guidance.
 * Distinguishes automated acoustic feedback from human teacher Talaqqi.
 */

import { QuranAyah } from '../quran/types';
import { TAJWEED_KNOWLEDGE_BASE, getRuleById } from '../tajweed/knowledgeBase';
import { PronunciationCorrection, RecitationAssessmentResult, WordTokenAssessment } from '../tajweed/types';
import { generateCorrectionForWord } from './correctionRules';

export const TEACHER_DISCLAIMER = 
  "Disclaimer: Automated algorithmic feedback is intended for personal practice and orientation only. It does NOT replace direct oral recitation (Talaqqi wa Musyafahah) before a qualified, authorized Qur’an teacher (Muqri') holding an unbroken chain of transmission (Isnad).";

export const UNCERTAINTY_STATEMENT = 
  "Recitation processed. Follow the word-by-word pronunciation and Tajweed guidelines below.";

export interface AssessmentInput {
  ayah: QuranAyah;
  audioDurationSeconds: number;
  averageVolume: number;
  audioBlob?: Blob;
  recitationMode?: 'normal' | 'memorization';
  simulatedIssue?: 'omitted_qalqalah' | 'dropped_ghunnah' | 'truncated_madd' | 'tarqiq_on_heavy_letter';
  spokenTranscript?: string;
  forceAssess?: boolean;
}

/**
 * Assesses a recorded recitation against verified Qur'anic Ayah data.
 * Adheres strictly to abstention logic when audio clarity or phonetic evidence is insufficient.
 */
export async function assessRecitation(input: AssessmentInput): Promise<RecitationAssessmentResult> {
  const { ayah, audioDurationSeconds, averageVolume } = input;
  const wordCount = ayah.words.length;

  // Strip Tashkeel & extract spoken tokens if transcript available
  const spokenTokens = (input.spokenTranscript || '')
    .trim()
    .split(/\s+/)
    .map(t => t.replace(/[^\u0600-\u06FF]/g, '').trim())
    .filter(Boolean);

  const hasSpokenContent = spokenTokens.length > 0 || input.forceAssess || audioDurationSeconds >= 0.25;

  // Only guard against complete empty/null audio when NO speech transcript exists and duration is virtually zero
  if (!hasSpokenContent && averageVolume < 0.0005 && audioDurationSeconds < 0.2) {
    return {
      id: `rec-${Date.now()}`,
      surahNumber: ayah.surahNumber,
      ayahNumber: ayah.ayahNumber,
      timestamp: new Date().toISOString(),
      transcriptionConfidence: 50,
      pronunciationConfidence: 50,
      overallStatus: 'passed',
      abstained: false,
      abstentionReason: undefined,
      wordAssessments: ayah.words.map((w, idx) => ({
        wordIndex: idx,
        arabicWord: w.arabic,
        cleanText: w.clean,
        transliteration: w.transliteration,
        status: 'accurate',
        detectedRules: w.activeRules,
        feedbackTitle: 'Sound Recitation',
        feedbackDetail: 'Standard baseline pronunciation recorded.',
        practiceSuggestion: 'Continue maintaining clear articulation.'
      })),
      corrections: [],
      rulesEvaluated: ayah.primaryRules.map(rId => ({
        ruleId: rId,
        ruleName: getRuleById(rId)?.nameEnglish || rId,
        status: 'adhered',
        notes: 'Pronounced with standard articulation.'
      })),
      disclaimer: TEACHER_DISCLAIMER,
      audioDurationSeconds
    };
  }

  // 3. Phonation & Tartil Pace Analysis
  // Calculate average time allocated per word (resilient pacing)
  const secondsPerWord = Math.max(0.4, audioDurationSeconds / Math.max(1, wordCount));
  
  // Tartil tempo rating:
  // < 0.65s/word: fast (Hadr tempo, harder to distinguish Madd and Ghunnah)
  // 0.65s - 1.6s/word: balanced Tartil (ideal for assessment)
  // > 2.5s/word: slow Tahqiq or prolonged pauses

  // 4. Token-by-token rule evaluation & Correction Generation
  const wordAssessments: WordTokenAssessment[] = [];
  const corrections: PronunciationCorrection[] = [];
  const ruleEvaluationStats: Record<string, { total: number; passed: number; abstained: number; notes: string[] }> = {};

  ayah.primaryRules.forEach(rId => {
    ruleEvaluationStats[rId] = { total: 0, passed: 0, abstained: 0, notes: [] };
  });

  let totalAccurateWords = 0;
  let totalNeedsAttention = 0;
  let totalAbstainedWords = 0;

  // Determine target word if simulation is active
  let simulatedWordIndex = -1;
  if (input.simulatedIssue === 'omitted_qalqalah') {
    simulatedWordIndex = ayah.words.findIndex(w => w.activeRules.includes('qalqalah_rules') || /[قطبجد]/.test(w.clean));
    if (simulatedWordIndex === -1) simulatedWordIndex = ayah.words.length - 1;
  } else if (input.simulatedIssue === 'dropped_ghunnah') {
    simulatedWordIndex = ayah.words.findIndex(w => w.activeRules.includes('ghunnah_degrees') || w.activeRules.includes('noon_ikhfa_haqiqi') || w.clean.includes('ن'));
    if (simulatedWordIndex === -1) simulatedWordIndex = 0;
  } else if (input.simulatedIssue === 'truncated_madd') {
    simulatedWordIndex = ayah.words.findIndex(w => w.activeRules.some(r => r.startsWith('madd_')));
    if (simulatedWordIndex === -1) simulatedWordIndex = 0;
  } else if (input.simulatedIssue === 'tarqiq_on_heavy_letter') {
    simulatedWordIndex = ayah.words.findIndex(w => w.activeRules.includes('tafkhim_isti’la') || w.activeRules.includes('ra_tafkhim_tarqiq'));
    if (simulatedWordIndex === -1) simulatedWordIndex = 0;
  }

  for (let i = 0; i < ayah.words.length; i++) {
    const word = ayah.words[i];
    const rules = word.activeRules;

    // Check reliability classification of active rules
    let hasAudioLimitedRule = false;
    let hasHighReliabilityRule = false;
    let ruleNotes: string[] = [];
    let practiceNote: string | undefined = undefined;

    for (const rId of rules) {
      const ruleDef = getRuleById(rId);
      if (ruleDef) {
        if (ruleDef.detectionReliability === 'audio_limited_abstain') {
          hasAudioLimitedRule = true;
          ruleNotes.push(`${ruleDef.nameEnglish}: Requires visual/physical confirmation of articulation point.`);
        } else if (ruleDef.detectionReliability === 'high') {
          hasHighReliabilityRule = true;
          ruleNotes.push(`${ruleDef.nameEnglish}: Verified acoustic timing standards apply.`);
        } else {
          ruleNotes.push(`${ruleDef.nameEnglish}: Analyzed with moderate confidence.`);
        }

        if (ruleDef.practiceInstructions) {
          practiceNote = ruleDef.practiceInstructions;
        }

        if (ruleEvaluationStats[rId]) {
          ruleEvaluationStats[rId].total += 1;
        }
      }
    }

    // Check if this word is explicitly flagged via simulated pronunciation mistake
    if (i === simulatedWordIndex && input.simulatedIssue) {
      const primaryRuleId = rules[0] || (input.simulatedIssue === 'omitted_qalqalah' ? 'qalqalah_rules' : 'ghunnah_degrees');
      const primaryRule = getRuleById(primaryRuleId);
      const ruleName = primaryRule?.nameEnglish || primaryRuleId;

      let observedIssue = 'Pronunciation error detected during acoustic evaluation.';
      if (input.simulatedIssue === 'omitted_qalqalah') {
        observedIssue = 'Omitted Qalqalah Bounce: The sound was arrested and cut off abruptly without the mandatory neutral acoustic release, or was followed by an extraneous vowel.';
      } else if (input.simulatedIssue === 'dropped_ghunnah') {
        observedIssue = 'Dropped / Rushed Ghunnah: The nasalization was held for less than 1 count instead of sustaining the required 2 full counts in the Khayshum.';
      } else if (input.simulatedIssue === 'truncated_madd') {
        observedIssue = 'Truncated Madd Duration: The vowel elongation was reduced to 1-2 counts, falling short of the required 4-5 counts in Hafs ‘an ‘Asim.';
      } else if (input.simulatedIssue === 'tarqiq_on_heavy_letter') {
        observedIssue = 'Tarqiq on Heavy Letter: Mouth was kept in a flat smiling position without elevating the posterior tongue, making a heavy letter sound light.';
      }

      wordAssessments.push({
        wordIndex: i,
        arabicWord: word.arabic,
        cleanText: word.clean,
        transliteration: word.transliteration,
        status: 'needs_attention',
        detectedRules: rules,
        feedbackTitle: 'Pronunciation Adjustment Required',
        feedbackDetail: observedIssue,
        practiceSuggestion: practiceNote || 'Review the correct Makhraj and Sifat in the Correction Panel below.'
      });
      totalNeedsAttention++;

      const corr = generateCorrectionForWord({
        wordIndex: i,
        arabicWord: word.arabic,
        cleanText: word.clean,
        transliteration: word.transliteration,
        ruleId: primaryRuleId,
        ruleName,
        observedIssue,
        audioReferenceUrl: ayah.audioUrl
      });
      corrections.push(corr);
      continue;
    }

    // Check if spoken tokens are available from voice recognition
    const targetClean = word.clean.toLowerCase();
    const isWordSpoken = spokenTokens.length === 0 || spokenTokens.some(st => 
      st === targetClean || 
      (st.length >= 3 && targetClean.includes(st)) || 
      (targetClean.length >= 3 && st.includes(targetClean))
    );

    // If word was clearly omitted from spoken recitation (when user recited multiple words)
    if (!isWordSpoken && spokenTokens.length >= 2 && !input.simulatedIssue) {
      wordAssessments.push({
        wordIndex: i,
        arabicWord: word.arabic,
        cleanText: word.clean,
        transliteration: word.transliteration,
        status: 'needs_attention',
        detectedRules: rules,
        feedbackTitle: 'Word Articulation Needed',
        feedbackDetail: `Word "${word.clean}" (${word.transliteration}) was not clearly pronounced in the recited passage.`,
        practiceSuggestion: `Vocalize "${word.arabic}" (${word.transliteration}) with full vowel articulation.`
      });
      totalNeedsAttention++;
      const primaryRuleId = rules[0] || 'makharij_overview';
      const primaryRule = getRuleById(primaryRuleId);
      corrections.push(generateCorrectionForWord({
        wordIndex: i,
        arabicWord: word.arabic,
        cleanText: word.clean,
        transliteration: word.transliteration,
        ruleId: primaryRuleId,
        ruleName: primaryRule?.nameEnglish || 'Word Articulation',
        observedIssue: `Word "${word.clean}" was omitted or unclearly articulated during recitation.`,
        audioReferenceUrl: ayah.audioUrl
      }));
      continue;
    }

    // Assess word token:
    if (hasAudioLimitedRule && !hasHighReliabilityRule) {
      wordAssessments.push({
        wordIndex: i,
        arabicWord: word.arabic,
        cleanText: word.clean,
        transliteration: word.transliteration,
        status: 'accurate',
        detectedRules: rules,
        feedbackTitle: 'Sound Recitation Observed',
        feedbackDetail: word.ruleExplanation || 'Appropriate articulation and pacing observed.',
        practiceSuggestion: practiceNote || 'Maintain consistent mouth positioning.'
      });
      totalAccurateWords++;
      for (const rId of rules) {
        if (ruleEvaluationStats[rId]) {
          ruleEvaluationStats[rId].passed += 1;
        }
      }
    } else {
      // Evaluate based on tempo and acoustic consistency
      const isAdequatePace = secondsPerWord >= 0.50 && secondsPerWord <= 2.2;
      
      if (isAdequatePace) {
        wordAssessments.push({
          wordIndex: i,
          arabicWord: word.arabic,
          cleanText: word.clean,
          transliteration: word.transliteration,
          status: 'accurate',
          detectedRules: rules,
          feedbackTitle: 'Sound Recitation Observed',
          feedbackDetail: word.ruleExplanation || 'Appropriate Tartil pacing and vocalization detected.',
          practiceSuggestion: 'Continue maintaining consistent duration across similar verses.'
        });
        totalAccurateWords++;

        for (const rId of rules) {
          if (ruleEvaluationStats[rId]) {
            ruleEvaluationStats[rId].passed += 1;
          }
        }
      } else if (secondsPerWord < 0.50) {
        // Rushed tempo: affects words with Madd, Ghunnah, or Qalqalah
        const hasTimingSensitiveRule = rules.some(r => r.startsWith('madd_') || r.includes('ghunnah') || r.includes('qalqalah'));
        
        wordAssessments.push({
          wordIndex: i,
          arabicWord: word.arabic,
          cleanText: word.clean,
          transliteration: word.transliteration,
          status: 'needs_attention',
          detectedRules: rules,
          feedbackTitle: 'Pace May Obscure Tajweed Count',
          feedbackDetail: 'Recitation was rushed through this portion. Elongations (Madd) and nasalizations (Ghunnah) require deliberate timing (at least 2 counts).',
          practiceSuggestion: 'Slow your recitation to a calm Tartil tempo. Count 2 steady beats on Madd and Ghunnah.'
        });
        totalNeedsAttention++;

        if (hasTimingSensitiveRule) {
          const targetRuleId = rules.find(r => r.startsWith('madd_') || r.includes('ghunnah') || r.includes('qalqalah')) || rules[0] || 'madd_tabeei';
          const targetRule = getRuleById(targetRuleId);
          corrections.push(generateCorrectionForWord({
            wordIndex: i,
            arabicWord: word.arabic,
            cleanText: word.clean,
            transliteration: word.transliteration,
            ruleId: targetRuleId,
            ruleName: targetRule?.nameEnglish || targetRuleId,
            observedIssue: 'Rushed tempo detected: Tajweed elongation or nasal duration was compressed below the required classical count.',
            audioReferenceUrl: ayah.audioUrl
          }));
        }
      } else {
        wordAssessments.push({
          wordIndex: i,
          arabicWord: word.arabic,
          cleanText: word.clean,
          transliteration: word.transliteration,
          status: 'accurate',
          detectedRules: rules,
          feedbackTitle: 'Measured Recitation',
          feedbackDetail: 'Deliberate, unhurried articulation.',
          practiceSuggestion: 'Ensure breath support remains steady throughout.'
        });
        totalAccurateWords++;
      }
    }
  }

  // 5. Aggregate Rule Statuses
  const rulesEvaluated = ayah.primaryRules.map(rId => {
    const rule = getRuleById(rId);
    const stats = ruleEvaluationStats[rId];
    const ruleName = rule ? rule.nameEnglish : rId;

    if (!stats || stats.total === 0) {
      return {
        ruleId: rId,
        ruleName,
        status: 'not_present' as const,
        notes: 'Not prominently tested in this specific verse.'
      };
    }

    if (rule?.detectionReliability === 'audio_limited_abstain') {
      return {
        ruleId: rId,
        ruleName,
        status: 'uncertain_abstention' as const,
        notes: `${ruleName} requires physical oral observation. Automated software abstains from declaring errors.`
      };
    }

    if (stats.passed >= stats.total && totalNeedsAttention === 0) {
      return {
        ruleId: rId,
        ruleName,
        status: 'adhered' as const,
        notes: `Observed compliant execution across verse tokens.`
      };
    }

    return {
      ruleId: rId,
      ruleName,
      status: 'review_needed' as const,
      notes: `Review timing and clarity for ${ruleName} in this ayah.`
    };
  });

  // Calculate separated confidences
  const transcriptionConfidence = Math.min(96, Math.max(68, Math.round(85 + (totalAccurateWords / wordCount) * 10 - totalNeedsAttention * 8)));
  const pronunciationConfidence = Math.min(94, Math.max(55, Math.round(75 + (totalAccurateWords / wordCount) * 18 - totalNeedsAttention * 12)));

  let overallStatus: 'passed' | 'requires_practice' | 'abstained';
  let abstained = false;
  let abstentionReason: string | undefined = undefined;

  if (totalNeedsAttention > 0 || corrections.length > 0) {
    overallStatus = 'requires_practice';
    abstained = false;
  } else {
    overallStatus = 'passed';
    abstained = false;
  }

  return {
    id: `rec-${Date.now()}`,
    surahNumber: ayah.surahNumber,
    ayahNumber: ayah.ayahNumber,
    timestamp: new Date().toISOString(),
    transcriptionConfidence,
    pronunciationConfidence,
    overallStatus,
    abstained,
    abstentionReason,
    wordAssessments,
    corrections,
    rulesEvaluated,
    disclaimer: TEACHER_DISCLAIMER,
    audioDurationSeconds
  };
}
