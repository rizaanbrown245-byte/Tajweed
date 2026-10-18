/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Verified Makhraj, Sifat, and Pronunciation Correction Diagnostics
 * Hafs 'an 'Asim via Ash-Shatibiyyah
 */

import { CorrectMakhrajInfo, CorrectSifatInfo, PronunciationCorrection } from '../tajweed/types';

export function getMakhrajForLetter(letterOrWord: string, ruleId: string): CorrectMakhrajInfo {
  // Check for Dal in Qalqalah
  if (letterOrWord.includes('د') || letterOrWord.includes('أَحَدٌ') || letterOrWord.includes('يَلِدْ') || letterOrWord.includes('يُولَدْ')) {
    return {
      region: 'Lisan',
      regionArabic: 'اللِّسَان (Al-Lisān - The Tongue)',
      specificPoint: 'Tip of the tongue meeting the gum line / roots of the upper central incisors (أُصُولُ الثَّنَايَا العُلْيَا).',
      anatomicalGuidance: 'Place the flat surface of your tongue tip firmly against the roots of your top two front teeth. Trap the acoustic air pressure behind it completely, then release sharply to produce the neutral echo bounce.'
    };
  }

  // Check for Qaf in Qalqalah or Isti'la
  if (letterOrWord.includes('ق') || letterOrWord.includes('فَلَقِ') || letterOrWord.includes('خَلَقَ')) {
    return {
      region: 'Lisan',
      regionArabic: 'اللِّسَان (Al-Lisān - The Tongue)',
      specificPoint: 'Aqṣā al-Lisān (أَقْصَى اللِّسَان - Deepest back of the tongue) against the soft palate near the uvula.',
      anatomicalGuidance: 'Raise the very back of your tongue until it firmly seals against the soft muscular palate. The release must be deep, authoritative, and resonant without shifting forward into a "k" sound.'
    };
  }

  // Check for Ba in Qalqalah or Meem Iqlab
  if (letterOrWord.includes('ب') || letterOrWord.includes('أَبْتَرُ') || letterOrWord.includes('تَبَّ')) {
    return {
      region: 'Shafatayn',
      regionArabic: 'الشَّفَتَان (Ash-Shafatān - The Two Lips)',
      specificPoint: 'Both lips pressed together at the moist inner line of contact.',
      anatomicalGuidance: 'Bring both lips together firmly to arrest the sound completely. In Qalqalah Kubra or Akbar, release with a clean outward bounce without adding an "a" or "i" vowel.'
    };
  }

  // Check for Noon / Ghunnah
  if (ruleId.includes('ghunnah') || letterOrWord.includes('ٱلنَّاسِ') || letterOrWord.includes('إِنَّ')) {
    return {
      region: 'Khayshum',
      regionArabic: 'الخَيْشُوم (Al-Khayshūm - The Nasal Cavity)',
      specificPoint: 'The nasal cavity and passage directly behind the nose.',
      anatomicalGuidance: 'Divert 100% of vocal sound into the nasal chamber. Maintain vibration for two full rhythmic counts (Harakatayn) before transitioning.'
    };
  }

  // Check for Ikhfa Haqiqi (Noon before Shin, etc.)
  if (ruleId.includes('ikhfa') || letterOrWord.includes('مِن شَرِّ') || letterOrWord.includes('ٱلْإِنسَٰنَ')) {
    return {
      region: 'Khayshum',
      regionArabic: 'الخَيْشُوم مَعَ اللِّسَان (Nasal Cavity & Tongue)',
      specificPoint: 'Ghunnah from the Khayshum while the tongue hovers near the makhraj of the incoming letter (Shin / Sin).',
      anatomicalGuidance: 'CRITICAL: Do NOT press the tongue tip against the upper gums. Keep the tongue hovering close to the palate so the Noon is concealed (Mukhfa) while holding a 2-count nasal resonance.'
    };
  }

  // Check for Madd (Al-Jawf)
  if (ruleId.includes('madd') || letterOrWord.includes('إِنَّآ') || letterOrWord.includes('جَآءَ') || letterOrWord.includes('ٱلضَّآلِّينَ')) {
    return {
      region: 'Jawf',
      regionArabic: 'الجَوْف (Al-Jawf - The Oral & Throat Cavity)',
      specificPoint: 'The open acoustic chamber spanning the throat and mouth without physical obstruction.',
      anatomicalGuidance: 'Keep the throat and oral passage wide open and relaxed. Sound must flow freely for the full required count (4-5 counts for Muttasil/Munfasil; 6 counts for Lazim).'
    };
  }

  // Check for Ra Tafkhim vs Tarqiq
  if (ruleId.includes('ra_') || letterOrWord.includes('رَّحْمَٰنِ') || letterOrWord.includes('رَبِّ') || letterOrWord.includes('شَرِّ')) {
    return {
      region: 'Lisan',
      regionArabic: 'اللِّسَان (Al-Lisān - The Tongue)',
      specificPoint: 'Tip of the tongue slightly deflected inward toward the upper palate.',
      anatomicalGuidance: 'For Tafkhim (heavy Ra), elevate the back of the tongue toward the soft palate to create a full oral echo. Keep the tongue tip steady: only a single light tap is permissible; never flutter or roll repeatedly (Takrir).'
    };
  }

  // Check for Idgham bila Ghunnah
  if (ruleId.includes('bila_ghunnah') || letterOrWord.includes('يَكُن لَّهُۥ')) {
    return {
      region: 'Lisan',
      regionArabic: 'اللِّسَان (Al-Lisān - The Tongue)',
      specificPoint: 'Edge of the tongue tip touching the upper gum ridge for the letter Lam (ل).',
      anatomicalGuidance: 'Dissolve the Noon completely into the Lam. Make clean contact with the gums and channel sound around the sides of the tongue. Zero sound should enter the nose.'
    };
  }

  // Default Middle Throat (Halq) e.g. Ayn / Ha
  return {
    region: 'Halq',
    regionArabic: 'الحَلْق (Al-Ḥalq - The Throat)',
    specificPoint: 'Wasaṭ al-Ḥalq (وَسَطُ الحَلْق - Middle throat near the epiglottis).',
    anatomicalGuidance: 'Slightly tighten the middle throat muscles without straining. Produce a clean, warm sound.'
  };
}

