import React from "react";
import { useEventSelector } from "@four-leaf-studios/rl-socket-hook";

export default function Scoreboard() {
  // Subscribe only to blue and orange scores & match time
  const blueScore = useEventSelector(
    "game:update_state",
    (s) => s?.game.teams[0].score ?? 0
  );
  const orangeScore = useEventSelector(
    "game:update_state",
    (s) => s?.game.teams[1].score ?? 0
  );
  const timeSeconds = useEventSelector(
    "game:update_state",
    (s) => s?.game.time_seconds ?? 0
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-neutral-800 text-white">
      <span>🔵 {blueScore}</span>
      <span>⏱️ {formatTime(timeSeconds)}</span>
      <span>🟠 {orangeScore}</span>
    </div>
  );
}
