import { useEffect, useReducer } from "react";

type EventMap = {
  [eventName: string]: any;
};

type Action = {
  type: string;
  payload: any;
};

const reducer = (state: EventMap, action: Action): EventMap => ({
  ...state,
  [action.type]: action.payload,
});

const normalizeEvent = (raw: any): [string, any][] => {
  if (typeof raw === "object") {
    // Format 1: { event: "game:update_state", data: { ... } }
    if (typeof raw.event === "string" && "data" in raw) {
      return [[raw.event, raw.data]];
    }
    // Format 2: { "game:update_state": { ... }, "game:goal_scored": { ... } }
    return Object.entries(raw);
  }

  return [];
};

const useRocketLeagueSocket = (url: string = "ws://localhost:49122") => {
  const [state, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const events = normalizeEvent(rawData);

        events.forEach(([eventName, payload]) => {
          dispatch({ type: eventName, payload });
        });
      } catch (err) {
        console.error("WebSocket error: Invalid JSON", err);
      }
    };

    return () => socket.close();
  }, [url]);

  return state;
};

export default useRocketLeagueSocket;