export function getSifatForLetter(letterOrWord: string, ruleId: string): CorrectSifatInfo {
  if (ruleId.includes('qalqalah') || letterOrWord.includes('أَحَدٌ') || letterOrWord.includes('فَلَقِ') || letterOrWord.includes('يَلِدْ')) {
    return {
      primarySifat: [
        'Shiddah (الشدة - Sound Arrest)',
        'Jahr (الجهر - Vocal Tone without Whisper)',
        'Qalqalah Kubrā (قلقلة كبرى - Major Echo Release on Pause)'
      ],
      sifatExplanation: 'Because Dal and Qaf possess Shiddah and Jahr, acoustic airflow is momentarily trapped 100%. When paused upon at the end of the word, it must be released with an instantaneous, neutral acoustic bounce without dragging or vowel addition.'
    };
  }

  if (ruleId.includes('ghunnah') || letterOrWord.includes('ٱلنَّاسِ') || letterOrWord.includes('إِنَّ')) {
    return {
      primarySifat: [
        'Ghunnah Akmal mā takūn (غنة أكمل ما تكون - Most Complete Nasalization)',
        'Tawassuṭ (التوسط - Moderation in Sound Flow)',
        'Jahr (الجهر - Clear Vocal Phonation)'
      ],
      sifatExplanation: 'The Shaddah on the Noon triggers the highest degree of Ghunnah in the science of Tajweed. The sound must vibrate warmly in the Khayshum for exactly two counts.'
    };
  }

  if (ruleId.includes('ikhfa') || letterOrWord.includes('مِن شَرِّ') || letterOrWord.includes('ٱلْإِنسَٰنَ')) {
    return {
      primarySifat: [
        'Ghunnah Kāmilah (غنة كاملة - Complete 2-Count Nasalization)',
        'Istifāl (استفال - Lightness) or Isti‘lā’ (استعلاء - Heaviness based on following letter)',
        'Infitāḥ (انفتاح - Open Mouth)'
      ],
      sifatExplanation: 'Ikhfa represents an intermediate state between clear manifestation (Idh-har) and complete merger (Idgham). The tongue does not press firmly; it hovers while the nasal resonance sustains for 2 counts.'
    };
  }

  if (ruleId.includes('madd') || letterOrWord.includes('إِنَّآ') || letterOrWord.includes('جَآءَ') || letterOrWord.includes('ٱلضَّآلِّينَ')) {
    return {
      primarySifat: [
        'Imtidād (امتداد - Elongation without Friction)',
        'Rakhāwah (رخاوة - Running of Sound)',
        'Khafa\' (خفاء - Intrinsic Subtlety of Madd Letters)'
      ],
      sifatExplanation: 'The Madd letter requires steady, unforced breath support. Do not constrict the throat or clamp the vocal cords until the full count (4-5 or 6 counts) is reached.'
    };
  }

  if (ruleId.includes('tafkhim') || letterOrWord.includes('صِّرَٰطَ') || letterOrWord.includes('مَغْضُوبِ')) {
    return {
      primarySifat: [
        'Isti‘lā’ (استعلاء - Elevation of Tongue Body)',
        'Iṭbāq (إطباق - Adhesion / Compression against Palate)',
        'Tafkhīm (تفخيم - Heavy Mouth Resonance)'
      ],
      sifatExplanation: 'Elevate the posterior and dorsum of the tongue toward the hard and soft palate, creating a deep resonance chamber inside the mouth without rounding or puckering the lips.'
    };
  }

  if (ruleId.includes('ra_') || letterOrWord.includes('رَّحْمَٰنِ') || letterOrWord.includes('رَبِّ')) {
    return {
      primarySifat: [
        'Inḥirāf (انحراف - Sound Deflection)',
        'Takrīr Khafiyy (تكرير خفي - Restrained Vibration)',
        'Tafkhīm (تفخيم - Heaviness due to Fathah/Dammah)'
      ],
      sifatExplanation: 'The sound deflects across the sides of the tongue tip. Restrain the vibration to a single contact; rolling the "r" like Spanish or Italian is a classical error.'
    };
  }

  // Default Sifat
  return {
    primarySifat: [
      'Jahr (الجهر - Vocal Tone)',
      'Tawassuṭ (التوسط - Balanced Sound Flow)',
      'Infitāḥ (الانفتاح - Openness)'
    ],
    sifatExplanation: 'Maintain steady phonation and unhurried articulation in accordance with the Tartil measured tempo.'
  };
}

