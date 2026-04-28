
export interface UserProfile {
  xp: number;
  level: number;
  completedTopics: string[]; // for practice
  masteredLessons: string[]; // for learn
}

const STORAGE_KEY = 'mathvision_user_profile';

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return { xp: 0, level: 1, completedTopics: [], masteredLessons: [] };
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
