import { getLocalStorage, LocalStorageData, LocalStorageKey, removeLocalStorage, setLocalStorage } from "@/utils/localStorage";
import { useCallback, useMemo, useSyncExternalStore } from "react";

export const useLocalStorage = <T extends LocalStorageKey>(key: T) => {
  const setStorage = useCallback(
    (newValue: LocalStorageData[T]) => {
      setLocalStorage(key, newValue);
      dispatchEvent(new StorageEvent("storage", { key: key, newValue: JSON.stringify(newValue) }));
    },
    [key]
  );

  const removeStorage = useCallback(() => {
    removeLocalStorage(key);
    dispatchEvent(new StorageEvent("storage", { key: key }));
  }, [key]);

  const getSnapshot = () => localStorage.getItem(key);

  const subscribe = (listener: () => void) => {
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  };

  const store = useSyncExternalStore(subscribe, getSnapshot);

  const value = useMemo(() => {
    if (store === null) return null;

    // localStorage의 key에 데이터가 있을 경우
    const parsedValue = JSON.parse(store) as LocalStorageData[T];

    return parsedValue;
  }, [store]);

  return { value, set: setStorage, remove: removeStorage };
};
