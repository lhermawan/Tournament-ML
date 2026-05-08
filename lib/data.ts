import { demoMatches, demoPlayers, demoStandings, demoTeams } from "@/lib/demo-data";
import { roleFromDb } from "@/lib/enum-map";
import { calculateStandings } from "@/lib/tournament";
import type { Match, Player, PlayerStanding, SeasonStatus, Team } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export async function getLeagueData() {
  if (!process.env.DATABASE_URL) {
    console.warn("[getLeagueData] DATABASE_URL tidak ditemukan. Menggunakan mode demo.");
    return getDemoData();
  }

  try {
    const season = await prisma.season.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        teams: {
          include: {
            members: {
              include: {
                player: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        matches: {
          include: {
            teamA: true,
            teamB: true,
            mvp: true,
            games: {
              include: {
                winner: true,
                mvp: true
              },
              orderBy: { gameNumber: "asc" }
            }
          },
          orderBy: [{ week: "asc" }, { createdAt: "asc" }]
        }
      }
    });

    const players = await prisma.player.findMany({
      include: { user: true },
      orderBy: { createdAt: "asc" }
    });

    if (!season) {
      const mappedPlayers = mapPlayers(players);
      return {
        isDemo: false,
        season: null,
        players: mappedPlayers,
        teams: [] as Team[],
        matches: [] as Match[],
        standings: [],
        playerStandings: calculatePlayerStandings(mappedPlayers, [], [])
      };
    }

    const teams = season.teams.map((team) => ({
      id: team.id,
      name: team.teamName,
      power: team.power,
      members: team.members.map((member) => ({
        laneRole: roleFromDb[member.laneRole],
        player: mapPlayer(member.player)
      }))
    }));

    const matches = season.matches.map((match) => ({
      id: match.id,
      week: match.week,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      teamAName: match.teamA.teamName,
      teamBName: match.teamB.teamName,
      winnerId: match.winnerId ?? undefined,
      scoreA: match.scoreA ?? undefined,
      scoreB: match.scoreB ?? undefined,
      mvp: match.mvp?.nickname,
      games: match.games.map((game) => ({
        id: game.id,
        gameNumber: game.gameNumber,
        winnerId: game.winnerId ?? undefined,
        winnerName: game.winner?.teamName,
        mvpId: game.mvpId ?? undefined,
        mvp: game.mvp?.nickname,
        mvpKills: game.mvpKills,
        mvpDeaths: game.mvpDeaths,
        mvpAssists: game.mvpAssists,
        screenshotUrl: game.screenshotUrl ?? undefined
      }))
    }));
    const mappedPlayers = mapPlayers(players);

    return {
      isDemo: false,
      season: {
        id: season.id,
        name: season.name,
        status: season.status as SeasonStatus
      },
      players: mappedPlayers,
      teams,
      matches,
      standings: calculateStandings(teams, matches),
      playerStandings: calculatePlayerStandings(mappedPlayers, teams, matches)
    };
  } catch (error) {
    const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[getLeagueData] Gagal terhubung/memuat data database. Beralih ke mode demo. Penyebab: ${reason}`);
    return getDemoData();
  }
}

function getDemoData() {
  return {
    isDemo: true,
    season: {
      id: "demo-season",
      name: "Season Internal 2026",
      status: "league" as SeasonStatus
    },
    players: demoPlayers,
    teams: demoTeams,
    matches: demoMatches,
    standings: demoStandings,
    playerStandings: [] as PlayerStanding[]
  };
}

function mapPlayers(players: Array<Parameters<typeof mapPlayer>[0]>) {
  return players.map(mapPlayer);
}

function calculatePlayerStandings(players: ReturnType<typeof mapPlayers>, teams: Team[], matches: Match[]): PlayerStanding[] {
  const teamByPlayer = new Map<string, string>();
  teams.forEach((team) => {
    team.members.forEach((member) => {
      teamByPlayer.set(member.player.id, team.name);
    });
  });

  const table = new Map<string, PlayerStanding>();
  players.forEach((player) => {
    table.set(player.id, {
      playerId: player.id,
      nickname: player.nickname,
      name: player.name,
      teamName: teamByPlayer.get(player.id),
      mvpCount: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      kda: 0
    });
  });

  matches.forEach((match) => {
    match.games?.forEach((game) => {
      if (!game.mvpId) return;
      const row = table.get(game.mvpId);
      if (!row) return;

      row.mvpCount += 1;
      row.kills += game.mvpKills;
      row.deaths += game.mvpDeaths;
      row.assists += game.mvpAssists;
      row.kda = Number(((row.kills + row.assists) / Math.max(1, row.deaths)).toFixed(2));
    });
  });

  return [...table.values()]
    .filter((player) => player.mvpCount > 0 || player.kills > 0 || player.assists > 0)
    .sort((a, b) => b.mvpCount - a.mvpCount || b.kda - a.kda || b.kills - a.kills);
}

function mapPlayer(player: {
  id: string;
  user?: { name: string; email?: string } | null;
  nickname: string;
  mlId: string;
  phone: string;
  unit: string;
  rank: string;
  mainRole: string;
  secondRole: string | null;
  verified: boolean;
}): Player {
  return {
    id: player.id,
    name: player.user?.name ?? player.nickname,
    email: player.user?.email,
    nickname: player.nickname,
    mlId: player.mlId,
    phone: player.phone,
    unit: player.unit,
    rank: player.rank as Player["rank"],
    mainRole: roleFromDb[player.mainRole],
    secondRole: player.secondRole ? roleFromDb[player.secondRole] : undefined,
    verified: player.verified
  };
}
