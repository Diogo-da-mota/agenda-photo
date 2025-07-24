
import { useState, useEffect, useRef } from 'react';

/**
 * Hook de debounce avançado com múltiplas estratégias
 */
export const useAdvancedDebounce = <T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;      // Executar na primeira chamada
    trailing?: boolean;     // Executar na última chamada (padrão)
    maxWait?: number;      // Tempo máximo de espera
    immediate?: boolean;    // Executar imediatamente se valor for falsy
  } = {}
) => {
  const {
    leading = false,
    trailing = true,
    maxWait,
    immediate = false
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const lastCallTime = useRef<number>();
  const lastInvokeTime = useRef<number>(0);
  const timerId = useRef<NodeJS.Timeout>();
  const lastArgs = useRef<T>(value);

  useEffect(() => {
    lastArgs.current = value;
    lastCallTime.current = Date.now();

    // Se immediate e valor é falsy, atualizar imediatamente
    if (immediate && !value) {
      setDebouncedValue(value);
      return;
    }

    const shouldInvoke = (time: number) => {
      const timeSinceLastCall = time - (lastCallTime.current || 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        !lastCallTime.current ||
        timeSinceLastCall >= delay ||
        (maxWait && timeSinceLastInvoke >= maxWait)
      );
    };

    const invokeFunc = (time: number) => {
      lastInvokeTime.current = time;
      setDebouncedValue(lastArgs.current);
      return lastArgs.current;
    };

    const leadingEdge = (time: number) => {
      lastInvokeTime.current = time;
      timerId.current = setTimeout(timerExpired, delay);
      return leading ? invokeFunc(time) : lastArgs.current;
    };

    const remainingWait = (time: number) => {
      const timeSinceLastCall = time - (lastCallTime.current || 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;
      const timeWaiting = delay - timeSinceLastCall;

      return maxWait 
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    };

    const trailingEdge = (time: number) => {
      timerId.current = undefined;
      
      if (trailing && lastArgs.current !== undefined) {
        return invokeFunc(time);
      }
      
      lastArgs.current = undefined;
      return debouncedValue;
    };

    const timerExpired = () => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timerId.current = setTimeout(timerExpired, remainingWait(time));
    };

    const debounced = () => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      if (isInvoking) {
        if (!timerId.current) {
          return leadingEdge(time);
        }
        if (maxWait) {
          timerId.current = setTimeout(timerExpired, delay);
          return invokeFunc(time);
        }
      }
      
      if (!timerId.current) {
        timerId.current = setTimeout(timerExpired, delay);
      }
    };

    debounced();

    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = undefined;
      }
    };
  }, [value, delay, leading, trailing, maxWait, immediate]);

  return debouncedValue;
};
