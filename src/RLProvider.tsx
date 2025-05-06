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
import { PayloadStorage } from "./types";
import useRocketLeagueSocket from "./useRocketLeagueSocket";

type Subscriber = () => void;

interface Store {
  getSnapshot<E extends keyof PayloadStorage>(
    eventName: E
  ): PayloadStorage[E] | undefined;
  subscribe<E extends keyof PayloadStorage>(
    eventName: E,
    callback: Subscriber
  ): () => void;
}

export const RLContext = createContext<Store | null>(null);

export const RLProvider: React.FC<{ url?: string; children: ReactNode }> = ({
  url = "ws://localhost:49122",
  children,
}) => {
  // 1) pull in every event => payload map
  const allEvents = useRocketLeagueSocket(url);

  // 2) same refs and subscriber logic as before
  const dataRef = useRef<PayloadStorage>({});
  const subsRef = useRef<Record<string, Subscriber[]>>({});

  // 3) whenever the hook’s state changes, push into the dataRef + notify
  useEffect(() => {
    for (const [evt, payload] of Object.entries(allEvents)) {
      dataRef.current[evt as keyof PayloadStorage] = payload;
      (subsRef.current[evt] || []).forEach((cb) => cb());
    }
  }, [allEvents]);

  // 4) expose the same context store API
  const store = useMemo<Store>(
    () => ({
      getSnapshot: (eventName) => dataRef.current[eventName],
      subscribe: (eventName, callback) => {
        const arr = (subsRef.current[eventName] ??= []);
        arr.push(callback);
        return () => {
          subsRef.current[eventName] = arr.filter((c) => c !== callback);
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

  // 2) (optional) explicitly tell TS what snapshot type is
  return useSyncExternalStore<PayloadStorage[E] | undefined>(
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
