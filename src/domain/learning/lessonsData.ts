/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tajweed Progressive Curriculum & Guided Rule Practice
 * Hafs 'an 'Asim Tradition
 */

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  classicalSource?: string;
}

export interface GuidedExercise {
  id: string;
  title: string;
  ruleId: string;
  surahNumber: number;
  ayahNumber: number;
  arabicPhrase: string;
  transliteration: string;
  instruction: string;
  targetFocus: string;
  audioReference?: string;
}

export interface TajweedLesson {
  id: string;
  moduleNumber: number;
  title: string;
  arabicTitle: string;
  summary: string;
  estimatedMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  contentMarkdown: string;
  keyRules: string[]; // Rule IDs
  audioDemonstration?: string;
  exercises: GuidedExercise[];
  quiz: LessonQuizQuestion[];
}

export const TAJWEED_LESSONS: TajweedLesson[] = [
  {
    id: 'lesson-1-makharij',
    moduleNumber: 1,
    title: 'The Articulation Points (Makhārij al-Ḥurūf)',
    arabicTitle: 'مخارج الحروف',
    summary: 'Discover where each Arabic letter originates within the vocal tract according to the 17 points identified by Imam Ibn al-Jazari.',
    estimatedMinutes: 12,
    level: 'beginner',
    contentMarkdown: `
### Where Letters Are Born

In the Islamic science of Tajweed, **Makhraj** (plural: *Makhārij*) literally means "the point of exit." It represents the exact physical anatomical position where an Arabic letter is formed and sound is created.

Imam Shams ad-Din Ibn al-Jazari (d. 833 AH) established in his celebrated poem *Al-Muqaddimah al-Jazariyyah*:

> *مَخَارِجُ الحُرُوفِ سَبْعَةَ عَشَرْ * عَلَى الَّذِي يَخْتَارُهُ مَنِ اخْتَبَرْ*  
> *"The points of articulation are seventeen, according to the choice of the discerning scholars."*

#### The Five Major Anatomical Regions:
1. **Al-Jawf (الجَوْف - The Oral and Throat Cavity):** The open acoustic space of the throat and mouth from which the three Madd elongation letters emerge (Alif, Waw, Ya).
2. **Al-Halq (الحَلْق - The Throat):** Divided into deepest (Hamzah, Ha), middle (Ayn, Ha), and closest (Ghayn, Kha).
3. **Al-Lisān (اللِّسَان - The Tongue):** The richest articulation zone, housing 10 distinct points producing 18 letters (including Qaf, Kaf, Jim, Shin, Ya, Dhad, Lam, Nun, Ra, Ta, Dal, Ta, Za, Sin, Sad, Dha, Dhal, Tha).
4. **Ash-Shafatayn (الشَّفَتَان - The Two Lips):** Producing Fa, Waw (non-madd), Ba, and Meem.
5. **Al-Khayshūm (الخَيْشُوم - The Nasal Cavity):** The sole source of Ghunnah (nasal resonance).

#### How to Locate Any Letter's Makhraj:
Pronounce a Hamzah with a Kasrah followed by the letter in a state of Sukoon (quiescence), e.g. **إِقْ** (iq), **إِعْ** (i‘), **إِذْ** (idh). The exact spot where airflow or acoustic pressure stops is that letter's true makhraj!
    `,
    keyRules: ['makharij_overview', 'tafkhim_isti’la'],
    exercises: [
      {
        id: 'ex-1-halq',
        title: 'Middle Throat Contrast (Ayn vs Ha)',
        ruleId: 'makharij_overview',
        surahNumber: 1,
        ayahNumber: 2,
        arabicPhrase: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
        transliteration: 'Al-ḥamdu li-Llāhi Rabbil-‘ālamīn',
        instruction: 'Contract the middle throat (epiglottis area) clearly on both the unconstricted Ha (ح) in "Al-Hamdu" and the deep Ayn (ع) in "al-‘Alamin".',
        targetFocus: 'Middle Throat (Wasatul-Halq) purity without scratching or coughing'
      }
    ],
    quiz: [
      {
        id: 'q1-1',
        question: 'According to Imam Ibn al-Jazari, how many specific articulation points exist?',
        options: ['14 points', '16 points', '17 points', '28 points'],
        correctOptionIndex: 2,
        explanation: 'Imam Ibn al-Jazari and Al-Khalil ibn Ahmad adopted the position that there are 17 specific makharij distributed across 5 general areas.',
        classicalSource: 'Al-Muqaddimah al-Jazariyyah, Bayt 9'
      },
      {
        id: 'q1-2',
        question: 'Which anatomical region is solely responsible for producing Ghunnah?',
        options: ['Al-Jawf (The chest cavity)', 'Al-Halq (The throat)', 'Al-Khayshum (The nasal cavity)', 'Ash-Shafatayn (The lips)'],
        correctOptionIndex: 2,
        explanation: 'Al-Khayshum is the nasal passage located behind the nose, which is the exclusive makhraj of the Ghunnah.',
        classicalSource: 'Al-Muqaddimah al-Jazariyyah, Bayt 33'
      }
    ]
  },
  {
    id: 'lesson-2-noon-sakinah',
    moduleNumber: 2,
    title: 'The Four Rules of Noon Sākinah & Tanween',
    arabicTitle: 'أحكام النون الساكنة والتنوين',
    summary: 'Master the four canonical rules: Idh-har (manifestation), Idgham (assimilation), Iqlab (conversion), and Ikhfa (concealment).',
    estimatedMinutes: 15,
    level: 'beginner',
    contentMarkdown: `
### The Foundation of Tajweed Mastery

Noon Sakinah (نْ) is a non-voweled Noon that remains constant in pronunciation and writing. Tanween (ـً ـٍ ـٌ) is an extra Noon Sakinah sound added to the end of nouns when continuing speech.

Imam Sulayman al-Jamzuri begins *Tuhfat al-Atfal*:

> *لِلنُّونِ إِنْ تَسْكُنْ وَلِلتَّنْوِينِ * أَرْبَعُ أَحْكَامٍ فَخُذْ تَبْيِينِي*  
> *"For the Noon when quiescent and for the Tanween, there are four rulings, so take my explanation."*

#### 1. Al-Idh-hār al-Ḥalqī (الإظهار الحلقي)
- **Meaning:** Manifesting the Noon clearly from its tongue makhraj without extra Ghunnah.
- **Trigger:** Six throat letters: **ء ه ع ح غ خ**.
- **Example:** \`مِنْ خَوْفٍ\` (min khawf), \`وَٱنْحَرْ\` (wanhar).

#### 2. Al-Idghām (الإدغام)
- **Meaning:** Merging the Noon into the subsequent letter.
- **Letters:** Grouped in \`يَرْمَلُونَ\` (Yarmalun).
- **Sub-divisions:**
  - **With Ghunnah (2 counts):** \`يَنْمُو\` (Ya, Noon, Meem, Waw), e.g. \`مَن يَقُولُ\`.
  - **Without Ghunnah (complete merger):** \`ل ر\` (Lam, Ra), e.g. \`مِن رَّبِّهِمْ\`.

#### 3. Al-Iqlāb (الإقلاب)
- **Meaning:** Transforming the Noon/Tanween into a concealed Meem with Ghunnah (2 counts).
- **Trigger:** When followed by the letter Ba (**ب**).
- **Example:** \`مِنۢ بَعْدِ\` (mim-ba‘d). Marked with a tiny Meem (\`ۢ\`) in the Mushaf.

#### 4. Al-Ikhfā’ al-Ḥaqīqī (الإخفاء الحقيقي)
- **Meaning:** Concealing the sound between manifestation and merger with 2-count nasalization.
- **Trigger:** The remaining 15 letters codified in the famous line: *Sif dha thana kam jada shakhsun qad sama...*
- **Acoustic Note:** The Ghunnah becomes **heavy** if followed by a heavy letter (Sad, Dhad, Ta, Zha, Qaf) and **light** if followed by a light letter!
    `,
    keyRules: ['noon_idhhar_halqi', 'noon_idgham_ghunnah', 'noon_idgham_bila_ghunnah', 'noon_iqlab', 'noon_ikhfa_haqiqi'],
    exercises: [
      {
        id: 'ex-2-ikhfa',
        title: 'Ikhfa Haqiqi in Surah Al-Falaq',
        ruleId: 'noon_ikhfa_haqiqi',
        surahNumber: 113,
        ayahNumber: 2,
        arabicPhrase: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'Min sharri mā khalaq',
        instruction: 'Do not press your tongue against the gums on "Min". Hover your tongue near the Shin (ش) while sustaining a soft 2-count nasal resonance.',
        targetFocus: 'Hovering tongue position without touching upper teeth or palate'
      },
      {
        id: 'ex-2-idgham-bila',
        title: 'Complete Idgham in Surah Al-Ikhlas',
        ruleId: 'noon_idgham_bila_ghunnah',
        surahNumber: 112,
        ayahNumber: 4,
        arabicPhrase: 'وَلَمْ يَكُن لَّهُۥ',
        transliteration: 'Wa lam yakul-lahū',
        instruction: 'Drop the Noon completely. Merge into the Lam: "yakul-lahu" with zero nasal resonance.',
        targetFocus: 'Crisp complete merger into Lam without lingering nose hum'
      }
    ],
    quiz: [
      {
        id: 'q2-1',
        question: 'Which of the following letters causes Idgham without Ghunnah?',
        options: ['Meem and Noon', 'Waw and Ya', 'Lam and Ra', 'Hamzah and Ha'],
        correctOptionIndex: 2,
        explanation: 'Lam (ل) and Ra (ر) cause complete Idgham without Ghunnah (Idgham bi-Ghayri Ghunnah).',
        classicalSource: 'Tuhfat al-Atfal, Bayt 12'
      },
      {
        id: 'q2-2',
        question: 'What happens to the Ghunnah of Ikhfa when followed by the letter Qaf (ق)?',
        options: ['It is omitted completely', 'It is pronounced heavy (Tafkhim)', 'It is pronounced light (Tarqiq)', 'It changes to a Meem'],
        correctOptionIndex: 1,
        explanation: 'The Ghunnah of Ikhfa follows the subsequent letter in heaviness. Since Qaf is a letter of Isti\'la, the Ghunnah must be pronounced heavy (Tafkhim).',
        classicalSource: 'Al-Muqaddimah al-Jazariyyah'
      }
    ]
  },
  {
    id: 'lesson-3-qalqalah',
    moduleNumber: 3,
    title: 'Qalqalah: The Echoing Resonance',
    arabicTitle: 'أحكام القلقلة ومراتبها',
    summary: 'Learn how to produce the crisp, unvoweled acoustic bounce on the five letters of Qutbu Jadd (ق ط ب ج د).',
    estimatedMinutes: 10,
    level: 'beginner',
    contentMarkdown: `
### What is Qalqalah?

**Qalqalah** linguistically means shaking, disturbance, or vibration. In Tajweed terminology, it refers to the vibration or echoing release produced at the articulation point when pronouncing one of its five letters in a state of **Sukoon** (quiescence), such that a strong tone is clearly heard without blending into a vowel.

The five letters are gathered in the mnemonic:
> **قُطْبُ جَدٍّ** (Qaf, Ta, Ba, Jeem, Dal)

#### The Three Degrees of Qalqalah:
1. **Qalqalah Sughrā (Minor):** When the letter occurs in the middle of a word or connected continuous recitation, e.g. \`يَلِدْ وَلَمْ\` or \`ٱلْأَبْتَرُ\`. The bounce is quick and subtle.
2. **Qalqalah Kubrā (Major):** When pausing upon an un-doubled letter at the end of a word or Ayah, e.g. \`قُلْ هُوَ ٱللَّهُ أَحَدٌ\` or \`ٱلْفَلَقِ\`. The bounce is clear and prominent.
3. **Qalqalah Akbar (Greatest):** When pausing upon a doubled letter with Shaddah, e.g. \`تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ\`. The letter is held under tension momentarily before a resonant release.

#### Essential Caution:
A frequent error among learners is adding a faint vowel (Fathah or Kasrah) to the end of the bounce, saying *"Ahad-a"* instead of a clean, neutral acoustic bounce. The bounce must be pure and free of all three short vowels!
    `,
    keyRules: ['qalqalah_rules'],
    exercises: [
      {
        id: 'ex-3-ikhlas',
        title: 'Qalqalah Kubra in Surah Al-Ikhlas',
        ruleId: 'qalqalah_rules',
        surahNumber: 112,
        ayahNumber: 1,
        arabicPhrase: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
        transliteration: 'Qul Huwa-Llāhu Aḥad',
        instruction: 'Pause on the Dal of "Ahad". Release the tongue tip with a crisp, neutral bounce. Do not say "Ahad-a" or "Ahad-eh".',
        targetFocus: 'Neutral acoustic bounce on Dal without vowel contamination'
      }
    ],
    quiz: [
      {
        id: 'q3-1',
        question: 'Which of the following is NOT one of the letters of Qalqalah?',
        options: ['Qaf (ق)', 'Kaf (ك)', 'Jeem (ج)', 'Ta (ط)'],
        correctOptionIndex: 1,
        explanation: 'Kaf (ك) has Hams (running of breath), NOT Qalqalah. The five Qalqalah letters are Qaf, Ta, Ba, Jeem, Dal (قطب جد).',
        classicalSource: 'Al-Muqaddimah al-Jazariyyah, Bayt 27'
      }
    ]
  },
  {
    id: 'lesson-4-madd',
    moduleNumber: 4,
    title: 'The Architecture of Madd (Elongation)',
    arabicTitle: 'أحكام المد وأقسامه',
    summary: 'Understand the precise timing of Madd from the natural 2 counts up to the compulsory 6 counts.',
    estimatedMinutes: 14,
    level: 'intermediate',
    contentMarkdown: `
### Understanding Harakat & Timing

**Madd** literally means lengthening or stretching. In recitation, it is the lengthening of the sound when uttering one of the three letters of Madd:
- **Alif (ا)** preceded by a Fathah
- **Waw (و)** with Sukoon preceded by a Dammah
- **Ya (ي)** with Sukoon preceded by a Kasrah

#### 1. Madd Ṭabī‘ī (Natural Elongation - 2 Harakat)
The baseline length of any vowel. Approximately 1 second at normal Tartil speed (equivalent to folding or unfolding a finger steadily). No hamzah or sukoon follows.

#### 2. Madd Far‘ī due to Hamzah:
- **Madd Wājib Muttaṣil (Obligatory Connected):** Madd letter + Hamzah in the **same word** (e.g. \`جَآءَ\`, \`ٱلسَّمَآءِ\`). Length: **4 or 5 counts** in Hafs 'an 'Asim.
- **Madd Jā’iz Munfaṣil (Permissible Separated):** Madd letter at end of word 1, Hamzah at start of word 2 (e.g. \`إِنَّآ أَعْطَيْنَٰكَ\`). Length: **4 or 5 counts** in the Shatibiyyah recitation.

#### 3. Madd Far‘ī due to Sukoon:
- **Madd ‘Āriḍ li-s-Sukūn (Presented Sukoon upon Stop):** Stopping at ayah ends (e.g. \`ٱلْعَٰلَمِينَ\`, \`ٱلرَّحِيمِ\`). Permissible lengths: **2, 4, or 6 counts**.
- **Madd Lāzim (Compulsory):** Original sukoon/shaddah in the same word (e.g. \`وَلَا ٱلضَّآلِّينَ\`). Strict **6 counts** without reduction!
    `,
    keyRules: ['madd_tabeei', 'madd_wajib_muttasil', 'madd_jaiz_munfasil', 'madd_arid_sukoon', 'madd_lazim'],
    exercises: [
      {
        id: 'ex-4-kawthar',
        title: 'Madd Munfasil in Surah Al-Kawthar',
        ruleId: 'madd_jaiz_munfasil',
        surahNumber: 108,
        ayahNumber: 1,
        arabicPhrase: 'إِنَّآ أَعْطَيْنَٰكَ',
        transliteration: 'Innā a‘ṭaynāka',
        instruction: 'Hold the Alif on "Innā" for 4 rhythmic beats before sounding the Hamzah on "a‘ṭaynāka".',
        targetFocus: 'Consistent 4-count elongation across word boundary'
      }
    ],
    quiz: [
      {
        id: 'q4-1',
        question: 'How many harakat (counts) must Madd Lazim be prolonged in Hafs ‘an ‘Asim?',
        options: ['2 counts', '4 counts', '5 counts', 'Strictly 6 counts'],
        correctOptionIndex: 3,
        explanation: 'Madd Lazim (Compulsory Elongation) is fixed at strictly 6 harakat in Hafs \'an \'Asim across all scholars of Qira\'at.',
        classicalSource: 'Tuhfat al-Atfal, Bayt 34'
      }
    ]
  }
];
