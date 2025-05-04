import React, {
  createContext,
  ReactNode,
  useRef,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from "react";
import { useSyncExternalStore } from "react";

// <-- Open interface for module augmentation
export interface EventPayloads {}

type Subscriber = () => void;

/**
 * Internal storage type: partial mapping of known event keys to payloads
 */
type PayloadStorage = Partial<EventPayloads>;

interface Store {
  getSnapshot: (
    eventName: keyof PayloadStorage
  ) => PayloadStorage[keyof PayloadStorage] | undefined;
  subscribe: (
    eventName: keyof PayloadStorage,
    callback: Subscriber
  ) => () => void;
}

export const RLContext = createContext<Store | null>(null);

interface RLProviderProps {
  children: ReactNode;
  /** WebSocket URL (default: ws://localhost:49122) */
  url?: string;
}

export const RLProvider: React.FC<RLProviderProps> = ({
  children,
  url = "ws://localhost:49122",
}) => {
  // Strongly-typed storage of known events
  const dataRef = useRef<PayloadStorage>({});
  const subscribersRef = useRef<Record<string, Subscriber[]>>({});

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);
        const entries: [string, any][] = Array.isArray(raw)
          ? raw
          : raw.event && raw.data
          ? [[raw.event, raw.data]]
          : Object.entries(raw as object);

        for (const [eventName, payload] of entries) {
          // store payload
          (dataRef.current as any)[eventName] = payload;
          // notify subscribers
          (subscribersRef.current[eventName] ?? []).forEach((cb) => cb());
        }
      } catch {
        console.error("Invalid WS data");
      }
    };

    return () => {
      socket.close();
    };
  }, [url]);

  // Expose stable store API
  const store = useMemo<Store>(
    () => ({
      getSnapshot: (eventName) => dataRef.current[eventName],
      subscribe: (eventName, callback) => {
        const subs = (subscribersRef.current[eventName] ??= []);
        subs.push(callback);
        return () => {
          subscribersRef.current[eventName] = subs.filter(
            (c) => c !== callback
          );
        };
      },
    }),
    []
  );

  return <RLContext.Provider value={store}>{children}</RLContext.Provider>;
};

/**
 * Subscribe to the full event payload. Returns `PayloadStorage[E] | undefined`.
 */
export function useEvent<E extends keyof PayloadStorage>(
  eventName: E
): PayloadStorage[E] | undefined {
  const store = useContext(RLContext);
  if (!store) throw new Error("useEvent must be inside <RLProvider>");

  return useSyncExternalStore(
    (cb) => store.subscribe(eventName, cb),
    () => store.getSnapshot(eventName)
  );
}

/**
 * Tiny deep-equal for JavaScript values
 */
function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!deepEqual(a[key], (b as any)[key])) return false;
  }
  return true;
}

/**
 * Subscribe to a selected slice of the event payload. Only re-renders when that slice changes.
 * Uses a built-in deep-equality check by default (no lodash).
 */
export function useEventSelector<E extends keyof PayloadStorage, U>(
  /** Event key to subscribe to */
  eventName: E,
  /** Selector that picks a slice of the payload */
  selector: (v: PayloadStorage[E] | undefined) => U,
  /** Equality function to compare selector results; defaults to deepEqual */
  isEqual: (a: U, b: U) => boolean = deepEqual
): U {
  const store = useContext(RLContext)!;
  const lastRef = useRef<{ val?: U }>({});

  const subscribe = useCallback(
    (cb: () => void) => store.subscribe(eventName, cb),
    [eventName, store]
  );

  const getSnapshot = useCallback(() => {
    const raw = store.getSnapshot(eventName);
    const next = selector(raw as PayloadStorage[E] | undefined);
    // deep-equal by default
    if (
      lastRef.current.val !== undefined &&
      isEqual(next, lastRef.current.val)
    ) {
      return lastRef.current.val as U;
    }
    lastRef.current.val = next;
    return next;
  }, [eventName, selector, store, isEqual]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
