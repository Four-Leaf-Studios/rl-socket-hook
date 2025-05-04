@four-leaf-studios/rl-socket-hook

A tiny React wrapper around a Rocket League WebSocket plugin (ws://localhost:49122) that provides three simple hooks and a provider for subscribing to live in-game events by name (e.g. "game:update_state", "game:goal_scored", etc.).

---

## Installation

```bash
npm install @four-leaf-studios/rl-socket-hook
# or
yarn add @four-leaf-studios/rl-socket-hook
```

## Exports & Types

```ts
import {
  /** Wrap your app to provide WS connection */
  RLProvider,
  /** Subscribe to full event payload */
  useEvent,
  /** Subscribe to a selected slice of payload */
  useEventSelector,
  /** Full hook signature type */
  UseEventSelector,
  /** (Optional) helper for { event; selector } props */
  EventSelectorProps,
  /** Internal map of all event→payload types */
  EventPayloads,
  /** Partial view of EventPayloads for generics */
  PayloadStorage,
} from "@four-leaf-studios/rl-socket-hook";
```

### Key Types

- `EventPayloads` — Interface mapping each event name string to its default payload type. Users can augment this interface via declaration-merging.
- `PayloadStorage` — `Partial<EventPayloads>`; used internally for generic constraints.
- `UseEventSelector` — `typeof useEventSelector`; full generic call signature for introspection.
- `EventSelectorProps<E, U>` — `{ event: E; selector: (payload: PayloadStorage[E] | undefined) => U }` derived from `UseEventSelector` parameters.

---

## Usage

### `<RLProvider>`

Wrap your application (or subtree) so that the WebSocket connection is established and a React context is provided.

```tsx
import { RLProvider } from "@four-leaf-studios/rl-socket-hook";

function App() {
  return <RLProvider url="ws://localhost:49122">{/* children */}</RLProvider>;
}
```

- **Props**
  - `url?: string` — custom WebSocket URL (defaults to `ws://localhost:49122`).

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

- **Signature**
  ```ts
  function useEvent<E extends keyof PayloadStorage>(
    eventName: E
  ): PayloadStorage[E] | undefined;
  ```

### `useEventSelector(eventName, selector, isEqual?)`

Subscribe to a _slice_ of an event’s payload; re-renders only when that slice actually changes (deep-equal by default).

```tsx
import { useEventSelector } from "@four-leaf-studios/rl-socket-hook";

const score = useEventSelector(
  "game:update_state",
  (s) => s?.game.teams[0].score
);
```

- **Signature**

  ```ts
  function useEventSelector<E extends keyof PayloadStorage, U>(
    eventName: E,
    selector: (payload: PayloadStorage[E] | undefined) => U,
    isEqual?: (a: U, b: U) => boolean
  ): U;
  ```

- **Generics**
  - `E` — event name key
  - `U` — result of your selector

---

## Example: `<RenderCounter>`

A simple helper component that shows how many times a selector-based hook re-renders, useful for performance debugging.

```tsx
import {
  PayloadStorage,
  useEventSelector,
  EventSelectorProps,
} from "@four-leaf-studios/rl-socket-hook";
import React, { memo, useRef } from "react";

function RenderCounterComponent<E extends keyof PayloadStorage & string, U>({
  event,
  selector,
}: EventSelectorProps<E, U>) {
  const value = useEventSelector(event, selector);
  const renders = useRef(0);
  renders.current++;

  return (
    <div>
      <p>Renders: {renders.current}</p>
      <p>
        {event} value: {JSON.stringify(value)}
      </p>
    </div>
  );
}

export const RenderCounter = memo(RenderCounterComponent) as <
  E extends keyof PayloadStorage & string,
  U
>(
  props: EventSelectorProps<E, U>
) => JSX.Element;
```

And in your app:

```tsx
import { RLProvider } from "@four-leaf-studios/rl-socket-hook";
import { RenderCounter } from "./RenderCounter";

function App() {
  return (
    <RLProvider>
      <RenderCounter event="game:update_state" selector={(s) => s?.players} />
      {/* other components */}
    </RLProvider>
  );
}
```

---

That’s it—dead-simple, fully-typed, zero-dependency, and easily overridden via TypeScript declaration-merging. Enjoy real-time Rocket League data in React!
