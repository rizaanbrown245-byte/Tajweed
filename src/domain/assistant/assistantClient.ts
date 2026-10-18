/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Grounded Tajweed AI Assistant Client
 * Grounded exclusively in classical Tajweed knowledge base.
 */

import { TAJWEED_KNOWLEDGE_BASE } from '../tajweed/knowledgeBase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  citedRules?: string[]; // Rule IDs
  classicalSourceCitation?: string;
  isAbstention?: boolean;
}

export async function askTajweedAssistant(
  question: string,
  history: ChatMessage[] = [],
  depth: 'beginner' | 'advanced' = 'beginner'
): Promise<ChatMessage> {
  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        depth,
        history: history.slice(-6).map(h => ({
          role: h.sender === 'user' ? 'user' : 'model',
          text: h.text
        }))
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citedRules: data.citedRules || [],
        classicalSourceCitation: data.classicalCitation,
        isAbstention: data.isAbstention || false
      };
    }
  } catch (err) {
    console.warn('Network call to /api/assistant failed, falling back to local knowledge retrieval:', err);
  }

  // Local Offline Knowledge Base Fallback
  return generateOfflineKnowledgeReply(question, depth);
}

function generateOfflineKnowledgeReply(query: string, depth: 'beginner' | 'advanced'): ChatMessage {
  const lower = query.toLowerCase();

  // Search knowledge base
  const matchedRule = TAJWEED_KNOWLEDGE_BASE.find(rule => {
    return (
      lower.includes(rule.id) ||
      lower.includes(rule.nameEnglish.toLowerCase()) ||
      lower.includes(rule.nameTransliteration.toLowerCase()) ||
      lower.includes(rule.nameArabic) ||
      (lower.includes('noon') && rule.subject === 'noon_sakinah') ||
      (lower.includes('ghunnah') && rule.subject === 'ghunnah') ||
      (lower.includes('madd') && rule.subject === 'madd') ||
      (lower.includes('qalqalah') && rule.subject === 'qalqalah') ||
      (lower.includes('throat') && rule.id === 'noon_idhhar_halqi') ||
      (lower.includes('heavy') && rule.subject === 'tafkhim_tarqiq')
    );
  });

  if (matchedRule) {
    const quote = matchedRule.classicalReference.quoteArabic
      ? `\n\n**Classical Citation (${matchedRule.classicalReference.work}):**\n> "${matchedRule.classicalReference.quoteArabic}"\n> — *${matchedRule.classicalReference.author}*`
      : '';

    const examples = matchedRule.examples.length > 0
      ? `\n\n**Key Qur’anic Example:**\n- **${matchedRule.examples[0].arabicWord}** in ${matchedRule.examples[0].contextPhrase} (*${matchedRule.examples[0].transliteration}*)\n- *Practice tip:* ${matchedRule.examples[0].phoneticCue}`
      : '';

    const detail = depth === 'advanced'
      ? `\n\n**Conditions & Exceptions:**\n- ${matchedRule.conditions.join('\n- ')}\n${matchedRule.exceptions.length ? '- Exceptions: ' + matchedRule.exceptions.join('; ') : ''}`
      : '';

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `### ${matchedRule.nameEnglish} (${matchedRule.nameArabic})\n\n${matchedRule.description}${examples}${quote}${detail}\n\n*Note: Practice this with a qualified Tajweed teacher for physical articulation check.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citedRules: [matchedRule.id],
      classicalSourceCitation: matchedRule.classicalReference.work
    };
  }

  // Safety Abstention
  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: `I cannot find a verified ruling for this specific question in the Hafs 'an 'Asim Tajweed knowledge base.\n\nTo protect the integrity of Qur’anic recitation, I abstain from speculative answers. Please consult an authorized Qur’an teacher (Muqri') or refer directly to classical manuals such as *Tuhfat al-Atfal* or *Al-Muqaddimah al-Jazariyyah*.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isAbstention: true
  };
}
