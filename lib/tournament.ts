import { Match, Player, PlayerRole, ROLES, Rank, Standing, Team } from "@/lib/types";

export const rankPower: Record<Rank, number> = {
  Master: 1,
  Grandmaster: 2,
  Epic: 3,
  Legend: 4,
  Mythic: 5
};

const teamNames = [
  "Team Aster",
  "Team Bravo",
  "Team Cakra",
  "Team Daya",
  "Team Elang",
  "Team Fortuna",
  "Team Garuda",
  "Team Halilintar",
  "Team Inferno",
  "Team Jaya"
];

function seededRandom(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function shuffle<T>(items: T[], seed: number) {
  const random = seededRandom(seed);
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function scoreTeams(teams: Team[]) {
  const powers = teams.map((team) => team.power);
  return Math.max(...powers) - Math.min(...powers);
}

function buildTeams(players: Player[], seed: number): Team[] {
  const verifiedPlayers = players.filter((player) => player.verified);
  const teamCount = Math.floor(verifiedPlayers.length / ROLES.length);
  if (teamCount < 2) return [];

  const selected = new Set<string>();
  const membersByRole = new Map<PlayerRole, Player[]>();

  for (const role of ROLES) {
    const primary = verifiedPlayers.filter(
      (player) => player.mainRole === role && !selected.has(player.id)
    );
    const secondary = verifiedPlayers.filter(
      (player) =>
        player.secondRole === role &&
        player.mainRole !== role &&
        !selected.has(player.id)
    );
    const pool = shuffle([...primary, ...secondary], seed + role.length).slice(0, teamCount);
    pool.forEach((player) => selected.add(player.id));
    membersByRole.set(role, pool);
  }

  const teams: Team[] = Array.from({ length: teamCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: teamNames[index] ?? `Team ${index + 1}`,
    members: [],
    power: 0
  }));

  for (const role of ROLES) {
    const pool = membersByRole.get(role) ?? [];
    const orderedPool = shuffle(pool, seed + role.charCodeAt(0));
    orderedPool.forEach((player, index) => {
      const team = teams[index % teamCount];
      team.members.push({ player, laneRole: role });
      team.power += rankPower[player.rank];
    });
  }

  return teams.filter((team) => team.members.length === ROLES.length);
}

export function generateBalancedTeams(players: Player[], attempts = 150): Team[] {
  let bestTeams: Team[] = [];
  let bestScore = Number.POSITIVE_INFINITY;
  const maxTeamCount = Math.floor(players.filter((player) => player.verified).length / ROLES.length);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const teams = buildTeams(players, attempt * 17);
    if (!teams.length) continue;

    const currentScore = scoreTeams(teams);
    if (teams.length > bestTeams.length || (teams.length === bestTeams.length && currentScore < bestScore)) {
      bestTeams = teams;
      bestScore = currentScore;
    }

    if (teams.length === maxTeamCount && currentScore <= 1) break;
  }

  return bestTeams;
}

export function generateRoundRobin(teams: Team[]): Match[] {
  const schedule: Match[] = [];
  let week = 1;

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      schedule.push({
        id: `match-${i + 1}-${j + 1}`,
        week,
        teamAId: teams[i].id,
        teamBId: teams[j].id,
        teamAName: teams[i].name,
        teamBName: teams[j].name
      });
      week = week === Math.max(1, teams.length - 1) ? 1 : week + 1;
    }
  }

  return schedule.sort((a, b) => a.week - b.week);
}

export function calculateStandings(teams: Team[], matches: Match[]): Standing[] {
  const table = new Map<string, Standing>();

  teams.forEach((team) => {
    table.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      win: 0,
      loss: 0,
      points: 0,
      gameDiff: 0
    });
  });

  matches
    .filter((match) => match.winnerId && match.scoreA !== undefined && match.scoreB !== undefined)
    .forEach((match) => {
      const teamA = table.get(match.teamAId);
      const teamB = table.get(match.teamBId);
      if (!teamA || !teamB || !match.winnerId) return;

      teamA.played += 1;
      teamB.played += 1;
      teamA.gameDiff += (match.scoreA ?? 0) - (match.scoreB ?? 0);
      teamB.gameDiff += (match.scoreB ?? 0) - (match.scoreA ?? 0);

      if (match.winnerId === match.teamAId) {
        teamA.win += 1;
        teamA.points += 3;
        teamB.loss += 1;
      } else {
        teamB.win += 1;
        teamB.points += 3;
        teamA.loss += 1;
      }
    });

  return [...table.values()].sort(
    (a, b) => b.points - a.points || b.gameDiff - a.gameDiff || b.win - a.win
  );
}