export function generateCorrectionForWord(params: {
  wordIndex: number;
  arabicWord: string;
  cleanText: string;
  transliteration: string;
  ruleId: string;
  ruleName: string;
  observedIssue?: string;
  audioReferenceUrl?: string;
}): PronunciationCorrection {
  const { wordIndex, arabicWord, cleanText, transliteration, ruleId, ruleName, observedIssue, audioReferenceUrl } = params;

  const makhraj = getMakhrajForLetter(arabicWord, ruleId);
  const sifat = getSifatForLetter(arabicWord, ruleId);

  let defaultIssue = 'Pronunciation pace or articulation was flagged during acoustic analysis.';
  let expectedRecitation = 'Adhere to verified Hafs \'an \'Asim articulation rules and timing.';
  let practiceTip = 'Practice this word in isolation, then integrate it into the phrase.';
  let classicalCitation = 'Matn Tuhfat al-Atfal / Al-Muqaddimah al-Jazariyyah';

  if (ruleId.includes('qalqalah') || arabicWord.includes('أَحَدٌ') || arabicWord.includes('فَلَقِ') || arabicWord.includes('يَلِدْ')) {
    defaultIssue = 'Qalqalah bounce was missing, swallowed, or accompanied by an extraneous vowel (such as saying "Ahad-a" or stopping abruptly without echo).';
    expectedRecitation = 'Produce a crisp, neutral, unvoweled acoustic bounce (Qalqalah Kubra) upon stopping.';
    practiceTip = 'Do not add a Fathah or Kasrah to the bounce. Stop cleanly and release the tongue tip with neutral resonance.';
    classicalCitation = 'Al-Muqaddimah al-Jazariyyah: "قَلْقَلَةٌ قُطْبُ جَدٍّ..." (Bayt 27)';
  } else if (ruleId.includes('ikhfa') || arabicWord.includes('مِن شَرِّ') || arabicWord.includes('ٱلْإِنسَٰنَ')) {
    defaultIssue = 'Tongue tip made full physical contact with the upper gum ridge, producing Idh-har instead of a hovering Ikhfa with a 2-count Ghunnah.';
    expectedRecitation = 'Conceal the Noon by holding the tongue near the incoming letter makhraj while emitting a 2-count nasal resonance.';
    practiceTip = 'Pinch your nose gently while testing: sound must emerge from the nose for 2 counts while the mouth prepares for the next letter.';
    classicalCitation = 'Tuhfat al-Atfal: "وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ..." (Bayt 14)';
  } else if (ruleId.includes('ghunnah') || arabicWord.includes('ٱلنَّاسِ') || arabicWord.includes('إِنَّ')) {
    defaultIssue = 'Ghunnah was dropped prematurely (under 2 counts), weakening the obligatory nasalization on doubled Noon/Meem.';
    expectedRecitation = 'Sustain the Ghunnah Akmal for a full 2 counts (approx. 1 second at Tartil tempo) before releasing.';
    practiceTip = 'Count 2 rhythmic finger taps while sustaining the nasal hum on the doubled letter.';
    classicalCitation = 'Tuhfat al-Atfal: "وَغُنَّ مِيمًا ثُمَّ نُونًا شُدِّدَا * وَسَمِّ كُلاًّ حَرْفَ غُنَّةٍ بَدَا" (Bayt 17)';
  } else if (ruleId.includes('madd') || arabicWord.includes('إِنَّآ') || arabicWord.includes('جَآءَ')) {
    defaultIssue = 'Madd was cut short to 2 counts (Tabee\'i) instead of the obligatory 4 or 5 counts required in Hafs \'an \'Asim.';
    expectedRecitation = 'Elongate the sound smoothly for 4 to 5 counts before sounding the Hamzah.';
    practiceTip = 'Maintain steady breath flow without straining the throat. Count 4 deliberate beats.';
    classicalCitation = 'Tuhfat al-Atfal: "فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدّ * فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدّ" (Bayt 30)';
  } else if (ruleId.includes('ra_') || arabicWord.includes('رَّحْمَٰنِ') || arabicWord.includes('رَبِّ')) {
    defaultIssue = 'Ra was pronounced flat/light (Tarqiq) when Fathah requires heavy resonance (Tafkhim), or excessive fluttering occurred.';
    expectedRecitation = 'Pronounce Ra with heavy oral resonance (Tafkhim) and a single, disciplined tongue tap.';
    practiceTip = 'Elevate the back of the tongue toward the soft palate to create full mouth acoustics.';
    classicalCitation = 'Al-Muqaddimah al-Jazariyyah: "وَرَقِّقِ الرَّاءَ إِذَا مَا كُسِرَتْ..." (Bayt 41)';
  } else if (ruleId.includes('bila_ghunnah') || arabicWord.includes('يَكُن لَّهُۥ')) {
    defaultIssue = 'Nasal resonance lingered across the transition into Lam instead of complete assimilation (Idgham bi-Ghayri Ghunnah).';
    expectedRecitation = 'Merge the Noon completely into the Lam without any sound passing through the nasal cavity ("yakul-lahu").';
    practiceTip = 'Drop the Noon completely. Transition directly from Kaf with Dammah into the doubled Lam.';
    classicalCitation = 'Tuhfat al-Atfal: "وَالثَّانِ إِدْغَامٌ بِغَيْرِ غُنَّهْ * فِي اللاَّمِ وَالرَّا ثُمَّ كَرِّرَنَّهْ" (Bayt 12)';
  }

  return {
    id: `corr-${wordIndex}-${Date.now()}`,
    wordIndex,
    arabicWord,
    cleanText,
    transliteration,
    ruleId,
    ruleName,
    severity: 'moderate',
    observedIssue: observedIssue || defaultIssue,
    expectedRecitation,
    makhraj,
    sifat,
    practiceTip,
    classicalCitation,
    audioReferenceUrl
  };
}
