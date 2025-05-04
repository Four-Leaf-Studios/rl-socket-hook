import React from "react";
import { useRocketLeagueSocket } from "@four-leaf-studios/rl-socket-hook";

const WebsocketData = () => {
  const data = useRocketLeagueSocket();

  return (
    <>
      <div style={{ fontFamily: "monospace", padding: "1rem" }}>
        <h1>Rocket League Live Events</h1>
        {Object.entries(data).map(([event, payload]) => (
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
      </div>
    </>
  );
};

export default WebsocketData;
