// src/types/rl-socket-hook.d.ts
import {
  GameUpdateState,
  BallHitEvent,
  StatfeedEvent,
  GoalScoredEvent,
  MatchEndedEvent,
} from "./types"; // adjust path if needed

// Must match your runtime import…
declare module "@four-leaf-studios/rl-socket-hook" {
  interface EventPayloads {
    "sos:version": string;
    "game:match_created": string;
    "game:initialized": string;
    "game:pre_countdown_begin": string;
    "game:post_countdown_begin": string;
    "game:update_state": GameUpdateState;
    "game:ball_hit": BallHitEvent;
    "game:statfeed_event": StatfeedEvent;
    "game:goal_scored": GoalScoredEvent;
    "game:replay_start": string;
    "game:replay_will_end": string;
    "game:replay_end": string;
    "game:match_ended": MatchEndedEvent;
    "game:podium_start": string;
    "game:match_destroyed": string;
  }
}
