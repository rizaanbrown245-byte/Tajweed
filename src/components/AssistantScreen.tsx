/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Grounded Tajweed AI Assistant Screen
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  Bookmark, 
  RotateCcw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { askTajweedAssistant, ChatMessage } from '../domain/assistant/assistantClient';
import { TEACHER_DISCLAIMER } from '../domain/assessment/assessmentEngine';

interface AssistantScreenProps {
  initialPrompt?: string;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `As-salāmu ‘alaykum! I am your grounded **Tajweed Teaching Assistant** adhering strictly to the recitation tradition of **Hafs ‘an ‘Asim**.\n\nYou may ask me to explain any Tajweed rule, the articulation point (Makhraj) of letters, elongation timings (Madd), or citations from classical works such as *Tuḥfat al-Aṭfāl* and *Al-Muqaddimah al-Jazariyyah*.\n\n*Reminder: Automated feedback assists personal study and does not replace oral verification before a qualified teacher (Muqri').*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>(initialPrompt || '');
  const [depth, setDepth] = useState<'beginner' | 'advanced'>('beginner');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== inputText) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await askTajweedAssistant(text, messages, depth);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Error querying assistant:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I could not process this question reliably at this moment. Please repeat your query or consult a qualified Tajweed teacher.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAbstention: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts = [
    'What is the difference between Idgham with and without Ghunnah?',
    'What are the five letters of Qalqalah and how do they sound on Sukoon?',
    'How many counts is Madd Munfasil in Hafs ‘an ‘Asim?',
    'Explain the rules of Ra (Tafkhim vs Tarqiq) with examples',
    'What are the 17 articulation points according to Ibn al-Jazari?'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Grounded AI Teaching Assistant
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
              Ask About Tajweed Rules
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Explanations in simple English with Arabic terminology, classical citations, and safety abstentions for unverified questions.
            </p>
          </div>

          {/* Beginner vs Advanced Depth Toggle */}
          <div className="bg-emerald-900/80 border border-emerald-700/60 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
            <button
              onClick={() => setDepth('beginner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                depth === 'beginner'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Beginner Depth
            </button>
            <button
              onClick={() => setDepth('advanced')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                depth === 'advanced'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Advanced (Matn)
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 overflow-hidden flex flex-col h-[520px]">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    ت
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 leading-relaxed ${
                    isUser
                      ? 'bg-emerald-800 text-white rounded-br-none shadow-sm'
                      : msg.isAbstention
                      ? 'bg-amber-500/10 border border-amber-500/30 text-stone-900 rounded-bl-none'
                      : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-stone max-w-none text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {msg.classicalSourceCitation && (
                    <div className="pt-2 border-t border-stone-200/80 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>Grounded in: {msg.classicalSourceCitation}</span>
                    </div>
                  )}

                  <div className={`text-[10px] text-right ${isUser ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs animate-pulse">
                ت
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Consulting classical knowledge base...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters Carousel */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/70 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] font-bold text-stone-400 uppercase shrink-0">Try asking:</span>
          {starterPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 text-[11px] font-medium bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 px-3 py-1 rounded-full transition-colors truncate max-w-[260px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Text Input Box */}
        <div className="p-4 bg-white border-t border-stone-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about Tajweed rules or pronunciation..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none transition-all placeholder:text-stone-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-40 text-white shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
