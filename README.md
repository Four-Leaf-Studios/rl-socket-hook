# @four-leaf-studios/rl-socket-hook

A tiny React wrapper around a Rocket League WebSocket plugin (ws://localhost:49122) that provides three simple hooks and a provider for subscribing to live in-game events by name (e.g. "game:update_state", "game:goal_scored", etc.).

## Installation

```bash
npm install @four-leaf-studios/rl-socket-hook
# or
yarn add @four-leaf-studios/rl-socket-hook
```

## Exports & Types

```ts
import {
  RLProvider,
  useEvent,
  useEventSelector,
  UseEventSelector,
  EventSelectorProps,
  EventPayloads,
  PayloadStorage,
} from "@four-leaf-studios/rl-socket-hook";
```

## Usage

### `<RLProvider>`

Wrap your application (or subtree) so that the WebSocket connection is established and a React context is provided.

```tsx
import { RLProvider } from "@four-leaf-studios/rl-socket-hook";

function App() {
  return <RLProvider url="ws://localhost:49122">{/* children */}</RLProvider>;
}
```

### `useEvent(eventName)`

Subscribe to the _entire_ payload of a given event.

```tsx
import { useEvent } from "@four-leaf-studios/rl-socket-hook";

function Overlay() {
  const gameState = useEvent("game:update_state");
  if (!gameState) return null;
  return <div>Blue score: {gameState.game.teams[0].score}</div>;
}
```

### `useEventSelector(eventName, selector, isEqual?)`

```tsx
import { useEventSelector } from "@four-leaf-studios/rl-socket-hook";

const score = useEventSelector(
  "game:update_state",
  (s) => s?.game.teams[0].score
);
```

## Examples

### Overlay Component

```tsx
import React from "react";
import { useEvent } from "@four-leaf-studios/rl-socket-hook";

export default function Overlay() {
  const gameState = useEvent("game:update_state");

  const timeConvert = (timee: number) => {
    if (isNaN(timee)) return "0:00";
    const min = Math.floor(timee / 60);
    const sec = timee % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const blueScore = gameState?.game?.teams?.[0]?.score ?? 0;
  const orangeScore = gameState?.game?.teams?.[1]?.score ?? 0;
  const time = gameState?.game?.time_seconds ?? 0;
  const players = gameState?.players ?? {};

  const bluePlayers = Object.values(players).filter((p) => p.team === 0);
  const orangePlayers = Object.values(players).filter((p) => p.team === 1);

  return (
    <div
      className="h-screen text-white bg-transparent"
      style={{
        width: 1920,
        height: 1080,
        background: "blue",
        position: "relative",
      }}
    >
      {/* scoreboard and players UI */}
    </div>
  );
}
```

### WebsocketData Component

```tsx
import React from "react";
import { useRocketLeagueSocket } from "@four-leaf-studios/rl-socket-hook";

const WebsocketData = () => {
  const data = useRocketLeagueSocket();

  return (
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
  );
};

export default WebsocketData;
```

## Customizing your event types

By default, `@four-leaf-studios/rl-socket-hook` ships a full `EventPayloads` mapping of every Rocket League event → payload type. You can:

1. **Import** any of those payload types directly for your own helpers or props.
2. **Declaration-merge** `EventPayloads` to add, remove, or override exactly the subset of events you care about.

---

### 1. Importing built-in payload types

```ts
// anywhere in your TS code
import type {
  Vector3,
  GameUpdateState,
  BallHitEvent,
  StatfeedEvent,
  GoalScoredEvent,
  MatchEndedEvent,
  EventPayloads,
} from "@four-leaf-studios/rl-socket-hook";

// e.g. reuse a type for your own selector props:
type MyScoreSelector = (s: EventPayloads["game:update_state"]) => number;
```

---

### 2. Declaration-merging `EventPayloads`

Create a `.d.ts` file (e.g. `src/types/rl-socket-hook.d.ts`) alongside your TS config:

```ts
// src/types/rl-socket-hook.d.ts
import type {
  GameUpdateState,
  BallHitEvent,
  StatfeedEvent,
  GoalScoredEvent,
  MatchEndedEvent,
} from "@four-leaf-studios/rl-socket-hook";

declare module "@four-leaf-studios/rl-socket-hook" {
  interface EventPayloads {
    // only include or override the events you need:
    "game:update_state": GameUpdateState;
    "game:ball_hit": BallHitEvent;
    "game:statfeed_event": StatfeedEvent;
    "game:goal_scored": GoalScoredEvent;
    "game:match_ended": MatchEndedEvent;

    // you can still add any others if desired:
    "sos:version": string;
  }
}
```
