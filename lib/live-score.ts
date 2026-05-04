import { getLeagueData } from "@/lib/data";

export async function getLiveScoreData() {
  const { season, matches, playerStandings, standings, teams } = await getLeagueData();
  const liveMatch = matches.find((match) => !match.winnerId) ?? null;
  const lastMatch = [...matches].reverse().find((match) => match.winnerId) ?? null;
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
    standings: standings.slice(0, 4).map((standing, index) => ({
      rank: index + 1,
      teamId: standing.teamId,
      teamName: standing.teamName,
      played: standing.played,
      win: standing.win,
      loss: standing.loss,
      points: standing.points,
      gameDiff: standing.gameDiff
    })),
    bestPlayers: playerStandings.slice(0, 5)
  };
}
