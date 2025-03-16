import { useRef, useCallback } from "react";

export function useThrottle<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const lastExecutedRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>): ReturnType<T> | void => {
      const now = Date.now();

      if (now - lastExecutedRef.current >= delay) {
        lastExecutedRef.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  );
}
