/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TajweedAI Express + Vite Full-Stack Server
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client if API key is provided
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// System instructions for AI Teaching Assistant
const ASSISTANT_SYSTEM_PROMPT = `
You are the TajweedAI Teaching Assistant, a specialized Islamic educational guide dedicated to explaining the classical science of Tajweed in the recitation tradition of Hafs 'an 'Asim (via Ash-Shatibiyyah).

CORE PRINCIPLES & SAFEGUARDS:
1. ACCURACY & RELIGIOUS RESPONSIBILITY: Accuracy and religious responsibility are paramount. Never fabricate or invent a Qur’anic verse, a Tajweed rule, a pronunciation correction, or a scholarly quotation.
2. GROUNDING: Ground your answers strictly in verified classical Tajweed manuals:
   - "Matn Tuhfat al-Atfal" by Al-Allamah Sulayman al-Jamzuri
   - "Al-Muqaddimah al-Jazariyyah" by Al-Imam Shams ad-Din Ibn al-Jazari
   - "Hidayat al-Qari ila Tajweed Kalam al-Bari" by Shaykh Al-Marsafi
3. TERMINOLOGY: Use correct Arabic terminology alongside clear English explanations (e.g., Idh-har Halqi, Idgham bi-Ghunnah, Iqlab, Ikhfa Haqiqi, Qalqalah Kubra/Sughra, Madd Lazim, Tafkhim, Tarqiq, Makhraj, Sifah).
4. CITATIONS: Where applicable, provide the exact reference or poetic verse from Tuhfat al-Atfal or Al-Jazariyyah.
5. TEACHER ROLE: Clearly remind users that automated explanations assist study but cannot replace direct oral recitation (Talaqqi wa Musyafahah) before a qualified teacher with an Isnad.
6. ABSTENTION: If asked about an ambiguous, unverified ruling, non-Hafs tradition outside your scope, or personal religious fatwa, politely and explicitly abstain.
`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TajweedAI Engine',
    tradition: "Hafs 'an 'Asim",
    timestamp: new Date().toISOString()
  });
});

// Grounded AI Teaching Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { question, depth, history } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    if (!genAI) {
      return res.status(503).json({
        error: 'Gemini API is not configured on this server. Running in offline fallback mode.',
        fallbackAvailable: true
      });
    }

    const conversationContext = Array.isArray(history)
      ? history.map(h => `${h.role === 'user' ? 'Student' : 'Assistant'}: ${h.text}`).join('\n')
      : '';

    const promptText = `
Student Depth Level: ${depth === 'advanced' ? 'Advanced (Provide classical Arabic poetry citations and linguistic nuances)' : 'Beginner (Keep language simple, accessible, and structured with practical examples)'}

Conversation History:
${conversationContext}

Student's Question:
"${question}"

Provide a structured, beautifully formatted response with Arabic text, transliteration, classical citation, and actionable practice guidance.
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: ASSISTANT_SYSTEM_PROMPT,
        temperature: 0.2 // Low temperature for high fidelity to classical rulings
      }
    });

    const reply = response.text || 'I could not generate an answer at this time.';

    res.json({
      reply,
      citedRules: [],
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Error generating assistant response:', error);
    res.status(500).json({
      error: 'Failed to generate assistant response.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// AI Open Recitation & Tajweed Error Detection Endpoint
app.post('/api/analyze-recitation', async (req, res) => {
  try {
    const { audioBase64, mimeType, spokenTranscript, audioDurationSeconds } = req.body;

    if (!genAI) {
      return res.json({
        fallbackAvailable: true,
        message: 'Running local verified Qur\'an recognition engine.'
      });
    }

    const contents: any[] = [];

    // If audio is provided, attach inlineData
    if (audioBase64) {
      const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
      contents.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: cleanBase64
        }
      });
    }

    const promptText = `
