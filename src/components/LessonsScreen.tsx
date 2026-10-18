/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lessons Screen - Beginner Curriculum & Guided Rule Practice
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  RotateCcw, 
  Mic, 
  Volume2, 
  Award,
  Sparkles
} from 'lucide-react';
import { TAJWEED_LESSONS, TajweedLesson } from '../domain/learning/lessonsData';
import { practiceManager } from '../domain/learning/practiceManager';

interface LessonsScreenProps {
  onPracticeExercise?: (surah: number, ayah: number) => void;
  onNavigateToRule?: (ruleId: string) => void;
}

export const LessonsScreen: React.FC<LessonsScreenProps> = ({
  onPracticeExercise,
  onNavigateToRule
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(TAJWEED_LESSONS[0].id);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'exercises'>('content');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const activeLesson: TajweedLesson = 
    TAJWEED_LESSONS.find(l => l.id === selectedLessonId) || TAJWEED_LESSONS[0];

  const profile = practiceManager.getProfile();
  const isLessonCompleted = profile.completedLessonIds.includes(activeLesson.id);

  const handleAnswerSelect = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    setQuizSubmitted(true);
    // If all answers correct, mark lesson complete
    const allCorrect = activeLesson.quiz.every(q => selectedQuizAnswers[q.id] === q.correctOptionIndex);
    if (allCorrect) {
      practiceManager.markLessonComplete(activeLesson.id);
    }
  };

  const handleResetQuiz = () => {
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Systematic Tajweed Curriculum
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Interactive Lessons & Guided Drills
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Step-by-step modular lessons covering articulation points, letter characteristics, elongation rules, and stopping ethics. Reinforce each module with interactive comprehension checks and guided practice exercises.
          </p>
        </div>
      </div>

      {/* Main Grid: Lessons Selector & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Modules Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            Learning Path ({TAJWEED_LESSONS.length} Modules)
          </div>

          <div className="space-y-2.5">
            {TAJWEED_LESSONS.map((lesson) => {
              const isSelected = lesson.id === activeLesson.id;
              const completed = profile.completedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    setActiveTab('content');
                    handleResetQuiz();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-50/70 ring-2 ring-emerald-700/20 shadow-sm'
                      : 'border-stone-200/80 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                      Module {lesson.moduleNumber}
                    </span>
                    {completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.estimatedMinutes} min
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">
                    {lesson.title}
                  </h4>
                  <div className="font-arabic text-emerald-900 text-xs text-right mb-1">
                    {lesson.arabicTitle}
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {lesson.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson Viewer */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 overflow-hidden">
            
            {/* Lesson Top Bar & Sub-Tabs */}
            <div className="p-6 border-b border-stone-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Module {activeLesson.moduleNumber} • {activeLesson.level.toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                    {activeLesson.title}
                  </h3>
                </div>
                <div className="font-arabic text-2xl font-bold text-emerald-950 sm:text-right">
                  {activeLesson.arabicTitle}
                </div>
              </div>

              {/* Sub-tabs: Lesson Content, Guided Drills, Knowledge Quiz */}
              <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'content'
                      ? 'bg-emerald-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Lesson Text
                </button>
                <button
                  onClick={() => setActiveTab('exercises')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'exercises'
                      ? 'bg-emerald-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  Guided Exercises ({activeLesson.exercises.length})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'quiz'
                      ? 'bg-emerald-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Quiz ({activeLesson.quiz.length})
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: Lesson Text */}
            {activeTab === 'content' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                  {activeLesson.contentMarkdown.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-bold text-stone-900 pt-2">{paragraph.replace('### ', '')}</h3>;
                    }
                    if (paragraph.startsWith('#### ')) {
                      return <h4 key={i} className="text-base font-bold text-emerald-950 pt-2">{paragraph.replace('#### ', '')}</h4>;
                    }
                    if (paragraph.startsWith('> ')) {
                      return (
                        <blockquote key={i} className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-stone-800 text-xs sm:text-sm font-medium italic">
                          {paragraph.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    return <p key={i} className="text-stone-700 leading-relaxed">{paragraph}</p>;
                  })}
                </div>

                {/* Key Rules Referenced in this Lesson */}
                <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-900/10 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Rules Covered in this Lesson
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeLesson.keyRules.map(rId => (
                      <button
                        key={rId}
                        onClick={() => onNavigateToRule && onNavigateToRule(rId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs"
                      >
                        <span>{rId.replace(/_/g, ' ')}</span>
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Step Action Button */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <button
                    onClick={() => setActiveTab('exercises')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm transition-all"
                  >
                    <span>Proceed to Guided Exercises</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Guided Practice Exercises */}
            {activeTab === 'exercises' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="text-xs text-stone-600 leading-relaxed">
                  Repeat these verified examples focusing on the targeted Tajweed rule. Tap <span className="font-bold text-emerald-900">"Practice This Verse"</span> to load it immediately onto your recitation microphone screen.
                </div>

                <div className="space-y-4">
                  {activeLesson.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-900/15 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-900/10 pb-3">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                          {ex.title}
                        </span>
                        <span className="text-[11px] font-mono text-stone-500">
                          Surah {ex.surahNumber} : Ayah {ex.ayahNumber}
                        </span>
                      </div>

                      <div className="text-center py-2">
                        <div className="font-quran text-2xl sm:text-3xl text-emerald-950 font-bold mb-1" dir="rtl">
                          {ex.arabicPhrase}
                        </div>
                        <div className="text-xs text-emerald-800 italic font-sans">
                          "{ex.transliteration}"
                        </div>
                      </div>

                      <div className="bg-white/80 rounded-xl p-3 border border-emerald-200/50 text-xs space-y-1">
                        <span className="font-bold text-stone-900">Oral Instruction: </span>
                        <p className="text-stone-700 leading-relaxed">{ex.instruction}</p>
                        <div className="text-[11px] font-semibold text-amber-800 pt-1">
                          Focus: {ex.targetFocus}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        {onPracticeExercise && (
                          <button
                            onClick={() => onPracticeExercise(ex.surahNumber, ex.ayahNumber)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-sm transition-all"
                          >
                            <Mic className="w-3.5 h-3.5 text-amber-300" />
                            <span>Practice This Verse on Mic</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Knowledge Quiz */}
            {activeTab === 'quiz' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      Module Comprehension Check
                    </h4>
                    <p className="text-xs text-stone-500">
                      Answer all questions correctly based on Hafs ‘an ‘Asim rulings.
                    </p>
                  </div>
                  {quizSubmitted && (
                    <button
                      onClick={handleResetQuiz}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Quiz
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {activeLesson.quiz.map((q, qIndex) => {
                    const selectedIdx = selectedQuizAnswers[q.id];
                    const isAnswered = selectedIdx !== undefined;
                    const isCorrect = isAnswered && selectedIdx === q.correctOptionIndex;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-stone-200/90 bg-stone-50/50 space-y-3"
                      >
                        <div className="text-xs font-bold text-stone-800 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-900 text-white text-[11px] flex items-center justify-center shrink-0">
                            {qIndex + 1}
                          </span>
                          <span className="pt-0.5">{q.question}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedIdx === optIdx;
                            let btnStyle = 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100';

                            if (quizSubmitted) {
                              if (optIdx === q.correctOptionIndex) {
                                btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                              } else if (isChosen) {
                                btnStyle = 'bg-red-100 border-red-500 text-red-950 line-through';
                              }
                            } else if (isChosen) {
                              btnStyle = 'bg-emerald-900 text-white border-emerald-950 font-semibold shadow-sm';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(q.id, optIdx)}
                                className={`text-left p-3 rounded-xl border text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className={`p-3 rounded-xl text-xs space-y-1 ${
                            isCorrect ? 'bg-emerald-100/70 text-emerald-950' : 'bg-amber-100/70 text-amber-950'
                          }`}>
                            <div className="font-bold">
                              {isCorrect ? '✓ Correct' : 'Incorrect — Review:'}
                            </div>
                            <p>{q.explanation}</p>
                            {q.classicalSource && (
                              <div className="text-[11px] text-stone-600 font-mono pt-1">
                                Source: {q.classicalSource}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleGradeQuiz}
                      disabled={Object.keys(selectedQuizAnswers).length < activeLesson.quiz.length}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-sm transition-all"
                    >
                      Submit & Check Answers
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-emerald-950">
                        Quiz Completed! Lesson progress saved locally.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
