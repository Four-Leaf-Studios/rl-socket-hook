// useRocketLeagueSocket.ts
import { useEffect, useReducer } from "react";

export type EventMap = { [eventName: string]: any };

type Action = { type: string; payload: any };

const reducer = (state: EventMap, action: Action): EventMap => ({
  ...state,
  [action.type]: action.payload,
});

const normalizeEvent = (raw: any): [string, any][] => {
  if (typeof raw === "object") {
    if (typeof raw.event === "string" && "data" in raw) {
      return [[raw.event, raw.data]];
    }
    return Object.entries(raw);
  }
  return [];
};

export const useRocketLeagueSocket = (url: string = "ws://localhost:49122") => {
  const [state, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);
        for (const [eventName, payload] of normalizeEvent(raw)) {
          dispatch({ type: eventName, payload });
        }
      } catch (err) {
        console.error("WebSocket error: Invalid JSON", err);
      }
    };

    return () => socket.close();
  }, [url]);

  return state;
};

export default useRocketLeagueSocket;