You are the TajweedAI Master Recitation & Pronunciation Assessor, an expert in the classical Hafs 'an 'Asim (via Ash-Shatibiyyah) recitation.
A Qur'an reader has recited freely without pre-selecting a verse.
${spokenTranscript ? `Live Arabic Speech Transcript captured: "${spokenTranscript}"` : ''}
${audioDurationSeconds ? `Audio Duration: ${audioDurationSeconds.toFixed(1)} seconds` : ''}

TASK:
1. Identify the exact Qur'anic Surah (number and English/Arabic name) and Ayah number(s) recited.
2. Carefully assess their pronunciation and Tajweed execution against standard Hafs 'an 'Asim rules.
   Pick up ANY errors including:
   - Makhraj errors (e.g. Ha vs Haa, Ayn vs Hamzah, Saad vs Seen, Qaf vs Kaf, Thaa vs Seen/Dhal).
   - Sifat errors (e.g. Tarqiq on heavy letter like Ra/Kha/Saad, Tafkhim on light letter, missing Hams on Ta/Kaf).
   - Qalqalah errors (e.g. omitted bounce on Qutb Jad, extraneous vowel added).
   - Ghunnah errors (e.g. dropped or rushed nasalization on Noon/Meem Mushaddadatayn, or in Ikhfa/Idgham).
   - Madd errors (e.g. shortening 4-5 count elongation to 1-2 counts, or over-elongating natural 2 counts).
