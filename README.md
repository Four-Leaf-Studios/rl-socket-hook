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

## Usage with Provider + useEvent

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

## Features

- ⚽ Real-time Rocket League WebSocket data
- 🧠 React Context + memoized selectors via `useEvent`
- 🛠️ TypeScript support out of the box
- 🔌 WebSocket endpoint configurable

## License

MIT
