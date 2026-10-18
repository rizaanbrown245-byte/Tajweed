/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Mic, 
  BookOpen, 
  GraduationCap, 
  MessageSquareText, 
  LineChart, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export type ActiveTab = 'recitation' | 'rules' | 'lessons' | 'assistant' | 'progress';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAndroidModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAndroidModal
}) => {
  const tabs = [
    { id: 'recitation' as const, label: 'Recitation', icon: Mic },
    { id: 'rules' as const, label: 'Tajweed Rules', icon: BookOpen },
    { id: 'lessons' as const, label: 'Lessons', icon: GraduationCap },
    { id: 'assistant' as const, label: 'AI Assistant', icon: MessageSquareText },
    { id: 'progress' as const, label: 'Progress & Tests', icon: LineChart }
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-emerald-950 text-white shadow-md border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Tradition Tag */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30 text-emerald-950 font-bold">
                <span className="font-arabic text-xl select-none">ت</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    Tajweed<span className="text-amber-400">AI</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-900/90 text-emerald-200 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Hafs ‘an ‘Asim
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 hidden sm:block">
                  Verified Qur’anic Recitation & Scholarly Tajweed Assistant
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-800/90 text-white shadow-sm ring-1 ring-amber-400/40'
                        : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-emerald-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Android APK Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAndroidModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-sm transition-all transform active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 text-stone-950" />
                <span className="hidden sm:inline">Android APK</span>
                <span className="sm:hidden">APK</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Android-first experience) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-900/60 pb-safe">
        <div className="grid grid-cols-5 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-emerald-300/70 hover:text-emerald-100'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-400 stroke-[2.5]' : 'text-emerald-300/70'}`} />
                <span className="text-[10px] truncate max-w-[64px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
