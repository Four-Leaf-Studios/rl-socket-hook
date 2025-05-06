# @four-leaf-studios/rl-socket-hook

A tiny React wrapper around a Rocket League WebSocket plugin (`ws://localhost:49122`). It provides:

- **`<RLProvider>`**: React context provider for WebSocket events.
- **`useEvent`**: Subscribe to entire event payloads.
- **`useEventSelector`**: Subscribe to specific slices of event payloads.
- **`useRocketLeagueSocket`**: Low-level hook for raw event data.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core API](#core-api)
   - [RLProvider](#rlprovider)
   - [useEvent](#useevent)
   - [useEventSelector](#useeventselector)
   - [useRocketLeagueSocket](#userocketleaguesocket)
4. [Examples](#examples)
   - [Overlay Component](#overlay-component)
   - [Scoreboard](#scoreboard)
   - [Raw Event Dump](#raw-event-dump)
5. [TypeScript Support](#typescript-support)
   - [Built-in Types](#built-in-types)
   - [Extending EventPayloads](#extending-eventpayloads)
6. [Contributing](#contributing)
7. [License](#license)

## Installation

```bash
npm install @four-leaf-studios/rl-socket-hook
# or
yarn add @four-leaf-studios/rl-socket-hook
```

## Quick Start

```tsx
import {
  RLProvider,
  useEvent,
  useEventSelector,
} from "@four-leaf-studios/rl-socket-hook";

function App() {
  return (
    <RLProvider url="ws://localhost:49122">
      <Scoreboard />
      <Overlay />
    </RLProvider>
  );
}
```

## Core API

### `RLProvider`

Wrap your app to initialize the WebSocket connection and provide context.

```tsx
<RLProvider url="ws://localhost:49122">{children}</RLProvider>
```

- **`url`** (string): WebSocket URL. Default: `ws://localhost:49122`.
- **`children`**: React nodes.

---

### `useEvent(eventName)`

Subscribe to the full payload of an event.

```tsx
const gameState = useEvent("game:update_state");
```

- **Parameters**:
  - `eventName`: key from `EventPayloads`.
- **Returns**: Payload object or `undefined`.

---

### `useEventSelector(eventName, selector, isEqual?)`

Subscribe to a specific slice of the payload to minimize re-renders.

```tsx
const blueScore = useEventSelector(
  "game:update_state",
  (s) => s.game.teams[0].score ?? 0
);
```

- **Parameters**:
  - `eventName`: string key.
  - `selector`: `(payload) => slice`.
  - `isEqual?`: optional custom equality function.
- **Returns**: Selected slice value.

---

### `useRocketLeagueSocket`

Low-level hook returning a map of all event payloads.

```tsx
import { useRocketLeagueSocket } from "@four-leaf-studios/rl-socket-hook";
const allEvents = useRocketLeagueSocket();
```

- **Returns**: `{ [eventName]: payload }`.

## Examples

### Overlay Component

Full overlay UI with scores and players.

```tsx
function Overlay() {
  const gameState = useEvent("game:update_state");
  if (!gameState) return null;

  const time = formatTime(gameState.game.time_seconds);
  const blueScore = gameState.game.teams[0].score;
  const orangeScore = gameState.game.teams[1].score;
  // ...
}
```

---

### Scoreboard

Render only necessary fields:

```tsx
function Scoreboard() {
  const blueScore = useEventSelector(
    "game:update_state",
    (s) => s.game.teams[0].score ?? 0
  );
  const orangeScore = useEventSelector(
    "game:update_state",
    (s) => s.game.teams[1].score ?? 0
  );
  const time = useEventSelector(
    "game:update_state",
    (s) => s.game.time_seconds ?? 0
  );

  return (
    <div className="flex items-center space-x-4 p-4 bg-neutral-800 text-white">
      <span>🔵 {blueScore}</span>
      <span>⏱️ {formatTime(time)}</span>
      <span>🟠 {orangeScore}</span>
    </div>
  );
}
```

---

### Raw Event Dump

Debug all incoming events:

```tsx
function RawDump() {
  const data = useRocketLeagueSocket();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## TypeScript Support

### Built-in Types

All event payloads are typed in the `EventPayloads` interface. Import as needed:

```ts
import type {
  GameUpdateState,
  GoalScoredEvent,
  EventPayloads,
} from "@four-leaf-studios/rl-socket-hook";
```

### Extending `EventPayloads`

Use declaration merging to override or extend event types:

```ts
// src/types/rl-socket-hook.d.ts
import type { GameUpdateState } from "@four-leaf-studios/rl-socket-hook";

declare module "@four-leaf-studios/rl-socket-hook" {
  interface EventPayloads {
    "game:update_state": GameUpdateState;
    "my:custom_event": { foo: string };
  }
}
```

## Contributing

PRs welcome. Please open issues for features or bugs.

## License

MIT © Four Leaf Studios
