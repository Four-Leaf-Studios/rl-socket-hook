// RLProvider.tsx
import React, {
  createContext,
  ReactNode,
  useRef,
  useEffect,
  useMemo,
  useContext,
} from "react";
import { useSyncExternalStore } from "react";

export type EventMap = { [k: string]: any };
type Subscriber = () => void;

interface Store {
  getSnapshot: (eventName: string) => any;
  subscribe: (eventName: string, callback: Subscriber) => () => void;
}

export const RLContext = createContext<Store | null>(null);

interface RLProviderProps {
  children: ReactNode;
  url?: string;
}

export const RLProvider = ({
  children,
  url = "ws://localhost:49122",
}: RLProviderProps) => {
  // Hold all event data in a ref so the object identity never changes
  const dataRef = useRef<EventMap>({});
  // Map eventName → array of subscribers
  const subscribersRef = useRef<Record<string, Subscriber[]>>({});

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);
        // Normalize into [ [eventName, payload], ... ]
        const entries: [string, any][] = Array.isArray(raw)
          ? raw
          : raw.event && raw.data
          ? [[raw.event, raw.data]]
          : Object.entries(raw);

        for (const [eventName, payload] of entries) {
          dataRef.current[eventName] = payload;
          const subs = subscribersRef.current[eventName] || [];
          subs.forEach((cb) => cb());
        }
      } catch {
        console.error("Invalid WS data");
      }
    };

    return () => socket.close();
  }, [url]);

  // Expose a stable store object
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

// useEvent.ts
export const useEvent = (eventName: string) => {
  const store = useContext(RLContext);
  if (!store) throw new Error("useEvent must be inside <RLProvider>");

  // Only re-render when this event’s snapshot actually changes
  return useSyncExternalStore(
    (cb) => store.subscribe(eventName, cb),
    () => store.getSnapshot(eventName)
  );
};
