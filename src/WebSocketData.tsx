// src/WebsocketData.tsx
import React from "react";
import useRocketLeagueSocket from "./useRocketLeagueSocket";
import { PayloadStorage } from "./types";

const STATE_LABELS = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"] as const;

export const WebsocketData: React.FC = () => {
  const { events, readyState, error } = useRocketLeagueSocket<PayloadStorage>();

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <h1>Rocket League Live Events</h1>

      <p>
        <strong>Connection:</strong> {STATE_LABELS[readyState] ?? readyState}
      </p>
      {error && (
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {String(error)}
        </p>
      )}

      {Object.entries(events).map(([event, payload]) => (
        <div
          key={event}
          style={{
            border: "1px solid #ccc",
            marginBottom: "1rem",
            padding: "0.5rem",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>{event}</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      ))}

      {Object.keys(events).length === 0 && <p>No events received yet.</p>}
    </div>
  );
};

export default WebsocketData;
