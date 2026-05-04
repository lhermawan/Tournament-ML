import type { PlayerRole, Rank, SeasonStatus } from "@/lib/types";

export const roleToDb: Record<PlayerRole, string> = {
  Jungler: "Jungler",
  "Mid Lane": "Mid_Lane",
  "Gold Lane": "Gold_Lane",
  "EXP Lane": "EXP_Lane",
  Roamer: "Roamer"
};

export const roleFromDb: Record<string, PlayerRole> = {
  Jungler: "Jungler",
  Mid_Lane: "Mid Lane",
  Gold_Lane: "Gold Lane",
  EXP_Lane: "EXP Lane",
  Roamer: "Roamer"
};

export const rankToDb: Record<Rank, string> = {
  Master: "Master",
  Grandmaster: "Grandmaster",
  Epic: "Epic",
  Legend: "Legend",
  Mythic: "Mythic"
};

export const statusLabels: Record<SeasonStatus, string> = {
  draft: "Draft",
  registration: "Pendaftaran dibuka",
  locked: "Pendaftaran ditutup",
  league: "Liga berjalan",
  playoff: "Playoff",
  completed: "Selesai"
};
