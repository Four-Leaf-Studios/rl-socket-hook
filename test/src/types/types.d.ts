// primitives
export interface Vector3 {
  X: number;
  Y: number;
  Z: number;
}

// game:update_state payloads
export interface BallInfo {
  location: Vector3;
  speed: number;
  team: number;
}

export interface TeamInfo {
  color_primary: string;
  color_secondary: string;
  name: string;
  score: number;
}

export interface GameInfo {
  arena: string;
  ball: BallInfo;
  hasTarget: boolean;
  hasWinner: boolean;
  isOT: boolean;
  isReplay: boolean;
  target: string;
  teams: {
    "0": TeamInfo;
    "1": TeamInfo;
  };
  time: number;
  winner: string;
}

export interface PlayerLocation extends Vector3 {
  pitch: number;
  roll: number;
  yaw: number;
}

export interface PlayerState {
  assists: number;
  attacker: string;
  boost: number;
  cartouches: number;
  demos: number;
  goals: number;
  hasCar: boolean;
  id: string;
  isDead: boolean;
  isPowersliding: boolean;
  isSonic: boolean;
  location: PlayerLocation;
  name: string;
  onGround: boolean;
  onWall: boolean;
  primaryID: string;
  saves: number;
  score: number;
  shortcut: number;
  shots: number;
  speed: number;
  team: number;
  touches: number;
}

export interface GameUpdateState {
  event: string;
  game: GameInfo;
  hasGame: boolean;
  players: Record<string, PlayerState>;
}

// game:ball_hit payload
export interface BallHitEvent {
  ball: {
    location: Vector3;
    post_hit_speed: number;
    pre_hit_speed: number;
  };
  player: {
    id: string;
    name: string;
  };
}

// game:statfeed_event payload
export interface StatfeedTarget {
  id: string;
  name: string;
  team_num: number;
}

export interface StatfeedEvent {
  event_name: string;
  main_target: StatfeedTarget;
  secondary_target: StatfeedTarget;
  type: string;
}

// game:goal_scored payload
export interface BallLastTouch {
  player: string;
  speed: number;
}

export interface ImpactLocation {
  X: number;
  Y: number;
}

export interface Scorer {
  id: string;
  name: string;
  teamnum: number;
}

export interface GoalScoredEvent {
  ball_last_touch: BallLastTouch;
  goalspeed: number;
  impact_location: ImpactLocation;
  scorer: Scorer;
}

// game:match_ended payload
export interface MatchEndedEvent {
  winner_team_num: number;
}

// top‐level mapping of event names → payload types
export type EventPayloads = {
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
};
