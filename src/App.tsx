/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TajweedAI - Qur'anic Recitation & Tajweed Learning Assistant
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { RecitationScreen } from './components/RecitationScreen';
import { RulesKnowledgeScreen } from './components/RulesKnowledgeScreen';
import { LessonsScreen } from './components/LessonsScreen';
import { AssistantScreen } from './components/AssistantScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { AndroidInstallModal } from './components/AndroidInstallModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recitation');
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);

  // Cross-screen navigation state
  const [targetSurah, setTargetSurah] = useState<number>(1);
  const [targetAyah, setTargetAyah] = useState<number>(1);
  const [targetRuleId, setTargetRuleId] = useState<string | undefined>(undefined);
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(undefined);

  const handlePracticeAyah = (surah: number, ayah: number) => {
    setTargetSurah(surah);
    setTargetAyah(ayah);
    setActiveTab('recitation');
  };

  const handleNavigateToRule = (ruleId: string) => {
    setTargetRuleId(ruleId);
    setActiveTab('rules');
  };

  const handleAskAssistant = (prompt: string) => {
    setAssistantPrompt(prompt);
    setActiveTab('assistant');
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-stone-900 flex flex-col font-sans">
      
      {/* Top Header & Mobile Bottom Nav */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Main Screen Body */}
      <main className="flex-1">
        {activeTab === 'recitation' && (
          <RecitationScreen
            initialSurah={targetSurah}
            initialAyah={targetAyah}
            onAyahChange={(surah, ayah) => {
              setTargetSurah(surah);
              setTargetAyah(ayah);
            }}
            onNavigateToRule={handleNavigateToRule}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {activeTab === 'rules' && (
          <RulesKnowledgeScreen
            initialRuleId={targetRuleId}
            onPracticeRule={handlePracticeAyah}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsScreen
            onPracticeExercise={handlePracticeAyah}
            onNavigateToRule={handleNavigateToRule}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantScreen
            initialPrompt={assistantPrompt}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressScreen
            onPracticeRule={handlePracticeAyah}
          />
        )}
      </main>

      {/* Android APK & Install Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

    </div>
  );
}
