import { memo, useRef } from "react";
import {
  PayloadStorage,
  useEventSelector,
} from "@four-leaf-studios/rl-socket-hook";

export type UseEventSelector = typeof useEventSelector;

type RenderCounterProps<E extends keyof PayloadStorage, U> = {
  event: E;
  selector: (payload: PayloadStorage[E]) => U;
};

export const RenderCounter = memo(
  <E extends keyof PayloadStorage & string, U>({
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
