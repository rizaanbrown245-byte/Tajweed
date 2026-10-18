/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Verified Tajweed Knowledge Base - Hafs 'an 'Asim via Ash-Shatibiyyah Path
 * Strictly referenced against classical manuals:
 * - "Tuhfat al-Atfal" by Al-Allamah Sulayman al-Jamzuri (d. 1208 AH)
 * - "Al-Muqaddimah al-Jazariyyah" by Al-Imam Shams ad-Din Ibn al-Jazari (d. 833 AH)
 * - "Hidayat al-Qari ila Tajweed Kalam al-Bari" by Shaykh Al-Marsafi
 */

import { TajweedRule } from './types';

export const TAJWEED_KNOWLEDGE_BASE: TajweedRule[] = [
  // 1. NOON SAKINAH & TANWEEN
  {
    id: 'noon_idhhar_halqi',
    subject: 'noon_sakinah',
    nameArabic: 'الإظهار الحلقي',
    nameEnglish: 'Throat Manifestation (Idh-har Halqi)',
    nameTransliteration: 'Idh-hār Ḥalqī',
    description: 'Pronouncing the Noon Sakinah or Tanween clearly from its articulation point (tongue tip touching the upper gums) without prolonged nasalization (Ghunnah) when followed by one of the six throat letters.',
    conditions: [
      'Noon Sakinah (نْ) or Tanween (ً ٍ ٌ)',
      'Followed immediately in the same word or across words by one of the six throat letters: ء ه ع ح غ خ'
    ],
    letters: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'],
    colorCode: '#059669', // Emerald
    examples: [
      {
        surahNumber: 108,
        ayahNumber: 2,
        arabicWord: 'وَٱنْحَرْ',
        contextPhrase: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ',
        transliteration: 'wanḥar',
        meaning: 'and sacrifice',
        phoneticCue: 'Pronounce the Noon clearly without holding any extra nasal hum before transitioning to the unconstricted Ha (ح).'
      },
      {
        surahNumber: 112,
        ayahNumber: 4,
        arabicWord: 'كُفُوًا أَحَدٌ',
        contextPhrase: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
        transliteration: 'kufuwan aḥad',
        meaning: 'equivalent to Him anyone',
        phoneticCue: 'The tanween on "كُفُوًا" is manifested cleanly before the Hamzah "أَحَدٌ".'
      },
      {
        surahNumber: 113,
        ayahNumber: 3,
        arabicWord: 'غَاسِقٍ إِذَا',
        contextPhrase: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        transliteration: 'ghāsiqin idhā',
        meaning: 'of darkness when it gathers',
        phoneticCue: 'Crisp separation of the tanween kasrah on Qaf before the Hamzah.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bāb Aḥkām an-Nūn as-Sākinah, Bayt 7',
      quoteArabic: 'فَالْأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ * لِلْحَلْقِ سِتٌّ رُتِّبَتْ فَلْتَعْرِفِ / هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ * مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ',
      quoteEnglish: 'The first rule is Idh-har before six throat letters arranged in order: Hamzah then Ha, then Ayn and Ha without dots, then Ghayn and Kha.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Ensure the tongue tip makes distinct contact with the upper gum ridge and releases promptly. Do NOT hold a lingering ghunnah on the Noon.'
  },
  {
    id: 'noon_idgham_ghunnah',
    subject: 'noon_sakinah',
    nameArabic: 'الإدغام بغنة',
    nameEnglish: 'Assimilation with Nasalization (Idgham bi-Ghunnah)',
    nameTransliteration: 'Idghām bi-Ghunnah',
    description: 'Merging the Noon Sakinah or Tanween completely or incompletely into the following letter with an audible 2-count nasal resonance (Ghunnah) when followed by one of the letters in "يَنْمُو" (Ya, Noon, Meem, Waw). Must occur across two separate words.',
    conditions: [
      'Noon Sakinah (نْ) at the end of a word, or Tanween (ً ٍ ٌ)',
      'Followed at the beginning of the next word by one of: ي ن م و',
      'Must occur between two words. If it occurs in a single word, it is Izhar Mutlaq (exception).'
    ],
    letters: ['ي', 'ن', 'م', 'و'],
    colorCode: '#8b5cf6', // Violet
    examples: [
      {
        surahNumber: 111,
        ayahNumber: 1,
        arabicWord: 'تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ',
        contextPhrase: 'لَهَبٍ وَتَبَّ',
        transliteration: 'lahabiw-watabb',
        meaning: 'flame, and he perished',
        phoneticCue: 'The tanween merges directly into the Waw while a warm, vibrant nasal buzz resonates for 2 harakat.'
      },
      {
        surahNumber: 99,
        ayahNumber: 7,
        arabicWord: 'فَمَن يَعْمَلْ',
        contextPhrase: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُۥ',
        transliteration: 'famay-ya‘mal',
        meaning: 'So whoever does',
        phoneticCue: 'The Noon merges into Ya; hold the ghunnah for approximately 2 counts from the nasal cavity.'
      }
    ],
    exceptions: [
      'Al-Idh-hār al-Muṭlaq (الإظهار المطلق): When Noon Sakinah is followed by Waw or Ya within a SINGLE word, Idgham is forbidden and it must be read clearly. There are only four such words in the entire Qur\'an: دُنْيَا (Dunya), بُنْيَان (Bunyan), قِنْوَان (Qinwan), صِنْوَان (Sinwan).'
    ],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 9-11',
      quoteArabic: 'وَالثَّانِ إِدْغَامٌ بِسِتَّةٍ أَتَتْ * فِي يَرْمُلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ / لَكِنَّهَا قِسْمَانِ قِسْمٌ يُدْغَمَا * فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا / إِلاَّ إِذَا كَانَا بِكِلْمَةٍ فَلاَ * تُدْغِمْ كَدُنْيَا ثُمَّ صِنْوَانٍ تَلاَ',
      quoteEnglish: 'The second is Idgham in six letters compiled in Yarmalun... divided into two: one with Ghunnah known in Yanmu, except when both occur in a single word, like Dunya and Sinwan.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Blend the sounds seamlessly into the subsequent letter while diverting approximately 50% of acoustic airflow through the nose for 2 counts.'
  },
  {
    id: 'noon_idgham_bila_ghunnah',
    subject: 'noon_sakinah',
    nameArabic: 'الإدغام بغير غنة',
    nameEnglish: 'Complete Assimilation without Nasalization',
    nameTransliteration: 'Idghām bi-Ghayri Ghunnah',
    description: 'Completely merging the Noon Sakinah or Tanween into Lam (ل) or Ra (ر) so that no trace of the Noon or its Ghunnah remains.',
    conditions: [
      'Noon Sakinah (نْ) or Tanween (ً ٍ ٌ) at the end of a word',
      'Followed at the beginning of the next word by Lam (ل) or Ra (ر)'
    ],
    letters: ['ل', 'ر'],
    colorCode: '#6366f1', // Indigo
    examples: [
      {
        surahNumber: 112,
        ayahNumber: 4,
        arabicWord: 'وَلَمْ يَكُن لَّهُۥ',
        contextPhrase: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
        transliteration: 'wa lam yakul-lahu',
        meaning: 'And there is none unto Him',
        phoneticCue: 'The Noon in "يَكُن" dissolves completely into the Lam of "لَّهُ" without any nasal hum (yakul-lahu).'
      },
      {
        surahNumber: 108,
        ayahNumber: 2,
        arabicWord: 'لِرَبِّكَ',
        contextPhrase: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ',
        transliteration: 'li-Rabbika',
        meaning: 'to your Lord',
        phoneticCue: 'Direct transition with complete shaddah effect.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 12',
      quoteArabic: 'وَالثَّانِ إِدْغَامٌ بِغَيْرِ غُنَّهْ * فِي اللاَّمِ وَالرَّا ثُمَّ كَرِّرَنَّهْ',
      quoteEnglish: 'The second kind is Idgham without Ghunnah in Lam and Ra, then practice Takrir on Ra moderately.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Drop the Noon completely. Do not let any nasal resonance linger. Go straight into a doubled Lam or heavy/light Ra.'
  },
  {
    id: 'noon_iqlab',
    subject: 'noon_sakinah',
    nameArabic: 'الإقلاب (القلب)',
    nameEnglish: 'Conversion into Meem (Iqlab)',
    nameTransliteration: 'Iqlāb',
    description: 'Converting the Noon Sakinah or Tanween into a concealed Meem (م) with Ghunnah (2 counts) and slight relaxation of lips (no tight press) when followed by the letter Ba (ب).',
    conditions: [
      'Noon Sakinah (نْ) or Tanween (ً ٍ ٌ)',
      'Followed by the letter Ba (ب) either within a single word or across words',
      'Marked in the Mushaf with a small Meem (ۭ or ۢ)'
    ],
    letters: ['ب'],
    colorCode: '#d97706', // Amber Gold
    examples: [
      {
        surahNumber: 2,
        ayahNumber: 19,
        arabicWord: 'مُحِيطٌۢ بِٱلْكَٰفِرِينَ',
        contextPhrase: 'وَٱللَّهُ مُحِيطٌۢ بِٱلْكَٰفِرِينَ',
        transliteration: 'muḥīṭum-bil-kāfirīn',
        meaning: 'encompassing the disbelievers',
        phoneticCue: 'Convert the tanween on "مُحِيطٌ" into an elongated Meem before gently closing for the Ba.'
      },
      {
        surahNumber: 90,
        ayahNumber: 2,
        arabicWord: 'أَنتَ حِلٌّۢ بِهَٰذَا',
        contextPhrase: 'وَأَنتَ حِلٌّۢ بِهَٰذَا ٱلْبَلَدِ',
        transliteration: 'ḥillum-bihādhā',
        meaning: 'free of restriction in this city',
        phoneticCue: 'Lips meet gently without clamping; hold nasalization for 2 counts.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 13',
      quoteArabic: 'وَالثَّالِثُ الإِقْلاَبُ عِنْدَ الْبَاءِ * مِيمًا بِغُنَّةٍ مَعَ الإِخْفَاءِ',
      quoteEnglish: 'The third rule is Iqlab at the letter Ba: turning into Meem with Ghunnah accompanied by Ikhfa.'
    },
    detectionReliability: 'moderate',
    practiceInstructions: 'Touch the lips lightly together without squeezing. Channel the voice into the nasal chamber for two beats before releasing into the letter Ba.'
  },
  {
    id: 'noon_ikhfa_haqiqi',
    subject: 'noon_sakinah',
    nameArabic: 'الإخفاء الحقيقي',
    nameEnglish: 'True Concealment (Ikhfa\' Haqiqi)',
    nameTransliteration: 'Ikhfā’ Ḥaqīqī',
    description: 'Pronouncing the Noon Sakinah or Tanween in an intermediate state between Idh-har and Idgham, without Shaddah on the subsequent letter, accompanied by a 2-count Ghunnah. The tongue hovers near the makhraj of the following letter without making firm contact.',
    conditions: [
      'Noon Sakinah (نْ) or Tanween (ً ٍ ٌ)',
      'Followed by one of the fifteen letters of Ikhfa: ص ذ ث ك ج ش ق س د ط ز ف ت ض ظ'
    ],
    letters: ['ص', 'ذ', 'ث', 'ك', 'ج', 'ش', 'ق', 'س', 'د', 'ط', 'ز', 'ف', 'ت', 'ض', 'ظ'],
    colorCode: '#f59e0b', // Warm Amber
    examples: [
      {
        surahNumber: 114,
        ayahNumber: 4,
        arabicWord: 'مِن شَرِّ',
        contextPhrase: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ',
        transliteration: 'min sharri',
        meaning: 'from the evil of the whisperer',
        phoneticCue: 'Prepare tongue near the Shin (ش) while emitting a light Ghunnah for 2 counts.'
      },
      {
        surahNumber: 113,
        ayahNumber: 2,
        arabicWord: 'مِن شَرِّ',
        contextPhrase: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'min sharri',
        meaning: 'from the evil of what He created',
        phoneticCue: 'Do NOT press the tongue tip against the gums. Let the sound hover.'
      },
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'أَنْعَمْتَ',
        contextPhrase: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
        transliteration: 'an‘amta',
        meaning: 'You have bestowed favor upon',
        phoneticCue: 'Contrast note: Here the Noon is Idh-har because Ayn follows it, but Ta follows Meem.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 14-16',
      quoteArabic: 'وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ * مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ / فِي خَمْسَةٍ مِنْ بَعْدِ عَشْرٍ رَمْزُهَا * فِي كِلْمِ هَذَا البَيْتِ قَد ضَمَّنْتُهَا: صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا * دُمْ طَيِّبًا زِدْ فِي تُقَى ضَعْ ظَالِمَا',
      quoteEnglish: 'The fourth is Ikhfa at the remaining letters... fifteen codified in the first letters of: Sif dha thana kam jada shakhsun qad sama / Dum tayyiban zid fi tuqa da‘ zalima.'
    },
    detectionReliability: 'moderate',
    practiceInstructions: 'Position your tongue near the articulation point of the incoming letter without closing it completely. If the following letter is heavy (e.g. Qaf, Sad, Ta, Dhad, Dha), the Ghunnah must also be pronounced heavy (Tafkhim).'
  },

  // 2. MEEM SAKINAH
  {
    id: 'meem_ikhfa_shafawi',
    subject: 'meem_sakinah',
    nameArabic: 'الإخفاء الشفوي',
    nameEnglish: 'Labial Concealment (Ikhfa\' Shafawi)',
    nameTransliteration: 'Ikhfā’ Shafawī',
    description: 'Hiding the Meem Sakinah with a 2-count Ghunnah when followed immediately by the letter Ba (ب) across two words.',
    conditions: [
      'Meem Sakinah (مْ) at the end of a word',
      'Followed by the letter Ba (ب) at the start of the next word'
    ],
    letters: ['ب'],
    colorCode: '#e11d48', // Rose
    examples: [
      {
        surahNumber: 105,
        ayahNumber: 4,
        arabicWord: 'تَرْمِيهِم بِحِجَارَةٍ',
        contextPhrase: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ',
        transliteration: 'tarmīhim bi-ḥijārah',
        meaning: 'striking them with stones',
        phoneticCue: 'Gently bring lips together on the Meem without pressing heavily; prolong the nasal hum for 2 counts.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 20',
      quoteArabic: 'فَالأَوَّلُ الإِخْفَاءُ عِنْدَ الْبَاءِ * وَسَمِّهِ الشَّفْوِيَّ لِلْقُرَّاءِ',
      quoteEnglish: 'The first is Ikhfa at the Ba, named Shafawi (labial) according to the Qurra.'
    },
    detectionReliability: 'moderate',
    practiceInstructions: 'Touch the lips together lightly without tight clamping, letting the sound pass primarily through the nose for 2 counts.'
  },
  {
    id: 'meem_idgham_mithlayn',
    subject: 'meem_sakinah',
    nameArabic: 'إدغام المتماثلين الصغير',
    nameEnglish: 'Labial Assimilation (Idgham Shafawi)',
    nameTransliteration: 'Idghām Shafawī (Mithlayn)',
    description: 'Merging Meem Sakinah into another vowel-carrying Meem, resulting in a single doubled Meem (مّ) with a full Ghunnah of 2 counts.',
    conditions: [
      'Meem Sakinah (مْ)',
      'Followed by another Meem (مَ مِ مُ)'
    ],
    letters: ['م'],
    colorCode: '#7c3aed', // Purple
    examples: [
      {
        surahNumber: 106,
        ayahNumber: 4,
        arabicWord: 'أَطْعَمَهُم مِّن',
        contextPhrase: 'ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍ',
        transliteration: 'aṭ‘amahum-min',
        meaning: 'Who fed them against hunger',
        phoneticCue: 'The two Meems become one doubled Meem with complete 2-count ghunnah.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 21',
      quoteArabic: 'وَالثَّانِ إِدْغَامٌ بِمِثْلِهَا أَتَى * وَسَمِّ إِدْغَامًا صَغِيرًا يَا فَتَى',
      quoteEnglish: 'The second is Idgham into its identical twin; call it Idgham Saghir, young student.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Close both lips and sustain the nasalization for a full 2 counts.'
  },
  {
    id: 'meem_idhhar_shafawi',
    subject: 'meem_sakinah',
    nameArabic: 'الإظهار الشفوي',
    nameEnglish: 'Labial Manifestation (Idh-har Shafawi)',
    nameTransliteration: 'Idh-hār Shafawī',
    description: 'Pronouncing the Meem Sakinah clearly from between the two lips without added ghunnah when followed by any of the remaining 26 letters.',
    conditions: [
      'Meem Sakinah (مْ)',
      'Followed by any Arabic letter EXCEPT Ba (ب) or Meem (م)',
      'Special caution: Take extra care not to conceal the Meem before Waw (و) or Fa (ف) due to closeness of makhraj.'
    ],
    letters: ['all letters except ب and م'],
    colorCode: '#10b981', // Emerald
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'عَلَيْهِمْ غَيْرِ',
        contextPhrase: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ',
        transliteration: '‘alayhim ghayril',
        meaning: 'upon them, not of those who evoked anger',
        phoneticCue: 'Keep the Meem in "عَلَيْهِمْ" distinct and do not bleed into the Ghayn.'
      },
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'عَلَيْهِمْ وَلَا',
        contextPhrase: 'عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
        transliteration: '‘alayhim wa-laḍ-ḍāllīn',
        meaning: 'upon them nor of those who are astray',
        phoneticCue: 'Warning: Do not hide the Meem before the Waw! Close lips firmly on Meem then open into Waw.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 22-23',
      quoteArabic: 'وَالثَّالِثُ الإِظْهَارُ فِي الْبَقِيَّهْ * مِنْ أَحْرُفٍ وَسَمِّهَا شَفْوِيَّهْ / وَاحْذَرْ لَدَى وَاوٍ وَفَا أَنْ تَخْتَفِي * لِقُرْبِهَا وَالاتِّحَادِ فَاعْرِفِ',
      quoteEnglish: 'The third is Idh-har in the remaining letters, named Shafawi. Beware of hiding it before Waw and Fa due to closeness and unity of articulation.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Close the lips crisply and open immediately. Never drag the sound before Waw or Fa.'
  },

  // 3. GHUNNAH (Levels of Nasalization)
  {
    id: 'ghunnah_degrees',
    subject: 'ghunnah',
    nameArabic: 'مراتب الغنة',
    nameEnglish: 'Degrees of Ghunnah (Nasalization)',
    nameTransliteration: 'Marātib al-Ghunnah',
    description: 'Ghunnah is a sweet, resonant sound emitted from the Khayshum (nasal cavity). It has four degrees in Hafs \'an \'Asim: 1) Akmal (Most Complete: Noon/Meem Mushaddadah, Idgham bi-ghunnah), 2) Kamilah (Complete: Ikhfa Haqiqi, Ikhfa Shafawi, Iqlab), 3) Naqisah (Deficient: Noon/Meem Sakinah with Idh-har), 4) Anqas (Least Deficient: Voweled Noon/Meem).',
    conditions: [
      'Any presence of the letters Noon (ن) or Meem (م) in any phonetic state'
    ],
    letters: ['ن', 'م'],
    colorCode: '#047857', // Deep Emerald
    examples: [
      {
        surahNumber: 114,
        ayahNumber: 1,
        arabicWord: 'ٱلنَّاسِ',
        contextPhrase: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
        transliteration: 'an-nās',
        meaning: 'mankind',
        phoneticCue: 'Level 1 (Akmal): Hold the Noon Mushaddadah with full 2-count ghunnah.'
      },
      {
        surahNumber: 112,
        ayahNumber: 1,
        arabicWord: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
        contextPhrase: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
        transliteration: 'Qul huwa-Llāhu Aḥad',
        meaning: 'Say He is Allah [who is] One',
        phoneticCue: 'Baseline: Minimal intrinsic nasal resonance inherent to the letter.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb as-Sifāt, Bayt 33',
      quoteArabic: 'وَغُنَّةٌ مَخْرَجُهَا الخَيْشُومُ',
      quoteEnglish: 'And Ghunnah, its point of articulation is the nasal cavity (Khayshum).'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Test your Ghunnah: Pinch your nostrils while reciting. The sound should completely halt if you are correctly using the Khayshum.'
  },

  // 4. MADD & ITS CATEGORIES
  {
    id: 'madd_tabeei',
    subject: 'madd',
    nameArabic: 'المد الطبيعي (الأصلي)',
    nameEnglish: 'Natural Lengthening (Madd Tabee\'i)',
    nameTransliteration: 'Al-Madd aṭ-Ṭabī‘ī',
    description: 'The fundamental elongation of the Madd letters (Alif preceded by Fathah, Waw Sakinah preceded by Dammah, Ya Sakinah preceded by Kasrah) held for exactly 2 harakat (approx. 1 second). It has no external cause like Hamzah or Sukoon.',
    conditions: [
      'Alif preceded by Fathah (ـَ ا)',
      'Waw Sakinah preceded by Dammah (ـُ وْ)',
      'Ya Sakinah preceded by Kasrah (ـِ يْ)',
      'No Hamzah or Sukoon comes after the Madd letter'
    ],
    letters: ['ا', 'و', 'ي'],
    colorCode: '#0284c7', // Sky Blue
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 4,
        arabicWord: 'مَٰلِكِ',
        contextPhrase: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
        transliteration: 'Māliki',
        meaning: 'Sovereign of',
        phoneticCue: 'Hold the "Mā" for exactly two counts. Do not cut short (1 count) and do not stretch to 3-4 counts.'
      },
      {
        surahNumber: 112,
        ayahNumber: 3,
        arabicWord: 'يُولَدْ',
        contextPhrase: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'yūlad',
        meaning: 'nor was He born',
        phoneticCue: 'Hold the "yū" smoothly for two counts.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 24-26',
      quoteArabic: 'وَالْمَدُّ أَصْلِيٌّ وَفَرْعِيٌّ لَهُ * وَسَمِّ أَوَّلاً طَبِيعِيًّا وَهُو: / مَا لاَ تَوَقُّفٌ لَهُ عَلَى سَبَبْ * وَلاَ بِدُونِهِ الحُرُوفُ تُجْتَلَبْ',
      quoteEnglish: 'Madd is original (Asli) and branch (Far\'i). The first is Tabee\'i: that which does not depend upon a cause, nor can the letter exist without it.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Count 2 rhythmic finger pulses. A common error is rushing it down to 1 count or exaggerating it to 3.'
  },
  {
    id: 'madd_wajib_muttasil',
    subject: 'madd',
    nameArabic: 'المد الواجب المتصل',
    nameEnglish: 'Obligatory Connected Elongation',
    nameTransliteration: 'Al-Madd al-Wājib al-Muttaṣil',
    description: 'When a Madd letter is followed by a Hamzah (ء) in the SAME word. In the narration of Hafs \'an \'Asim via Shatibiyyah, it must be elongated for 4 or 5 harakat (counts).',
    conditions: [
      'A Madd letter followed immediately by Hamzah',
      'Both must reside in the identical word',
      'Duration: 4 or 5 counts in continuous recitation, 6 counts permissible if stopped on at the end of an ayah'
    ],
    letters: ['ا', 'و', 'ي'],
    colorCode: '#dc2626', // Crimson Red
    examples: [
      {
        surahNumber: 110,
        ayahNumber: 1,
        arabicWord: 'جَآءَ',
        contextPhrase: 'إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ',
        transliteration: 'jā’a',
        meaning: 'comes',
        phoneticCue: 'Elongate the Alif for 4 or 5 counts before pronouncing the crisp Hamzah.'
      },
      {
        surahNumber: 2,
        ayahNumber: 5,
        arabicWord: 'أُو۟لَٰٓئِكَ',
        contextPhrase: 'أُو۟لَٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ',
        transliteration: 'ulā’ika',
        meaning: 'Those are upon guidance',
        phoneticCue: 'Hold for 4 counts.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 30',
      quoteArabic: 'فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدّ * فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدّ',
      quoteEnglish: 'It is obligatory (Wajib) if a Hamzah follows a Madd letter in a single word, and that is called Muttasil.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Ensure you reach at least 4 full counts. Never drop below 4 in Hafs \'an \'Asim.'
  },
  {
    id: 'madd_jaiz_munfasil',
    subject: 'madd',
    nameArabic: 'المد الجائز المنفصل',
    nameEnglish: 'Permissible Separated Elongation',
    nameTransliteration: 'Al-Madd al-Jā’iz al-Munfaṣil',
    description: 'When a Madd letter is at the end of a word and the following word begins with a Hamzah (ء). In the path of Ash-Shatibiyyah, it is prolonged for 4 or 5 counts.',
    conditions: [
      'Madd letter at the end of word #1',
      'Hamzah at the start of word #2',
      'Duration: 4 or 5 counts in Shatibiyyah'
    ],
    letters: ['ا', 'و', 'ي'],
    colorCode: '#ea580c', // Orange
    examples: [
      {
        surahNumber: 108,
        ayahNumber: 1,
        arabicWord: 'إِنَّآ أَعْطَيْنَٰكَ',
        contextPhrase: 'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ',
        transliteration: 'innā a‘ṭaynāka',
        meaning: 'Indeed We have granted you',
        phoneticCue: 'Elongate "innā" for 4 counts before sounding "a‘ṭaynāka". If you pause between words, it reverts to 2 counts (Tabee\'i).'
      },
      {
        surahNumber: 109,
        ayahNumber: 1,
        arabicWord: 'يَٰٓأَيُّهَا',
        contextPhrase: 'قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ',
        transliteration: 'yā-ayyuhā',
        meaning: 'O you disbelievers',
        phoneticCue: 'Written joined in calligraphy but phonetically separated; hold for 4 counts.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 31',
      quoteArabic: 'وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ * كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ',
      quoteEnglish: 'It is permissible (Ja\'iz) to elongate or shorten if separated in different words, and this is Munfasil.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Balance your Madd Munfasil with your Madd Muttasil. If you choose 4 counts, apply 4 counts consistently throughout your recitation.'
  },
  {
    id: 'madd_arid_sukoon',
    subject: 'madd',
    nameArabic: 'المد العارض للسكون',
    nameEnglish: 'Temporary Elongation due to Pause',
    nameTransliteration: 'Al-Madd al-‘Āriḍ li-s-Sukūn',
    description: 'When a natural Madd letter is followed by a letter whose vowel is rendered temporary Sukoon because the reciter pauses (waqf) on it. Permissible lengths in Hafs are 2, 4, or 6 counts.',
    conditions: [
      'Madd letter near end of word',
      'The final letter is stopped upon with temporary Sukoon',
      'Allowable lengths: 2 (Qasr), 4 (Tawassut), or 6 (Tul) counts'
    ],
    letters: ['ا', 'و', 'ي'],
    colorCode: '#0ea5e9', // Light Blue
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 2,
        arabicWord: 'ٱلْعَٰلَمِينَ',
        contextPhrase: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
        transliteration: 'al-‘ālamīn',
        meaning: 'the Lord of the worlds',
        phoneticCue: 'When stopping on the Nun, you may hold the Ya for 2, 4, or 6 counts.'
      },
      {
        surahNumber: 1,
        ayahNumber: 4,
        arabicWord: 'ٱلدِّينِ',
        contextPhrase: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
        transliteration: 'ad-dīn',
        meaning: 'the Day of Recompense',
        phoneticCue: 'Maintain consistent duration (e.g., 4 counts) across all ayah endings.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 32',
      quoteArabic: 'وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ * وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ',
      quoteEnglish: 'And like this if Sukoon presents itself due to stopping, as in ta‘lamūn and nasta‘īn.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Select one duration (4 counts is recommended for balanced learning) and keep all ayah ends in the Surah identical.'
  },
  {
    id: 'madd_lazim',
    subject: 'madd',
    nameArabic: 'المد اللازم',
    nameEnglish: 'Compulsory Elongation (6 Harakat)',
    nameTransliteration: 'Al-Madd al-Lāzim',
    description: 'When an original, permanent Sukoon or Shaddah follows a Madd letter in the same word (Kalimi) or in a letter of the Muqatta\'at (Harfi). It MUST be prolonged for a full 6 harakat without exception.',
    conditions: [
      'Madd letter followed by permanent Sukoon or Shaddah',
      'Duration: Strict 6 counts (approx 3 full seconds)'
    ],
    letters: ['ا', 'و', 'ي'],
    colorCode: '#991b1b', // Dark Crimson
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'ٱلضَّآلِّينَ',
        contextPhrase: 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
        transliteration: 'wa-laḍ-ḍāllīn',
        meaning: 'nor of those who are astray',
        phoneticCue: 'Madd Lazim Kalimi Muthaqqal: Stretch the Alif for a full 6 counts, then transition with pressure (Nabrah) into the doubled heavy Lam.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Tuḥfat al-Aṭfāl',
      author: 'Imām Sulaymān al-Jamzūrī',
      verseOrChapter: 'Bayt 34-36',
      quoteArabic: 'أَقْسَامُ لاَزِمٍ لَدَيْهِمْ أَرْبَعَهْ * وَتِلْكَ كِلْمِيٌّ وَحَرْفِيٌّ مَعَهْ / كِلاَهُمَا مُخَفَّفٌ مُثَقَّلُ * فَهَذِهِ أَرْبَعَةٌ تُفَصَّلُ',
      quoteEnglish: 'Categories of Lazim are four: Kalimi and Harfi, each being Mukhaffaf or Muthaqqal.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Do not hurry! Ensure full 6 counts. Press firmly onto the subsequent Shaddah.'
  },

  // 5. QALQALAH
  {
    id: 'qalqalah_rules',
    subject: 'qalqalah',
    nameArabic: 'القلقلة ومراتبها',
    nameEnglish: 'The Echoing Letters (Qalqalah)',
    nameTransliteration: 'Al-Qalqalah',
    description: 'A distinct acoustic bounce / echoing vibration produced when releasing the sound of one of the five letters of "قُطْبُ جَدٍّ" (Qaf, Ta, Ba, Jeem, Dal) when they carry Sukoon (original or due to stopping).',
    conditions: [
      'One of the five letters: ق ط ب ج د',
      'The letter must have a Sukoon (ْ) or be stopped upon at word ending',
      'Levels: 1) Sughra (Minor: middle of word or connected speech), 2) Kubra (Major: stopped on at end of word without shaddah), 3) Akbar (Greatest: stopped on with shaddah, e.g. "وَتَبَّ")'
    ],
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    colorCode: '#0284c7', // Cyan/Blue
    examples: [
      {
        surahNumber: 112,
        ayahNumber: 1,
        arabicWord: 'أَحَدٌ',
        contextPhrase: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
        transliteration: 'aḥad',
        meaning: 'One',
        phoneticCue: 'Qalqalah Kubra: When pausing on the Dal, produce a crisp, resonant bounce without adding any trailing vowel (fathah/kasrah).'
      },
      {
        surahNumber: 113,
        ayahNumber: 1,
        arabicWord: 'ٱلْفَلَقِ',
        contextPhrase: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
        transliteration: 'al-falaq',
        meaning: 'the daybreak',
        phoneticCue: 'Qalqalah Kubra: Resonant release at the deep back of the tongue (Qaf).'
      },
      {
        surahNumber: 113,
        ayahNumber: 2,
        arabicWord: 'خَلَقَ',
        contextPhrase: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'khalaq',
        meaning: 'He created',
        phoneticCue: 'Crisp Qaf release when pausing.'
      },
      {
        surahNumber: 111,
        ayahNumber: 1,
        arabicWord: 'وَتَبَّ',
        contextPhrase: 'تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ',
        transliteration: 'watabb',
        meaning: 'and he perished',
        phoneticCue: 'Qalqalah Akbar: Hold the doubled Ba momentarily, then release with maximum resonant bounce.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb as-Sifāt, Bayt 27',
      quoteArabic: 'قَلْقَلَةٌ قُطْبُ جَدٍّ وَاللِّينُ * وَاوٌ وَيَاءٌ سَكَنَا وَانْفَتَحَا',
      quoteEnglish: 'Qalqalah letters are Qutbu Jadd; and Leen are Waw and Ya that have sukoon preceded by fathah.'
    },
    detectionReliability: 'moderate',
    practiceInstructions: 'Do NOT allow a pseudo-vowel sound to attach to the bounce (e.g. do not say "ahada-a" or "ahadi"). The bounce must be neutral and sharp.'
  },

  // 6. TAFKHIM & TARQIQ (Heavy vs Light letters)
  {
    id: 'tafkhim_isti’la',
    subject: 'tafkhim_tarqiq',
    nameArabic: 'تفخيم حروف الاستعلاء',
    nameEnglish: 'Heaviness of Isti‘la Letters (Tafkhim)',
    nameTransliteration: 'Tafkhīm Ḥurūf al-Isti‘lā’',
    description: 'The seven letters of Isti‘la: "خُصَّ ضَغْطٍ قِظْ" (Kha, Sad, Dhad, Ghayn, Ta, Qaf, Zha) are ALWAYS pronounced with a full, heavy, reverberant mouth resonance (Tafkhim) regardless of their vowels, with Sad, Dhad, Ta, and Zha having extra elevation (Itbaq).',
    conditions: [
      'Letters: خ ص ض غ ط ق ظ',
      'Highest rank: with Fathah followed by Alif',
      'Second rank: with Fathah without Alif',
      'Third rank: with Dammah',
      'Fourth rank: with Sukoon',
      'Fifth rank: with Kasrah'
    ],
    letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'],
    colorCode: '#047857', // Deep Green
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 6,
        arabicWord: 'ٱلصِّرَٰطَ',
        contextPhrase: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
        transliteration: 'aṣ-ṣirāṭal-mustaqīm',
        meaning: 'the straight path',
        phoneticCue: 'Sad (ص) and Ta (ط) are heavy and elevated; contrast with the light Sin (س) and Ta (ت) in "ٱلْمُسْتَقِيمَ".'
      },
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'ٱلْمَغْضُوبِ',
        contextPhrase: 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ',
        transliteration: 'ghayril-maghḍūbi',
        meaning: 'those who evoked anger',
        phoneticCue: 'Ghayn (غ) and Dhad (ض) must maintain heavy resonance; do not pronounce Ghayn lightly like French \'r\'.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb at-Tajwīd, Bayt 35',
      quoteArabic: 'وَحَرْفَ الاسْتِعْلاَءِ فَخِّمْ وَاخْصُصَا * الاِطْبَاقَ أَقْوَى نَحْوُ قَالَ وَالْعَصَا',
      quoteEnglish: 'Make the letter of Isti\'la heavy, and give Itbaq extra strength, as in Qala and Al-\'Asa.'
    },
    detectionReliability: 'moderate',
    practiceInstructions: 'Elevate the back of the tongue towards the soft palate and round the acoustic resonance chamber inside the mouth without pursing the lips.'
  },

  // 7. RULES OF LAM AND RA
  {
    id: 'lam_jalalah_tafkhim',
    subject: 'lam_ra',
    nameArabic: 'أحكام لام لفظ الجلالة',
    nameEnglish: 'Rules of Lam in the Name of Allah',
    nameTransliteration: 'Aḥkām Lām Lafẓ al-Jalālah',
    description: 'The Lam (ل) in "اللَّه" and "اللَّهُمَّ" is pronounced heavy (Tafkhim) when preceded by a Fathah or Dammah. It is pronounced light (Tarqiq) when preceded by a Kasrah.',
    conditions: [
      'Lam in the word "ٱللَّه" (Allah)',
      'Tafkhim if preceded by Fathah or Dammah (e.g. هُوَ ٱللَّهُ, نَصْرُ ٱللَّهِ)',
      'Tarqiq if preceded by Kasrah (e.g. بِسْمِ ٱللَّهِ, لِلَّهِ)'
    ],
    letters: ['ل'],
    colorCode: '#b45309', // Antique Gold
    examples: [
      {
        surahNumber: 112,
        ayahNumber: 1,
        arabicWord: 'قُلْ هُوَ ٱللَّهُ',
        contextPhrase: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
        transliteration: 'Qul huwa-Llāh',
        meaning: 'Say He is Allah',
        phoneticCue: 'Preceded by Fathah on Waw: Lam is deep, full and heavy (Tafkhim).'
      },
      {
        surahNumber: 1,
        ayahNumber: 1,
        arabicWord: 'بِسْمِ ٱللَّهِ',
        contextPhrase: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        transliteration: 'Bismi-Llāh',
        meaning: 'In the name of Allah',
        phoneticCue: 'Preceded by Kasrah on Meem: Lam is light, thin, and smiling (Tarqiq).'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb ar-Rā’āt wa al-Lāmāt, Bayt 44',
      quoteArabic: 'وَفَخِّمِ اللاَّمَ مِنِ اسْمِ اللَّهِ * عَنْ فَتْحٍ اوْ ضَمٍّ كَعَبْدُ اللَّهِ',
      quoteEnglish: 'Pronounce the Lam in the name of Allah heavy after a Fathah or Dammah, as in \'Abdullah.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Compare "Bismi-Llah" (light) with "Huwa-Llah" (heavy). Never make the Ba in "Bismillah" heavy.'
  },
  {
    id: 'ra_tafkhim_tarqiq',
    subject: 'lam_ra',
    nameArabic: 'أحكام الراء تفخيماً وترقيقاً',
    nameEnglish: 'Rules of Ra (Tafkhim & Tarqiq)',
    nameTransliteration: 'Aḥkām ar-Rā’',
    description: 'Ra (ر) has eight cases of Tafkhim (e.g. with Fathah, Dammah, or Sukoon preceded by Fathah/Dammah) and four cases of Tarqiq (e.g. with Kasrah, or Sukoon preceded by original Kasrah without Isti\'la following).',
    conditions: [
      'Tafkhim: Ra has Fathah/Dammah, or has Sukoon after Fathah/Dammah',
      'Tarqiq: Ra has Kasrah, or has Sukoon after original Kasrah within same word'
    ],
    letters: ['ر'],
    colorCode: '#059669', // Emerald
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 1,
        arabicWord: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        contextPhrase: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        transliteration: 'ar-Raḥmānir-Raḥīm',
        meaning: 'the Entirely Merciful, the Especially Merciful',
        phoneticCue: 'Both Ra letters carry Shaddah with Fathah: heavy Tafkhim without excessive rolling (Takrir).'
      },
      {
        surahNumber: 108,
        ayahNumber: 2,
        arabicWord: 'وَٱنْحَرْ',
        contextPhrase: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ',
        transliteration: 'wanḥar',
        meaning: 'and sacrifice',
        phoneticCue: 'Stopped upon Ra preceded by Fathah: pronounced heavy.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bayt 41',
      quoteArabic: 'وَرَقِّقِ الرَّاءَ إِذَا مَا كُسِرَتْ * كَذَاكَ بَعْدَ الْكَسْرِ حَيْثُ سَكَنَتْ',
      quoteEnglish: 'Make the Ra light whenever it has a Kasrah, and likewise when it has a Sukoon preceded by a Kasrah.'
    },
    detectionReliability: 'moderate',
    practiceInstructions: 'Avoid flapping the tongue repeatedly. Only one vibration is allowed; excessive fluttering (Takrir) is a common error.'
  },

  // 8. WAQF & IBTIDA'
  {
    id: 'waqf_ibtida_rules',
    subject: 'waqf_ibtida',
    nameArabic: 'أحكام الوقف والابتداء',
    nameEnglish: 'Rules of Stopping & Starting (Waqf & Ibtida\')',
    nameTransliteration: 'Aḥkām al-Waqf wa al-Ibtidā’',
    description: 'Cutting off sound at the end of a word for a breath with intent to resume. Categories: Tam (Complete), Kafi (Sufficient), Hasan (Good), Qabih (Reprehensible). Signs in Uthmani script: مـ (Compulsory stop), قلى (Stopping preferred), صلى (Continuing preferred), ج (Equal choice), لا (Do not stop).',
    conditions: [
      'Stop on the last letter of a word by turning its vowel into a Sukoon (except Tanween Fathah which becomes an Alif - Madd \'Iwad)',
      'Take a fresh breath'
    ],
    letters: ['مـ', 'قلى', 'صلى', 'ج', 'لا', '∴'],
    colorCode: '#475569', // Slate
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 2,
        arabicWord: 'ٱلْعَٰلَمِينَ',
        contextPhrase: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
        transliteration: 'al-‘ālamīn',
        meaning: 'the Lord of the worlds',
        phoneticCue: 'Sunnah stop at the end of the Ayah; turn final Fat-hah into a still Sukoon.'
      },
      {
        surahNumber: 100,
        ayahNumber: 1,
        arabicWord: 'ضَبْحًا',
        contextPhrase: 'وَٱلْعَٰدِيَٰتِ ضَبْحًا',
        transliteration: 'ḍabḥā',
        meaning: 'panting',
        phoneticCue: 'Madd ‘Iwaḍ: Tanween Fathah converts into a 2-count Alif elongation upon stopping.'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb al-Waqf, Bayt 47-49',
      quoteArabic: 'وَبَعْدَ تَجْوِيدِكَ لِلْحُرُوفِ * لاَبُدَّ مِنْ مَعْرِفَةِ الْوُقُوفِ / وَالاِبْتِدَاءِ وَهْيَ تُقْسَمُ إِذَنْ * ثَلاَثَةً: تَامٌ وَكَافٍ وَحَسَنْ',
      quoteEnglish: 'After your mastery of Tajweed of letters, you must learn the stops and starts, which are divided into: Tam, Kafi, and Hasan.'
    },
    detectionReliability: 'high',
    practiceInstructions: 'Always convert the final vowel to Sukoon when stopping. Never stop without breathing, as that constitutes Sakt (breathless pause).'
  },

  // 9. MAKHARIJ AL-HURUF
  {
    id: 'makharij_overview',
    subject: 'makharij',
    nameArabic: 'مخارج الحروف السبعة عشر',
    nameEnglish: 'The 17 Points of Articulation',
    nameTransliteration: 'Makhārij al-Ḥurūf',
    description: 'The seventeen specific articulation points divided across five general areas according to Ibn al-Jazari and Khalil ibn Ahmad: 1) Al-Jawf (Oral and throat cavity), 2) Al-Halq (Throat), 3) Al-Lisan (Tongue), 4) Ash-Shafatayn (Two lips), 5) Al-Khayshum (Nasal cavity).',
    conditions: [
      'Applicable to all 28 Arabic letters in all phonetic configurations'
    ],
    letters: ['All Arabic letters'],
    colorCode: '#065f46',
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 6,
        arabicWord: 'ٱهْدِنَا',
        contextPhrase: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
        transliteration: 'ihdinā',
        meaning: 'Guide us to',
        phoneticCue: 'Ha (هـ) originates from Aqsal-Halq (deepest throat near vocal cords).'
      },
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'أَنْعَمْتَ',
        contextPhrase: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ',
        transliteration: 'an‘amta',
        meaning: 'You have blessed',
        phoneticCue: 'Ayn (ع) originates from Wasatul-Halq (middle throat near epiglottis).'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb Makhārij al-Ḥurūf, Bayt 9',
      quoteArabic: 'مَخَارِجُ الحُرُوفِ سَبْعَةَ عَشَرْ * عَلَى الَّذِي يَخْتَارُهُ مَنِ اخْتَبَرْ',
      quoteEnglish: 'The points of articulation are seventeen, according to the opinion chosen by the discerning scholars.'
    },
    detectionReliability: 'audio_limited_abstain',
    practiceInstructions: 'To discover the point of articulation of any letter, place a Hamzah with Kasrah before it and put Sukoon on the letter (e.g. "إِذْ", "إِقْ"). The point where the voice cuts off is its makhraj.'
  },

  // 10. SIFAT AL-HURUF
  {
    id: 'sifat_overview',
    subject: 'sifat',
    nameArabic: 'صفات الحروف (الذاتية والعارضة)',
    nameEnglish: 'Characteristics of Letters (Sifat)',
    nameTransliteration: 'Ṣifāt al-Ḥurūf',
    description: 'The intrinsic characteristics that give each letter its distinct voice: Sifat with opposites (Hams vs Jahr, Shiddah vs Rakhawah vs Tawassut, Isti\'la vs Istifal, Itbaq vs Infitah, Idhlaq vs Ismat) and Sifat without opposites (Safir, Qalqalah, Leen, Inhiraf, Takrir, Tafashshi, Istitālah, Ghunnah).',
    conditions: [
      'Intrinsic to every letter'
    ],
    letters: ['All Arabic letters'],
    colorCode: '#047857',
    examples: [
      {
        surahNumber: 1,
        ayahNumber: 6,
        arabicWord: 'ٱلْمُسْتَقِيمَ',
        contextPhrase: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
        transliteration: 'al-mustaqīm',
        meaning: 'the straight',
        phoneticCue: 'Sin (س) features Hams (running of breath) and Safir (whistle).'
      },
      {
        surahNumber: 1,
        ayahNumber: 7,
        arabicWord: 'ٱلضَّآلِّينَ',
        contextPhrase: 'وَلَا ٱلضَّآلِّينَ',
        transliteration: 'wa-laḍ-ḍāllīn',
        meaning: 'nor of those who are astray',
        phoneticCue: 'Dhad (ض) uniquely features Istitālah (prolongation of sound along edge of tongue).'
      }
    ],
    exceptions: [],
    classicalReference: {
      work: 'Al-Muqaddimah al-Jazariyyah',
      author: 'Imām Ibn al-Jazari',
      verseOrChapter: 'Bāb aṣ-Ṣifāt, Bayt 20',
      quoteArabic: 'صِفَاتُهَا جَهْرٌ وَرِخْوٌ مُسْتَفِلْ * مُنْفَتِحٌ مُصْمَتَةٌ وَالضِّدَّ قُلْ',
      quoteEnglish: 'Its characteristics are: Jahr, Rikhw, Mustafil, Munfatih, Musmatah; and state their opposites.'
    },
    detectionReliability: 'audio_limited_abstain',
    practiceInstructions: 'Never invent an error regarding micro-sifat without teacher Talaqqi. Physical observation of tongue curvature is essential for definitive judgement.'
  }
];

export function getRuleById(id: string): TajweedRule | undefined {
  return TAJWEED_KNOWLEDGE_BASE.find(r => r.id === id);
}

export function getRulesBySubject(subject: string): TajweedRule[] {
  return TAJWEED_KNOWLEDGE_BASE.filter(r => r.subject === subject);
}
