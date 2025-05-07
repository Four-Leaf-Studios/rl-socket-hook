// useRocketLeagueSocket.ts
import { useEffect, useReducer, useRef, useState, useCallback } from "react";

export type EventMap = { [eventName: string]: any };

type Action = {
  type: string;
  payload: any;
};

const reducer = <EM extends EventMap>(state: EM, action: Action): EM => ({
  ...state,
  [action.type]: action.payload,
});

const normalizeEvent = (raw: any): [string, any][] => {
  if (typeof raw === "object" && raw !== null) {
    // { event: "name", data: {...} }
    if (typeof raw.event === "string" && "data" in raw) {
      return [[raw.event, raw.data]];
    }
    // { "evt1": {...}, "evt2": {...} }
    return Object.entries(raw);
  }
  return [];
};

export function useRocketLeagueSocket<EM extends EventMap = EventMap>(
  url: string = "ws://localhost:49122",
  options?: {
    maxRetries?: number;
    heartbeatIntervalMs?: number;
  }
): {
  /** Latest map of event → payload */
  events: EM;
  /** WebSocket readyState (CONNECTING, OPEN, etc.) */
  readyState: number;
  /** Last error event, if any */
  error: Event | null;
  /** Send an event back to the server */
  send: (event: string, data: any) => void;
} {
  const { maxRetries = 5, heartbeatIntervalMs = 30_000 } = options || {};

  // Reducer state holds the map of eventName → payload
  const [events, dispatch] = useReducer(
    reducer as (s: EM, a: Action) => EM,
    {} as EM
  );
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [error, setError] = useState<Event | null>(null);

  // Refs for the socket, retry count, and heartbeat timer
  const socketRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number>(0);
  const heartbeatRef = useRef<number | undefined>(undefined);

  // Expose a send() helper
  const send = useCallback((event: string, data: any) => {
    const sock = socketRef.current;
    if (sock?.readyState === WebSocket.OPEN) {
      sock.send(JSON.stringify({ event, data }));
    } else {
      console.warn("Cannot send, socket not open:", event);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      const ws = new WebSocket(url);
      socketRef.current = ws;
      setReadyState(ws.readyState);

      ws.onopen = () => {
        if (!isMounted) return;
        retryRef.current = 0;
        setReadyState(ws.readyState);
        // Start heartbeat to keep alive
        heartbeatRef.current = window.setInterval(() => {
          ws.send(JSON.stringify({ event: "ping" }));
        }, heartbeatIntervalMs);
      };

      ws.onmessage = (e) => {
        if (!isMounted) return;
        let raw: any;
        try {
          raw = JSON.parse(e.data);
        } catch {
          console.error("Invalid JSON from server:", e.data);
          return;
        }
        // ignore pong replies
        if (raw.event === "pong") return;
        // dispatch each normalized event
        for (const [evt, payload] of normalizeEvent(raw)) {
          dispatch({ type: evt, payload });
        }
      };

      ws.onerror = (ev) => {
        if (!isMounted) return;
        console.error("WebSocket error", ev);
        setError(ev);
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setReadyState(WebSocket.CLOSED);
        if (heartbeatRef.current !== undefined) {
          clearInterval(heartbeatRef.current);
        }
        // attempt reconnect
        if (retryRef.current < maxRetries) {
          const backoff = 2 ** retryRef.current * 1000;
          retryRef.current += 1;
          setTimeout(connect, backoff);
        } else {
          console.warn("Reached max WebSocket retries");
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (heartbeatRef.current !== undefined) {
        clearInterval(heartbeatRef.current);
      }
      socketRef.current?.close();
    };
  }, [url, maxRetries, heartbeatIntervalMs]);

  return { events, readyState, error, send };
}

export default useRocketLeagueSocket;
