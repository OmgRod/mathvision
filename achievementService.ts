import { UserProfile, getUserProfile, saveUserProfile } from './userService';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  target: number;
  currentValue: (profile: UserProfile) => number;
  check: (profile: UserProfile) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Solve your first math problem',
    icon: 'Footprints',
    xpReward: 50,
    target: 1,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 1
  },
  {
    id: 'fast_learner',
    title: 'Fast Learner',
    description: 'Complete 3 learning modules',
    icon: 'Zap',
    xpReward: 200,
    target: 3,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 3
  },
  {
    id: 'streak_3',
    title: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: 'Flame',
    xpReward: 300,
    target: 3,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 3
  },
  {
    id: 'math_god',
    title: 'Mathematical deity',
    description: 'Reach Level 10',
    icon: 'Crown',
    xpReward: 1000,
    target: 10,
    currentValue: (p) => p.level,
    check: (p) => p.level >= 10
  },
  {
    id: 'marathon',
    title: 'Study Marathon',
    description: 'Spend 60 minutes learning',
    icon: 'Timer',
    xpReward: 500,
    target: 60,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 60
  },
  {
    id: 'academic_master',
    title: 'Academic Master',
    description: 'Complete 10 different practice topics',
    icon: 'GraduationCap',
    xpReward: 1000,
    target: 10,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 10
  },
  {
    id: 'slayer_10',
    title: 'Equation Slayer',
    description: 'Solve 10 mathematical equations',
    icon: 'Sword',
    xpReward: 300,
    target: 10,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 10
  },
  {
    id: 'slayer_50',
    title: 'Century Junior',
    description: 'Solve 50 mathematical equations',
    icon: 'Target',
    xpReward: 1000,
    target: 50,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 50
  },
  {
    id: 'legend',
    title: 'Living Legend',
    description: 'Reach Level 25',
    icon: 'Sparkles',
    xpReward: 2500,
    target: 25,
    currentValue: (p) => p.level,
    check: (p) => p.level >= 25
  },
  {
    id: 'polymath',
    title: 'Polymath',
    description: 'Complete modules in 5 different categories',
    icon: 'BookOpen',
    xpReward: 800,
    target: 5,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 5
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Spend more than 5 hours in total study time',
    icon: 'Timer',
    xpReward: 1500,
    target: 300,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 300
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    xpReward: 1000,
    target: 7,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 7
  },
  {
    id: 'streak_30',
    title: 'Monthly Mentor',
    description: 'Maintain a 30-day streak',
    icon: 'Flame',
    xpReward: 5000,
    target: 30,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 30
  }
];

export const checkAchievements = () => {
  const profile = getUserProfile();
  const unlockedNow: AchievementDef[] = [];

  ACHIEVEMENTS.forEach(ach => {
    const alreadyUnlocked = profile.achievements.find(a => a.id === ach.id);
    if (!alreadyUnlocked && ach.check(profile)) {
      profile.achievements.push({
        id: ach.id,
        unlockedAt: new Date().toISOString()
      });
      profile.xp += ach.xpReward;
      unlockedNow.push(ach);
    }
  });

  if (unlockedNow.length > 0) {
    saveUserProfile(profile);
    unlockedNow.forEach(ach => {
      window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: ach }));
    });
  }

  return unlockedNow;
};
