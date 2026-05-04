import { CalendarDays, Medal, Radio, ShieldCheck, Trophy, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { StatCard } from "@/components/stat-card";
import { getLeagueData } from "@/lib/data";
import { getLiveScoreData } from "@/lib/live-score";

export default async function HomePage() {
  const { isDemo, season, matches, players, standings, teams } = await getLeagueData();
  const liveScore = await getLiveScoreData();
  const nextMatches = matches.filter((match) => !match.winnerId).slice(0, 4);

  return (
    <AppShell>
      <section className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg bg-slate-950 p-6 text-white shadow-soft md:p-8">
          <Badge tone="warning">{isDemo ? "Demo mode" : season?.status ?? "No season"}</Badge>
          <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-normal md:text-5xl">
            Mobile Legends Diskominfo League
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Sistem turnamen internal dengan auto team balancer agar komposisi role dan power rank tetap adil.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-white/10 p-4">
              <p className="text-2xl font-black">{teams.length}</p>
              <p className="text-xs text-slate-300">Tim aktif</p>
            </div>
            <div className="rounded-md bg-white/10 p-4">
              <p className="text-2xl font-black">{matches.length}</p>
              <p className="text-xs text-slate-300">Match liga</p>
            </div>
            <div className="rounded-md bg-white/10 p-4">
              <p className="text-2xl font-black">Top 4</p>
              <p className="text-xs text-slate-300">Masuk playoff</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Top Klasemen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {standings.slice(0, 4).map((standing, index) => (
              <div key={standing.teamId} className="flex items-center justify-between rounded-md bg-muted p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-black">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{standing.teamName}</p>
                    <p className="text-xs text-muted-foreground">GD {standing.gameDiff}</p>
                  </div>
                </div>
                <Badge tone="primary">{standing.points} poin</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Peserta" value={players.length} icon={UsersRound} helper="Terverifikasi" />
        <StatCard label="Tim" value={teams.length} icon={ShieldCheck} helper="Role lengkap" />
        <StatCard label="Jadwal" value={matches.length} icon={CalendarDays} helper="Round robin" />
        <StatCard label="Match selesai" value={matches.filter((match) => match.winnerId).length} icon={Trophy} helper="Klasemen live" />
      </div>

      <section className="mb-8">
        <SectionTitle title="Live Score" description="Data ini juga tersedia sebagai API untuk overlay live streaming." />
        <Card className="overflow-hidden">
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {liveScore.match ? (
              <>
                <div className="rounded-md bg-muted p-5 text-center">
                  <p className="text-sm font-bold text-muted-foreground">Team A</p>
                  <p className="mt-2 text-xl font-black">{liveScore.match.teamA.name}</p>
                  <p className="mt-3 text-5xl font-black">{liveScore.match.teamA.score}</p>
                </div>
                <div className="text-center">
                  <Badge tone={liveScore.status === "live" ? "success" : "warning"}>
                    {liveScore.status === "live" ? "LIVE" : "LAST MATCH"}
                  </Badge>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm font-black text-muted-foreground">
                    <Radio className="h-4 w-4 text-primary" />
                    Week {liveScore.match.week}
                  </div>
                  <div className="mt-3 rounded-md bg-amber-100 px-3 py-2">
                    <p className="text-xs font-bold text-amber-800">MVP</p>
                    <p className="text-sm font-black text-amber-950">{liveScore.match.mvp ?? "Belum dipilih"}</p>
                  </div>
                  <p className="mt-3 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-muted-foreground">
                    API: /api/live-score
                  </p>
                </div>
                <div className="rounded-md bg-muted p-5 text-center">
                  <p className="text-sm font-bold text-muted-foreground">Team B</p>
                  <p className="mt-2 text-xl font-black">{liveScore.match.teamB.name}</p>
                  <p className="mt-3 text-5xl font-black">{liveScore.match.teamB.score}</p>
                </div>
              </>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground lg:col-span-3">
                Belum ada match untuk live score. API tetap tersedia di `/api/live-score`.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <SectionTitle title="Jadwal Terdekat" description="Match berikutnya dalam fase liga." />
        <div className="grid gap-4 md:grid-cols-2">
          {nextMatches.map((match) => (
            <Card key={match.id} className="p-5">
              <div className="flex items-center justify-between">
                <Badge>Week {match.week}</Badge>
                <Medal className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                <p className="font-bold">{match.teamAName}</p>
                <span className="text-xs font-black text-muted-foreground">VS</span>
                <p className="font-bold">{match.teamBName}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
