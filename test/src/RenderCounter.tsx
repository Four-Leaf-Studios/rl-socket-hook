import { memo, useRef } from "react";
import { useEvent } from "@four-leaf-studios/rl-socket-hook/RLProvider";

export const RenderCounter = memo(({ event }: { event: string }) => {
  const data = useEvent(event);
  const renders = useRef(0);
  renders.current++;

  return (
    <div>
      <p>
        {event} value: {JSON.stringify(data)}
      </p>
      <p>Renders: {renders.current}</p>
    </div>
  );
});

export default RenderCounter;
