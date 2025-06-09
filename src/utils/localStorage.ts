export type LocalStorageData = {
  bookmark: string[];
};

export type LocalStorageKey = keyof LocalStorageData;

export const getLocalStorage = <T extends LocalStorageKey>(key: T): LocalStorageData[T] | null => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const setLocalStorage = <T extends LocalStorageKey>(key: T, value: LocalStorageData[T]) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorage = (key: LocalStorageKey) => {
  localStorage.removeItem(key);
};

export const clearLocalStorage = () => {
  localStorage.clear();
};
