/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local Practice State, Daily Goals, and Privacy Storage Manager
 */

export interface DailyGoal {
  targetAyahsPerDay: number;
  targetMinutesPerDay: number;
}

export interface UserPracticeProfile {
  dailyGoal: DailyGoal;
  todayAyahsCompleted: number;
  todayMinutesCompleted: number;
  currentStreakDays: number;
  lastPracticeDate: string; // YYYY-MM-DD
  totalAyahsPracticed: number;
  recurringDifficulties: {
    ruleId: string;
    ruleName: string;
    occurrences: number;
    lastNoticedDate: string;
  }[];
  completedLessonIds: string[];
  privacyConsentGiven: boolean;
  saveRecordingsLocally: boolean;
}

const STORAGE_KEY = 'tajweed_ai_user_profile_v1';

const DEFAULT_PROFILE: UserPracticeProfile = {
  dailyGoal: {
    targetAyahsPerDay: 5,
    targetMinutesPerDay: 15
  },
  todayAyahsCompleted: 0,
  todayMinutesCompleted: 0,
  currentStreakDays: 1,
  lastPracticeDate: new Date().toISOString().split('T')[0],
  totalAyahsPracticed: 0,
  recurringDifficulties: [
    {
      ruleId: 'madd_tabeei',
      ruleName: 'Natural Lengthening (Madd Tabee\'i)',
      occurrences: 2,
      lastNoticedDate: new Date().toISOString().split('T')[0]
    },
    {
      ruleId: 'qalqalah_rules',
      ruleName: 'Qalqalah Kubra Bounce',
      occurrences: 1,
      lastNoticedDate: new Date().toISOString().split('T')[0]
    }
  ],
  completedLessonIds: ['lesson-1-makharij'],
  privacyConsentGiven: true,
  saveRecordingsLocally: false
};

export class PracticeManager {
  private profile: UserPracticeProfile;

  constructor() {
    this.profile = this.loadProfile();
    this.checkStreakAndResetDaily();
  }

  private loadProfile(): UserPracticeProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
    return { ...DEFAULT_PROFILE };
  }

  private saveProfile(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Failed to persist profile to localStorage', e);
    }
  }

  private checkStreakAndResetDaily(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.profile.lastPracticeDate !== today) {
      const lastDate = new Date(this.profile.lastPracticeDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Consecutive day
        this.profile.currentStreakDays += 1;
      } else if (diffDays > 1) {
        // Streak broken
        this.profile.currentStreakDays = 1;
      }

      this.profile.todayAyahsCompleted = 0;
      this.profile.todayMinutesCompleted = 0;
      this.profile.lastPracticeDate = today;
      this.saveProfile();
    }
  }

  getProfile(): UserPracticeProfile {
    return { ...this.profile };
  }

  recordSession(ayahsCount: number, durationSeconds: number, reviewRuleIds: string[] = []): void {
    this.checkStreakAndResetDaily();
    this.profile.todayAyahsCompleted += ayahsCount;
    this.profile.totalAyahsPracticed += ayahsCount;
    this.profile.todayMinutesCompleted += Math.round(durationSeconds / 60) || 1;

    // Track difficulties
    for (const rId of reviewRuleIds) {
      const existing = this.profile.recurringDifficulties.find(d => d.ruleId === rId);
      if (existing) {
        existing.occurrences += 1;
        existing.lastNoticedDate = new Date().toISOString().split('T')[0];
      } else {
        this.profile.recurringDifficulties.push({
          ruleId: rId,
          ruleName: rId.replace(/_/g, ' '),
          occurrences: 1,
          lastNoticedDate: new Date().toISOString().split('T')[0]
        });
      }
    }

    this.saveProfile();
  }

  markLessonComplete(lessonId: string): void {
    if (!this.profile.completedLessonIds.includes(lessonId)) {
      this.profile.completedLessonIds.push(lessonId);
      this.saveProfile();
    }
  }

  updateDailyGoal(ayahs: number, minutes: number): void {
    this.profile.dailyGoal = {
      targetAyahsPerDay: Math.max(1, ayahs),
      targetMinutesPerDay: Math.max(1, minutes)
    };
    this.saveProfile();
  }

  updatePrivacySettings(saveRecordings: boolean): void {
    this.profile.saveRecordingsLocally = saveRecordings;
    this.saveProfile();
  }

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.profile = { ...DEFAULT_PROFILE };
    this.saveProfile();
  }
}

export const practiceManager = new PracticeManager();
