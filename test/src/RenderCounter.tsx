import { memo, useRef } from "react";
import { useEventSelector } from "@four-leaf-studios/rl-socket-hook";

type RenderCounterProps<E extends keyof PayloadStorage, U> = {
  event: E;
  selector: (payload: PayloadStorage[E]) => U;
};

export const RenderCounter = memo(
  <E extends keyof PayloadStorage, U>({
    event,
    selector,
  }: RenderCounterProps<E, U>) => {
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
);

export default RenderCounter;