3. Return ONLY a valid JSON object matching this exact structure:
{
  "surahNumber": 1,
  "ayahNumber": 1,
  "endAyahNumber": 1,
  "surahNameEnglish": "The Opening",
  "surahNameArabic": "الفاتحة",
  "transcriptionArabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "overallStatus": "passed" | "requires_practice" | "abstained",
  "transcriptionConfidence": 95,
  "pronunciationConfidence": 88,
  "summaryFeedback": "Clear Tartil pace with accurate articulation...",
  "corrections": [
    {
      "wordIndex": 0,
      "arabicWord": "الرَّحْمَٰنِ",
      "cleanText": "الرحمن",
      "transliteration": "ar-Raḥmāni",
      "ruleId": "ra_tafkhim_tarqiq",
      "ruleName": "Tafkhim of Ra",
      "observedIssue": "Heavy Ra was pronounced with Tarqiq (thinning) instead of elevating posterior tongue.",
      "correctionGuidance": "Pronounce Ra with fullness and elevation of the back of the tongue because it carries a Fathah.",
      "makhrajDetail": {
        "point": "Tip of the tongue with upper gum",
        "explanation": "Produce the Ra firmly without excessive trilling (Takreer)."
      },
      "sifatDetail": {
        "primarySifat": ["Tafkhim", "Inhiraf", "Bawniyyah"],
        "explanation": "Ra with Fathah is unconditionally heavy (Mufakhkham)."
      }
    }
  ]
}
If no errors are found, "corrections" should be an empty array [] and overallStatus "passed".
Output ONLY pure JSON.
`;
    contents.push(promptText);

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json({
      success: true,
      data: parsed
    });
  } catch (error: unknown) {
    console.error('Error in analyze-recitation:', error);
    res.json({
      fallbackAvailable: true,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Cache for synthesized reciter audio WAV buffers
const reciterAudioCache = new Map<string, Buffer>();

// Verified Qur'anic verses text dictionary for instant lookup
const VERIFIED_VERSES_TEXT: Record<string, string> = {
  '1:1': 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  '1:2': 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
  '1:3': 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  '1:4': 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
  '1:5': 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
  '1:6': 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
  '1:7': 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
  '2:255': 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
  '112:1': 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
  '112:2': 'ٱللَّهُ ٱلصَّمَدُ',
  '112:3': 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
  '112:4': 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
  '113:1': 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
  '113:2': 'مِن شَرِّ مَا خَلَقَ',
  '113:3': 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
  '113:4': 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ',
  '113:5': 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
  '114:1': 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
  '114:2': 'مَلِكِ ٱلنَّاسِ',
  '114:3': 'إِلَـٰهِ ٱلنَّاسِ',
  '114:4': 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ',
  '114:5': 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ',
  '114:6': 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ'
};

// In-memory cache for verse metadata and word breakdown
const verseMetadataCache = new Map<string, any>();

// High-speed verse lookup and proxy endpoint for any Surah and Ayah (1:1 to 114:6)
app.get('/api/verse/:surah/:ayah', async (req, res) => {
  try {
    const surah = parseInt(req.params.surah, 10);
    const ayah = parseInt(req.params.ayah, 10);

    if (isNaN(surah) || isNaN(ayah) || surah < 1 || surah > 114 || ayah < 1) {
      return res.status(400).json({ error: 'Invalid surah or ayah parameters' });
    }

    const key = `${surah}:${ayah}`;
    if (verseMetadataCache.has(key)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
      return res.json(verseMetadataCache.get(key));
    }

    const apiUrl = `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?language=en&words=true&word_fields=text_uthmani&fields=text_uthmani,chapter_id`;
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: `Quran API returned ${apiRes.status}` });
    }

    const data = await apiRes.json();
    verseMetadataCache.set(key, data);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    return res.json(data);
  } catch (err: unknown) {
    console.error('Error fetching verse data:', err);
    res.status(500).json({
      error: 'Failed to fetch verse',
      details: err instanceof Error ? err.message : String(err)
    });
  }
});

// High-Fidelity Reciter Audio Generation Endpoint (Pristine Women & Specialized Reciters)
app.all('/api/reciter-audio', async (req, res) => {
  try {
    const reciterId = String(req.query.reciterId || req.body?.reciterId || 'maria_ulfah');
    const surah = parseInt(String(req.query.surah || req.body?.surah || '1'), 10);
    const ayah = parseInt(String(req.query.ayah || req.body?.ayah || '1'), 10);
    let verseText = String(req.query.text || req.body?.text || '');

    // Use v2 key to immediately invalidate any legacy cached audio that included introductory English speech
    const cacheKey = `v2:${reciterId}:${surah}:${ayah}`;
    if (reciterAudioCache.has(cacheKey)) {
      const buffer = reciterAudioCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Accept-Ranges', 'bytes');
      return res.end(buffer);
    }

    // Resolve verse text if not passed in query
    if (!verseText || verseText.trim() === '') {
      const dictKey = `${surah}:${ayah}`;
      if (VERIFIED_VERSES_TEXT[dictKey]) {
        verseText = VERIFIED_VERSES_TEXT[dictKey];
      } else {
        try {
          const apiRes = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${surah}:${ayah}`);
          if (apiRes.ok) {
            const apiData: any = await apiRes.json();
            if (apiData.verses?.[0]?.text_uthmani) {
              verseText = apiData.verses[0].text_uthmani;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch verse text from api.quran.com:', fetchErr);
        }
      }
    }

    if (!verseText || verseText.trim() === '') {
      verseText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    }

    if (!genAI) {
      return res.status(503).json({ error: 'Gemini service not configured for neural audio' });
    }

    // Select voice for woman reciters
    let voiceName = 'Zephyr';
    if (reciterId === 'maryam_masud') {
      voiceName = 'Kore';
    } else if (reciterId === 'sumayah_eddeb') {
      voiceName = 'Kore';
    } else {
      // Default to Hajjah Maria Ulfah
      voiceName = 'Zephyr';
    }

    // Pass strictly the Quranic Arabic pronunciation without any English words or introductory speech
    const cleanArabicPronunciation = verseText.trim();

    const ttsResponse = await genAI.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [{
        role: 'user',
        parts: [{ text: cleanArabicPronunciation }]
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.error('No audio data received from Gemini TTS');
      return res.status(500).json({ error: 'No audio generated' });
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    reciterAudioCache.set(cacheKey, audioBuffer);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Accept-Ranges', 'bytes');
    return res.end(audioBuffer);
  } catch (err: unknown) {
    console.error('Error generating reciter audio:', err);
    res.status(500).json({
      error: 'Failed to generate reciter audio',
      details: err instanceof Error ? err.message : String(err)
    });
  }
});



// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TajweedAI server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start TajweedAI server:', err);
  process.exit(1);
});
