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
    id: 'curiosity_spark',
    title: 'Curiosity Spark',
    description: 'Ask for a hint when you want to understand the next step',
    icon: 'Lightbulb',
    xpReward: 80,
    target: 1,
    currentValue: (p) => p.hintsUsedTotal,
    check: (p) => p.hintsUsedTotal >= 1
  },
  {
    id: 'doodle_break',
    title: 'Doodle Break',
    description: 'Open the scratchpad to think out loud',
    icon: 'Pencil',
    xpReward: 90,
    target: 1,
    currentValue: (p) => p.whiteboardOpens,
    check: (p) => p.whiteboardOpens >= 1
  },
  {
    id: 'photo_sleuth',
    title: 'Photo Sleuth',
    description: 'Solve math using a real-world photo or camera input',
    icon: 'Camera',
    xpReward: 120,
    target: 1,
    currentValue: (p) => p.photoInputsUsed,
    check: (p) => p.photoInputsUsed >= 1
  },
  {
    id: 'wise_owl',
    title: 'Wise Owl',
    description: 'Open the help center to learn something new',
    icon: 'BookOpen',
    xpReward: 70,
    target: 1,
    currentValue: (p) => p.helpOpenedCount,
    check: (p) => p.helpOpenedCount >= 1
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
  },
  {
    id: 'first_lesson',
    title: 'First Lesson Complete',
    description: 'Finish your first lesson module',
    icon: 'GraduationCap',
    xpReward: 120,
    target: 1,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 1
  },
  {
    id: 'first_practice',
    title: 'Practice Newbie',
    description: 'Finish your first practice topic',
    icon: 'BookOpen',
    xpReward: 120,
    target: 1,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 1
  },
  {
    id: 'practice_2',
    title: 'Double Practice',
    description: 'Complete 2 practice topics',
    icon: 'BookOpen',
    xpReward: 180,
    target: 2,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 2
  },
  {
    id: 'practice_5',
    title: 'Practice Pro',
    description: 'Complete 5 practice topics',
    icon: 'BookOpen',
    xpReward: 260,
    target: 5,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 5
  },
  {
    id: 'practice_8',
    title: 'Practice Champion',
    description: 'Complete 8 practice topics',
    icon: 'BookOpen',
    xpReward: 380,
    target: 8,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 8
  },
  {
    id: 'practice_12',
    title: 'Practice Legend',
    description: 'Complete 12 practice topics',
    icon: 'BookOpen',
    xpReward: 520,
    target: 12,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 12
  },
  {
    id: 'practice_20',
    title: 'Practice Apex',
    description: 'Complete 20 practice topics',
    icon: 'BookOpen',
    xpReward: 900,
    target: 20,
    currentValue: (p) => p.completedTopics.length,
    check: (p) => p.completedTopics.length >= 20
  },
  {
    id: 'lesson_2',
    title: 'Lesson Learner',
    description: 'Master 2 lesson topics',
    icon: 'GraduationCap',
    xpReward: 220,
    target: 2,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 2
  },
  {
    id: 'lesson_3',
    title: 'Lesson Veteran',
    description: 'Master 3 lesson topics',
    icon: 'GraduationCap',
    xpReward: 320,
    target: 3,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 3
  },
  {
    id: 'lesson_5',
    title: 'Lesson Maestro',
    description: 'Master 5 lesson topics',
    icon: 'GraduationCap',
    xpReward: 520,
    target: 5,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 5
  },
  {
    id: 'lesson_8',
    title: 'Lesson Architect',
    description: 'Master 8 lesson topics',
    icon: 'GraduationCap',
    xpReward: 780,
    target: 8,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 8
  },
  {
    id: 'lesson_12',
    title: 'Lesson Sage',
    description: 'Master 12 lesson topics',
    icon: 'GraduationCap',
    xpReward: 1100,
    target: 12,
    currentValue: (p) => p.masteredLessons.length,
    check: (p) => p.masteredLessons.length >= 12
  },
  {
    id: 'streak_2',
    title: 'Early Momentum',
    description: 'Keep a 2-day study streak',
    icon: 'Flame',
    xpReward: 120,
    target: 2,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 2
  },
  {
    id: 'streak_4',
    title: 'Steady Scholar',
    description: 'Keep a 4-day study streak',
    icon: 'Flame',
    xpReward: 220,
    target: 4,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 4
  },
  {
    id: 'streak_5',
    title: 'Study Sprint',
    description: 'Keep a 5-day study streak',
    icon: 'Flame',
    xpReward: 320,
    target: 5,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 5
  },
  {
    id: 'streak_10',
    title: 'Tenacious Thinker',
    description: 'Keep a 10-day study streak',
    icon: 'Flame',
    xpReward: 600,
    target: 10,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 10
  },
  {
    id: 'streak_14',
    title: 'Fortnight Focus',
    description: 'Keep a 14-day study streak',
    icon: 'Flame',
    xpReward: 900,
    target: 14,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 14
  },
  {
    id: 'streak_21',
    title: 'Three-Week Warrior',
    description: 'Keep a 21-day study streak',
    icon: 'Flame',
    xpReward: 1400,
    target: 21,
    currentValue: (p) => p.streak,
    check: (p) => p.streak >= 21
  },
  {
    id: 'solve_2',
    title: 'Double Down',
    description: 'Solve 2 math problems',
    icon: 'Target',
    xpReward: 80,
    target: 2,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 2
  },
  {
    id: 'solve_5',
    title: 'Quintuple Quest',
    description: 'Solve 5 math problems',
    icon: 'Target',
    xpReward: 180,
    target: 5,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 5
  },
  {
    id: 'solve_20',
    title: 'Problem Solver',
    description: 'Solve 20 math problems',
    icon: 'Target',
    xpReward: 420,
    target: 20,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 20
  },
  {
    id: 'solve_100',
    title: 'Century Solver',
    description: 'Solve 100 math problems',
    icon: 'Target',
    xpReward: 1200,
    target: 100,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 100
  },
  {
    id: 'solve_200',
    title: 'Problem Pro',
    description: 'Solve 200 math problems',
    icon: 'Target',
    xpReward: 1800,
    target: 200,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 200
  },
  {
    id: 'solve_500',
    title: 'Half-Kilometer',
    description: 'Solve 500 math problems',
    icon: 'Target',
    xpReward: 3200,
    target: 500,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 500
  },
  {
    id: 'solve_1000',
    title: 'Thousand Brain',
    description: 'Solve 1000 math problems',
    icon: 'Target',
    xpReward: 5200,
    target: 1000,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 1000
  },
  {
    id: 'solve_2000',
    title: 'Math Marathoner',
    description: 'Solve 2000 math problems',
    icon: 'Target',
    xpReward: 8000,
    target: 2000,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 2000
  },
  {
    id: 'solve_5000',
    title: 'Math Titan',
    description: 'Solve 5000 math problems',
    icon: 'Sparkles',
    xpReward: 15000,
    target: 5000,
    currentValue: (p) => p.totalQuestionsSolved,
    check: (p) => p.totalQuestionsSolved >= 5000
  },
  {
    id: 'time_15',
    title: 'Quarter Hour',
    description: 'Spend 15 minutes learning',
    icon: 'Timer',
    xpReward: 90,
    target: 15,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 15
  },
  {
    id: 'time_30',
    title: 'Half Hour',
    description: 'Spend 30 minutes learning',
    icon: 'Timer',
    xpReward: 180,
    target: 30,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 30
  },
  {
    id: 'time_120',
    title: 'Two-Hour Scholar',
    description: 'Spend 2 hours learning',
    icon: 'Timer',
    xpReward: 420,
    target: 120,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 120
  },
  {
    id: 'time_240',
    title: 'Four-Hour Focus',
    description: 'Spend 4 hours learning',
    icon: 'Timer',
    xpReward: 760,
    target: 240,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 240
  },
  {
    id: 'time_480',
    title: 'Eight-Hour Mentor',
    description: 'Spend 8 hours learning',
    icon: 'Timer',
    xpReward: 1300,
    target: 480,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 480
  },
  {
    id: 'time_720',
    title: 'Twelve-Hour Titan',
    description: 'Spend 12 hours learning',
    icon: 'Timer',
    xpReward: 1900,
    target: 720,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 720
  },
  {
    id: 'time_1440',
    title: 'Daylong Dedication',
    description: 'Spend 24 hours learning in total',
    icon: 'Timer',
    xpReward: 3200,
    target: 1440,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 1440
  },
  {
    id: 'time_2880',
    title: 'Fortnight Focus',
    description: 'Spend 48 hours learning in total',
    icon: 'Timer',
    xpReward: 5200,
    target: 2880,
    currentValue: (p) => p.totalTimeMinutes,
    check: (p) => p.totalTimeMinutes >= 2880
  },
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
