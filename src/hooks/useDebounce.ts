import { useCallback, useRef } from "react";

export function useDebounce<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
