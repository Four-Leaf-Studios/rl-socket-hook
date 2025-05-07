// src/RLProvider.tsx
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
  send(event: string, data: any): void;
  readyState: number;
  error: Event | null;
}

export const RLContext = createContext<Store | null>(null);

export const RLProvider: React.FC<{
  url?: string;
  children: ReactNode;
}> = ({ url = "ws://localhost:49122", children }) => {
  // 1) pull in every event & helpers from the single socket hook
  const {
    events: allEvents,
    send,
    readyState,
    error,
  } = useRocketLeagueSocket<PayloadStorage>(url);

  // 2) Use a loose-typed ref to avoid union-vs-intersection complaints
  const dataRef = useRef<Record<string, any>>({});
  const subsRef = useRef<Record<string, Subscriber[]>>({});

  // 3) Sync incoming allEvents into dataRef and notify subscribers
  useEffect(() => {
    // Force evt to be keyof PayloadStorage for type-narrowing
    const keys = Object.keys(allEvents) as Array<keyof PayloadStorage>;
    keys.forEach((evt) => {
      const payload = allEvents[evt];
      // write into our record (string index)
      dataRef.current[evt as string] = payload;
      // notify anyone subscribed to this key
      (subsRef.current[evt as string] || []).forEach((cb) => cb());
    });
  }, [allEvents]);

  // 4) Build the same Store API, casting when reading back
  const store = useMemo<Store>(
    () => ({
      getSnapshot: (eventName) =>
        // cast from any back to the correct PayloadStorage type
        dataRef.current[eventName as string] as
          | PayloadStorage[typeof eventName]
          | undefined,
      subscribe: (eventName, callback) => {
        const arr = (subsRef.current[eventName as string] ??= []);
        arr.push(callback);
        return () => {
          subsRef.current[eventName as string] = arr.filter(
            (c) => c !== callback
          );
        };
      },
      send,
      readyState,
      error,
    }),
    [send, readyState, error]
  );

  return <RLContext.Provider value={store}>{children}</RLContext.Provider>;
};

/**
 * Subscribe to the full payload of an event.
 */
export function useEvent<E extends keyof PayloadStorage>(
  eventName: E
): PayloadStorage[E] | undefined {
  const store = useContext(RLContext);
  if (!store) throw new Error("useEvent must be inside <RLProvider>");

  return useSyncExternalStore<PayloadStorage[E] | undefined>(
    (cb) => store.subscribe(eventName, cb),
    () => store.getSnapshot(eventName)
  );
}

/** Tiny deep-equal for selector comparisons */
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
  const aKeys = Object.keys(a),
    bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(a[key], (b as any)[key]));
}

/**
 * Subscribe to a selected slice of the event payload. Re-renders only on actual changes.
 */
export function useEventSelector<E extends keyof PayloadStorage, U>(
  eventName: E,
  selector: (v: PayloadStorage[E] | undefined) => U,
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
    const next = selector(raw);
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
