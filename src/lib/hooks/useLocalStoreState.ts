import { useEffect, useState } from 'react';

export const useLocalStoreState = <T extends unknown>(key: string, defaultValue: T) => {

  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        setValue(JSON.parse(saved) as T);
      } catch (error) {
        console.error('Error parsing stored state', error);
      }
    }
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;

}