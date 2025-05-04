# Rocket League WebSocket Hook

A React hook + context provider to connect to Rocket League's WebSocket server (`ws://localhost:49122`) and subscribe to real-time in-game events with fine-grained reactivity.

## Installation

```bash
npm install @four-leaf-studios/rl-socket-hook
```

## Usage with Hook

```tsx
import useRocketLeagueSocket from "@four-leaf-studios/rl-socket-hook";

const Overlay = () => {
  const data = useRocketLeagueSocket();

  const gameState = data["game:update_state"];
  const timer = data["game:clock_updated_seconds"];

  return (
    <div>
      <p>Time Remaining: {timer?.game_time_remaining}</p>
      <p>Is Overtime: {gameState?.game?.isOT ? "Yes" : "No"}</p>
    </div>
  );
};
```

## Usage with Provider + `useEvent`

```tsx
import { RLProvider, useEvent } from "@four-leaf-studios/rl-socket-hook";

const Scoreboard = () => {
  const gameState = useEvent("game:update_state");

  return <p>Blue Score: {gameState?.game?.teams[0]?.score}</p>;
};

const App = () => (
  <RLProvider>
    <Scoreboard />
  </RLProvider>
);
```

## Usage with `useEventSelector`

When you need to subscribe to just a slice of the payload and only rerender when that slice changes, use `useEventSelector`. It defaults to deep‐equality checks but you can pass a custom comparator.

```tsx
import {
  RLProvider,
  useEventSelector,
} from "@four-leaf-studios/rl-socket-hook";

function PlayersRenderCounter() {
  const players = useEventSelector(
    "game:update_state",
    (state) => state?.players ?? []
  );

  return (
    <div>
      <h2>Players:</h2>
      <pre>{JSON.stringify(players, null, 2)}</pre>
    </div>
  );
}

const App = () => (
  <RLProvider>
    <PlayersRenderCounter />
  </RLProvider>
);
```

### API

### `useEventSelector`

```ts
function useEventSelector<E extends keyof PayloadStorage, U>(
  eventName: E,
  selector: (payload: PayloadStorage[E] | undefined) => U,
  isEqual?: (a: U, b: U) => boolean
): U;
```

- **`eventName`**: The key of the event to subscribe to.
- **`selector`**: A function that receives the full event payload (or `undefined`) and returns the piece of data you care about.
- **`isEqual`** _(optional)_: Custom comparator for previous vs. next selector results. Defaults to a built-in deepEqual.

## Features

- ⚽ Real-time Rocket League WebSocket data
- 🧠 React Context + fine-grained selectors via `useEventSelector`
- ⏱️ Subscribe to full payloads with `useEvent`
- 🛠️ TypeScript support out of the box
- 🔌 Configurable WebSocket endpoint

## License

MIT
