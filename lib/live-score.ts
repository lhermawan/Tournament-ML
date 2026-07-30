import { getLeagueData } from "@/lib/data";
import { isMatchFinished } from "@/lib/tournament";

export async function getLiveScoreData() {
  const { season, matches, playerStandings, standings, teams } = await getLeagueData();
  const orderedMatches = [...matches].sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));
  const matchNumberById = new Map<string, number>();

  const matchesPerDay = new Map<number, number>();

  orderedMatches.forEach((match) => {
    const matchNumber = (matchesPerDay.get(match.week) ?? 0) + 1;
    matchesPerDay.set(match.week, matchNumber);
    matchNumberById.set(match.id, matchNumber);
  });
  const liveMatch = matches.find((match) => !isMatchFinished(match)) ?? null;
  const lastMatch = [...matches].reverse().find((match) => isMatchFinished(match)) ?? null;
  const featuredMatch = liveMatch ?? lastMatch;

  const teamA = featuredMatch ? teams.find((team) => team.id === featuredMatch.teamAId) : null;
  const teamB = featuredMatch ? teams.find((team) => team.id === featuredMatch.teamBId) : null;

  return {
    tournament: "Mobile Legends Diskominfo League",
    season: season?.name ?? "Season Internal 2026",
    status: liveMatch ? "live" : lastMatch ? "finished" : "waiting",
    updatedAt: new Date().toISOString(),
    match: featuredMatch
      ? {
          id: featuredMatch.id,
          week: featuredMatch.week,
          matchNumberOfDay: matchNumberById.get(featuredMatch.id) ?? 1,
          teamA: {
            id: featuredMatch.teamAId,
            name: featuredMatch.teamAName,
            score: featuredMatch.scoreA ?? 0,
            power: teamA?.power ?? 0
          },
          teamB: {
            id: featuredMatch.teamBId,
            name: featuredMatch.teamBName,
            score: featuredMatch.scoreB ?? 0,
            power: teamB?.power ?? 0
          },
          winnerId: featuredMatch.winnerId ?? null,
          mvp: featuredMatch.mvp ?? null,
          games: featuredMatch.games ?? []
        }
      : null,
    upcomingMatches: matches
      .filter((match) => !isMatchFinished(match))
      .slice(0, 4)
      .map((match) => ({
        id: match.id,
        week: match.week,
        matchNumberOfDay: matchNumberById.get(match.id) ?? 1,
        teamAName: match.teamAName,
        teamBName: match.teamBName
      })),
    standings: standings.slice(0, 4).map((standing, index) => ({
      rank: index + 1,
      teamId: standing.teamId,
      teamName: standing.teamName,
      played: standing.played,
      win: standing.win,
      draw: standing.draw,
      loss: standing.loss,
      points: standing.points,
      gameDiff: standing.gameDiff
    })),
    bestPlayers: playerStandings.slice(0, 5)
  };
}
