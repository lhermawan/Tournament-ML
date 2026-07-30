import type { LucideIcon } from "lucide-react";
import { Award, Skull, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { getLeagueData } from "@/lib/data";

export default async function StatisticsPage() {
  const { playerStandings } = await getLeagueData();
  const bestPlayer = playerStandings[0];
  const mostMvp = [...playerStandings].sort((a, b) => b.mvpCount - a.mvpCount || b.bestScore - a.bestScore)[0];
  const mostChocolate = [...playerStandings].sort((a, b) => b.chocolateCount - a.chocolateCount || b.deaths - a.deaths)[0];
  const mostKills = [...playerStandings].sort((a, b) => b.kills - a.kills)[0];

  return (
    <AppShell>
      <SectionTitle title="Statistik Player" description="Rekap KDA semua pemain dari hasil game, termasuk player terbaik, MVP terbanyak, dan coklat terbanyak." />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HighlightCard icon={Trophy} title="Player Terbaik" player={bestPlayer?.nickname} value={bestPlayer ? `Score ${bestPlayer.bestScore}` : "-"} />
        <HighlightCard icon={Award} title="MVP Terbanyak" player={mostMvp?.nickname} value={`${mostMvp?.mvpCount ?? 0} MVP`} />
        <HighlightCard icon={Skull} title="Coklat Terbanyak" player={mostChocolate?.nickname} value={`${mostChocolate?.chocolateCount ?? 0} game`} />
        <HighlightCard icon={Sparkles} title="Kill Terbanyak" player={mostKills?.nickname} value={`${mostKills?.kills ?? 0} kill`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Semua Player</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Coklat dihitung otomatis untuk player dengan death tertinggi per game. Score terbaik = MVP, KDA, kill, assist, dikurangi penalti coklat.</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground"><tr className="border-b border-border"><th className="py-3 pr-3">#</th><th className="py-3 pr-3">Player</th><th className="py-3 pr-3">Team</th><th className="py-3 pr-3">Game</th><th className="py-3 pr-3">K/D/A</th><th className="py-3 pr-3">KDA</th><th className="py-3 pr-3">MVP</th><th className="py-3 pr-3">Coklat</th><th className="py-3 pr-3">Score</th></tr></thead>
            <tbody>{playerStandings.map((player, index) => (<tr key={player.playerId} className="border-b border-border/70"><td className="py-3 pr-3 font-bold">{index + 1}</td><td className="py-3 pr-3"><p className="font-bold">{player.nickname}</p><p className="text-xs text-muted-foreground">{player.name}</p></td><td className="py-3 pr-3">{player.teamName ?? "-"}</td><td className="py-3 pr-3">{player.gamesPlayed}</td><td className="py-3 pr-3 font-semibold">{player.kills}/{player.deaths}/{player.assists}</td><td className="py-3 pr-3"><Badge tone="primary">{player.kda}</Badge></td><td className="py-3 pr-3"><Badge tone="success">{player.mvpCount}</Badge></td><td className="py-3 pr-3"><Badge tone={player.chocolateCount ? "warning" : "neutral"}>{player.chocolateCount}</Badge></td><td className="py-3 pr-3 font-black">{player.bestScore}</td></tr>))}</tbody>
          </table>
          {!playerStandings.length && <p className="py-6 text-sm text-muted-foreground">Belum ada statistik game yang tersimpan.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function HighlightCard({ icon: Icon, title, player, value }: { icon: LucideIcon; title: string; player?: string; value: string }) {
  return (<Card><CardHeader className="flex flex-row items-center justify-between gap-3"><CardTitle>{title}</CardTitle><Icon className="h-5 w-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-black">{player ?? "-"}</p><p className="text-xs font-semibold text-muted-foreground">{value}</p></CardContent></Card>);
}
