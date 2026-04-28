
export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface UserProfile {
  xp: number;
  level: number;
  completedTopics: string[]; // for practice
  masteredLessons: string[]; // for learn
  streak: number;
  lastActive: string | null;
  totalTimeMinutes: number;
  achievements: Achievement[];
  totalQuestionsSolved: number;
}

const STORAGE_KEY = 'mathvision_user_profile';

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const defaults: UserProfile = { 
    xp: 0, 
    level: 1, 
    completedTopics: [], 
    masteredLessons: [],
    streak: 0,
    lastActive: null,
    totalTimeMinutes: 0,
    achievements: [],
    totalQuestionsSolved: 0
  };

  if (stored) {
    const parsed = JSON.parse(stored);
    return { ...defaults, ...parsed };
  }
  return defaults;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const calculateLevel = (xp: number) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const addXP = (amount: number): { profile: UserProfile, leveledUp: boolean } => {
  const profile = getUserProfile();
  const oldLevel = calculateLevel(profile.xp);
  profile.xp += amount;
  const newLevel = calculateLevel(profile.xp);
  profile.level = newLevel;
  saveUserProfile(profile);
  return { profile, leveledUp: newLevel > oldLevel };
};

export const updateGenericStats = (updates: Partial<Pick<UserProfile, 'streak' | 'totalTimeMinutes' | 'totalQuestionsSolved'>>) => {
  const profile = getUserProfile();
  if (updates.streak !== undefined) profile.streak = updates.streak;
  if (updates.totalTimeMinutes !== undefined) profile.totalTimeMinutes += updates.totalTimeMinutes;
  if (updates.totalQuestionsSolved !== undefined) profile.totalQuestionsSolved += updates.totalQuestionsSolved;
  
  // Handle streak and lastActive
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActive !== today) {
    const lastDate = profile.lastActive ? new Date(profile.lastActive) : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (profile.lastActive === yesterdayStr) {
      profile.streak += 1;
    } else if (profile.lastActive === null || profile.lastActive < yesterdayStr) {
      profile.streak = 1;
    }
    profile.lastActive = today;
  }

  saveUserProfile(profile);
  return profile;
}; 

export const addMastery = (lessonTopic: string) => {
  const profile = getUserProfile();
  if (!profile.masteredLessons.includes(lessonTopic)) {
    profile.masteredLessons.push(lessonTopic);
    saveUserProfile(profile);
  }
  return profile;
};

export const addCompletedTopic = (topic: string) => {
  const profile = getUserProfile();
  if (!profile.completedTopics.includes(topic)) {
    profile.completedTopics.push(topic);
    saveUserProfile(profile);
  }
  return profile;
};
