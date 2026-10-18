/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tajweed Knowledge Base & Classical Rules Library
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { TAJWEED_KNOWLEDGE_BASE } from '../domain/tajweed/knowledgeBase';
import { TajweedRule, TajweedSubject } from '../domain/tajweed/types';

interface RulesKnowledgeScreenProps {
  onPracticeRule?: (surah: number, ayah: number) => void;
  onAskAssistant?: (query: string) => void;
  initialRuleId?: string;
}

export const RulesKnowledgeScreen: React.FC<RulesKnowledgeScreenProps> = ({
  onPracticeRule,
  onAskAssistant,
  initialRuleId
}) => {
  const [selectedSubject, setSelectedSubject] = useState<TajweedSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRuleId, setActiveRuleId] = useState<string | null>(initialRuleId || null);

  useEffect(() => {
    if (initialRuleId) {
      setActiveRuleId(initialRuleId);
      const rule = TAJWEED_KNOWLEDGE_BASE.find(r => r.id === initialRuleId);
      if (rule && selectedSubject !== 'all' && rule.subject !== selectedSubject) {
        setSelectedSubject('all');
      }
    }
  }, [initialRuleId]);

  const subjects: { id: TajweedSubject | 'all'; label: string }[] = [
    { id: 'all', label: 'All Subjects (10)' },
    { id: 'noon_sakinah', label: 'Noon Sakinah & Tanween' },
    { id: 'meem_sakinah', label: 'Meem Sakinah' },
    { id: 'ghunnah', label: 'Ghunnah Levels' },
    { id: 'madd', label: 'Madd Categories' },
    { id: 'qalqalah', label: 'Qalqalah Degrees' },
    { id: 'tafkhim_tarqiq', label: 'Tafkhim & Tarqiq' },
    { id: 'lam_ra', label: 'Lam & Ra Rules' },
    { id: 'waqf_ibtida', label: 'Waqf & Ibtida\'' },
    { id: 'makharij', label: 'Makharij (Points of Exit)' },
    { id: 'sifat', label: 'Sifat (Characteristics)' }
  ];

  const filteredRules = TAJWEED_KNOWLEDGE_BASE.filter(rule => {
    const matchesSubject = selectedSubject === 'all' || rule.subject === selectedSubject;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      rule.nameEnglish.toLowerCase().includes(q) ||
      rule.nameArabic.includes(q) ||
      rule.nameTransliteration.toLowerCase().includes(q) ||
      rule.description.toLowerCase().includes(q) ||
      rule.letters.some(l => l.includes(q));
    return matchesSubject && matchesSearch;
  });

  const activeRule: TajweedRule | undefined = 
    activeRuleId ? TAJWEED_KNOWLEDGE_BASE.find(r => r.id === activeRuleId) : filteredRules[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Title & Introduction Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Verified Classical Knowledge Base (Hafs ‘an ‘Asim)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            The Canonical Rules of Tajweed
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Strictly referenced against <span className="font-semibold text-amber-300">Tuhfat al-Atfal</span> by Imam al-Jamzuri and <span className="font-semibold text-amber-300">Al-Muqaddimah al-Jazariyyah</span> by Imam Ibn al-Jazari. Each rule specifies documented conditions, exceptions, and acoustic reliability limits.
          </p>
        </div>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-4 space-y-3">
        
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules, Arabic terms, or letters (e.g. Qalqalah, Idgham, غنة, قطب جد)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Scrollable Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSubject === sub.id
                  ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-amber-400/40'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

      </div>

      {/* Main Content Layout: Rule List & Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Rule Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            Rules Catalog ({filteredRules.length})
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredRules.map(rule => {
              const isActive = activeRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setActiveRuleId(rule.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-800 bg-emerald-50/70 ring-2 ring-emerald-700/20 shadow-sm'
                      : 'border-stone-200/80 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {rule.subject.replace(/_/g, ' ')}
                    </span>
                    <span className="font-arabic text-lg text-emerald-950 font-bold">
                      {rule.nameArabic}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mb-1">
                    {rule.nameEnglish}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    <span className="truncate max-w-[180px]">
                      {rule.classicalReference.work}
                    </span>
                    <span className={`font-semibold ${
                      rule.detectionReliability === 'high'
                        ? 'text-emerald-700'
                        : rule.detectionReliability === 'moderate'
                        ? 'text-amber-700'
                        : 'text-stone-500'
                    }`}>
                      {rule.detectionReliability === 'high' ? 'High Acoustic Reliability' : rule.detectionReliability === 'moderate' ? 'Moderate Reliability' : 'Teacher Talaqqi Required'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Rule View with Classical Verse & Exercises */}
        <div className="lg:col-span-7">
          {activeRule ? (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="border-b border-stone-100 pb-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                    {activeRule.nameTransliteration}
                  </span>
                  <span className="font-arabic text-2xl font-bold text-emerald-950">
                    {activeRule.nameArabic}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  {activeRule.nameEnglish}
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-2">
                  {activeRule.description}
                </p>
              </div>

              {/* Classical Scholarly Citation (Poetry box) */}
              <div className="bg-stone-900 text-[#fcfaf6] rounded-2xl p-5 border border-amber-500/40 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    Classical Matn: {activeRule.classicalReference.work}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {activeRule.classicalReference.author}
                  </span>
                </div>

                {activeRule.classicalReference.quoteArabic && (
                  <div className="font-quran text-lg sm:text-xl text-amber-200 leading-relaxed text-center py-2" dir="rtl">
                    {activeRule.classicalReference.quoteArabic}
                  </div>
                )}

                {activeRule.classicalReference.quoteEnglish && (
                  <div className="text-xs text-stone-300 italic border-t border-stone-800 pt-2 font-sans">
                    "{activeRule.classicalReference.quoteEnglish}"
                  </div>
                )}
              </div>

              {/* Conditions & Letters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Conditions */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Required Conditions
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-600 list-disc list-inside">
                    {activeRule.conditions.map((cond, i) => (
                      <li key={i} className="leading-relaxed">{cond}</li>
                    ))}
                  </ul>
                </div>

                {/* Letters */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Associated Letters ({activeRule.letters.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeRule.letters.map((ltr, i) => (
                      <span
                        key={i}
                        className="font-arabic text-lg bg-white border border-stone-200 px-2.5 py-0.5 rounded-lg text-emerald-950 font-bold shadow-2xs"
                      >
                        {ltr}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Exceptions if any */}
              {activeRule.exceptions.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-stone-800 space-y-1">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Special Scholarly Exceptions (Istithnā’)
                  </div>
                  {activeRule.exceptions.map((exc, i) => (
                    <p key={i} className="leading-relaxed">{exc}</p>
                  ))}
                </div>
              )}

              {/* Examples with Practical Cues */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Verified Qur’anic Examples
                </span>
                <div className="space-y-2">
                  {activeRule.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-900/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-arabic text-xl font-bold text-emerald-950">
                            {ex.arabicWord}
                          </span>
                          <span className="font-mono text-emerald-800">({ex.transliteration})</span>
                          <span className="text-[10px] text-stone-500">
                            [Surah {ex.surahNumber}:{ex.ayahNumber}]
                          </span>
                        </div>
                        <div className="text-stone-600 text-[11px]">{ex.phoneticCue}</div>
                      </div>

                      {/* 1-Click Practice Button */}
                      {onPracticeRule && (
                        <button
                          onClick={() => onPracticeRule(ex.surahNumber, ex.ayahNumber)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm transition-all"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Practice Ayah</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Instructions & Teacher Warning */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-xs space-y-1.5">
                <div className="font-bold text-stone-900">
                  Oral Practice Advice:
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {activeRule.practiceInstructions}
                </p>
              </div>

              {/* Ask Assistant Shortcut */}
              {onAskAssistant && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onAskAssistant(`Can you explain the classical details and examples for the rule "${activeRule.nameEnglish}" (${activeRule.nameArabic}) according to Tuhfat al-Atfal or Al-Jazariyyah?`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-500/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ask AI Assistant to explain {activeRule.nameEnglish}</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200">
              Select a rule from the left catalog to explore classical citations and practice exercises.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
