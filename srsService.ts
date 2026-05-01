export interface SrsItem {
  topic: string;
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: number; // timestamp
}

const STORAGE_KEY = 'mathvision_srs';

export const getSrsData = (): SrsItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting SRS data:', error);
    return [];
  }
};

export const saveSrsData = (data: SrsItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateSrsItem = (topic: string, quality: number) => {
  // quality is a number from 0 to 5
  // 5: perfect response
  // 4: correct response after a hesitation
  // 3: correct response recalled with serious difficulty
  // 2: incorrect response; where the correct one seemed easy to recall
  // 1: incorrect response; the correct one remembered
  // 0: complete blackout
  const data = getSrsData();
  let itemIndex = data.findIndex(i => i.topic === topic);
  let item: SrsItem;

  if (itemIndex === -1) {
    item = {
      topic,
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: Date.now()
    };
  } else {
    item = data[itemIndex];
  }

  if (quality >= 3) {
    if (item.repetitions === 0) {
      item.interval = 1;
    } else if (item.repetitions === 1) {
      item.interval = 6;
    } else {
      item.interval = Math.round(item.interval * item.easeFactor);
    }
    item.repetitions += 1;
  } else {
    item.repetitions = 0;
    item.interval = 1;
  }

  item.easeFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (item.easeFactor < 1.3) item.easeFactor = 1.3;

  item.nextReviewDate = Date.now() + item.interval * 24 * 60 * 60 * 1000;

  if (itemIndex === -1) {
    data.push(item);
  } else {
    data[itemIndex] = item;
  }

  saveSrsData(data);
  return item;
};

export const getDueItems = (): SrsItem[] => {
  const data = getSrsData();
  const now = Date.now();
  return data.filter(item => item.nextReviewDate <= now).sort((a, b) => a.nextReviewDate - b.nextReviewDate);
};
