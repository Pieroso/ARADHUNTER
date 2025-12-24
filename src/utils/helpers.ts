import { Platform } from 'react-native';

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};

export const calculateLevel = (points: number): number => {
  return Math.floor(points / 1000) + 1;
};

export const getNextLevelPoints = (points: number): number => {
  const currentLevel = calculateLevel(points);
  return currentLevel * 1000;
};

export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Platform.OS as 'ios' | 'android' | 'web';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};