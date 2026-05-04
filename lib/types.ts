export const ROLES = ["Jungler", "Mid Lane", "Gold Lane", "EXP Lane", "Roamer"] as const;
export const RANKS = ["Master", "Grandmaster", "Epic", "Legend", "Mythic"] as const;

export type PlayerRole = (typeof ROLES)[number];
export type Rank = (typeof RANKS)[number];
export type UserRole = "admin" | "player";
export type SeasonStatus = "draft" | "registration" | "locked" | "league" | "playoff" | "completed";

export type Player = {
  id: string;
  name: string;
  email?: string;
  nickname: string;
  mlId: string;
  phone: string;
  unit: string;
  rank: Rank;
  mainRole: PlayerRole;
  secondRole?: PlayerRole;
  verified: boolean;
};

export type TeamMember = {
  player: Player;
  laneRole: PlayerRole;
};

export type Team = {
  id: string;
  name: string;
  members: TeamMember[];
  power: number;
};

export type Match = {
  id: string;
  week: number;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  winnerId?: string;
  scoreA?: number;
  scoreB?: number;
  mvp?: string;
  games?: MatchGame[];
};

export type MatchGame = {
  id: string;
  gameNumber: number;
  winnerId?: string;
  winnerName?: string;
  mvpId?: string;
  mvp?: string;
  mvpKills: number;
  mvpDeaths: number;
  mvpAssists: number;
  screenshotUrl?: string;
};

export type Standing = {
  teamId: string;
  teamName: string;
  played: number;
  win: number;
  loss: number;
  points: number;
  gameDiff: number;
};

export type PlayerStanding = {
  playerId: string;
  nickname: string;
  name: string;
  teamName?: string;
  mvpCount: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
};
