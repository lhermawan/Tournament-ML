import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { getLeagueData } from "@/lib/data";

export default async function StandingsPage() {
  const { standings, playerStandings } = await getLeagueData();

  return (
    <AppShell>
      <SectionTitle title="Klasemen" description="Menang 3 poin, kalah 0 poin. Tie break: selisih game." />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[52px_1fr_64px_64px_64px_72px_72px] gap-2 border-b border-border bg-muted px-4 py-3 text-xs font-bold text-muted-foreground">
          <span>#</span>
          <span>Tim</span>
          <span>Main</span>
          <span>W</span>
          <span>L</span>
          <span>GD</span>
          <span>Poin</span>
        </div>
        {standings.map((standing, index) => (
          <div
            key={standing.teamId}
            className="grid grid-cols-[52px_1fr_64px_64px_64px_72px_72px] gap-2 border-b border-border px-4 py-4 text-sm last:border-b-0"
          >
            <span className="font-black">{index + 1}</span>
            <span className="font-bold">
              {standing.teamName} {index < 4 && <Badge tone="warning" className="ml-2">Playoff</Badge>}
            </span>
            <span>{standing.played}</span>
            <span>{standing.win}</span>
            <span>{standing.loss}</span>
            <span>{standing.gameDiff}</span>
            <span className="font-black">{standing.points}</span>
          </div>
        ))}
        {!standings.length && (
          <div className="px-4 py-5 text-sm text-muted-foreground">
            Klasemen belum tersedia karena tim atau jadwal belum dibuat.
          </div>
        )}
      </Card>

      <SectionTitle title="Pemain Terbaik" description="Dihitung dari jumlah MVP game dan KDA MVP selama BO3." />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[52px_1fr_72px_72px_72px_72px_72px] gap-2 border-b border-border bg-muted px-4 py-3 text-xs font-bold text-muted-foreground">
          <span>#</span>
          <span>Player</span>
          <span>MVP</span>
          <span>K</span>
          <span>D</span>
          <span>A</span>
          <span>KDA</span>
        </div>
        {playerStandings.map((player, index) => (
          <div
            key={player.playerId}
            className="grid grid-cols-[52px_1fr_72px_72px_72px_72px_72px] gap-2 border-b border-border px-4 py-4 text-sm last:border-b-0"
          >
            <span className="font-black">{index + 1}</span>
            <span className="font-bold">
              {player.nickname}
              <span className="ml-2 text-xs font-semibold text-muted-foreground">{player.teamName ?? player.name}</span>
            </span>
            <span>{player.mvpCount}</span>
            <span>{player.kills}</span>
            <span>{player.deaths}</span>
            <span>{player.assists}</span>
            <span className="font-black">{player.kda}</span>
          </div>
        ))}
        {!playerStandings.length && (
          <div className="px-4 py-5 text-sm text-muted-foreground">
            Statistik pemain belum tersedia. Isi detail game BO3 dari panel admin.
          </div>
        )}
      </Card>
    </AppShell>
  );
}
