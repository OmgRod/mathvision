import { HistoryItem } from './types';

const STORAGE_KEY = 'mathvision_history';

export const saveToHistory = (type: HistoryItem['type'], topic: string, data: any) => {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      topic,
      data
    };
    
    // Limit history to last 50 items to keep localStorage clean
    const updatedHistory = [newItem, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event('history-updated'));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('history-updated'));
};

export const deleteHistoryItem = (id: string) => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('history-updated'));
};
