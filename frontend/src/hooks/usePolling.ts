import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, intervalMs: number, enabled: boolean = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
