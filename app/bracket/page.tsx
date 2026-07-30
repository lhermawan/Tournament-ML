import { GitBranch, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getLeagueData } from "@/lib/data";
import { isMatchFinished } from "@/lib/tournament";
import type { Match, Standing } from "@/lib/types";

const bracketSlots = [
  { key: "match1", label: "Match 1", helper: "Upper Semifinal", teamA: "Peringkat 1", teamB: "Peringkat 4", className: "lg:col-start-1 lg:row-start-1" },
  { key: "match2", label: "Match 2", helper: "Upper Semifinal", teamA: "Peringkat 2", teamB: "Peringkat 3", className: "lg:col-start-1 lg:row-start-2" },
  { key: "match3", label: "Match 3", helper: "Upper Final", teamA: "Pemenang Match 1", teamB: "Pemenang Match 2", className: "lg:col-start-2 lg:row-start-1 lg:translate-y-16" },
  { key: "match4", label: "Match 4", helper: "Lower Semifinal", teamA: "Kalah Match 1", teamB: "Kalah Match 2", className: "lg:col-start-1 lg:row-start-3" },
  { key: "match5", label: "Match 5", helper: "Lower Final", teamA: "Kalah Match 3", teamB: "Pemenang Match 4", className: "lg:col-start-2 lg:row-start-3" },
  { key: "match6", label: "Match 6", helper: "Grand Final", teamA: "Pemenang Match 3", teamB: "Pemenang Match 5", className: "lg:col-start-3 lg:row-start-2" }
] as const;

export default async function BracketPage() {
  const { season, teams, matches, standings } = await getLeagueData();
  const leagueWeekCount = Math.ceil(((teams.length * (teams.length - 1)) / 2) / 2);
  const playoffMatches = matches.filter((match) => match.week > leagueWeekCount).slice(0, 6);
  const topFour = standings.slice(0, 4);
  const champion = playoffMatches[5]?.winnerId ? getTeamName(playoffMatches[5].winnerId, standings, playoffMatches[5]) : null;

  return (
    <AppShell>
      <SectionTitle
        title="Bracket Playoff"
        description="Top 4 langsung masuk bracket double elimination setelah semua team saling bertemu di fase liga."
      />

      <Card className="mb-6 overflow-hidden border-0 bg-slate-950 p-5 text-white shadow-soft md:p-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.25),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.92))] p-5">
          <div className="absolute inset-0 bracket-grid opacity-40" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-teal-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-teal-100">
                <GitBranch className="h-4 w-4" /> Double Elimination
              </div>
              <h2 className="text-3xl font-black uppercase tracking-wide md:text-4xl">MDL Diskominfo Season 2</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-300">
                {season?.status === "playoff" || season?.status === "completed"
                  ? "Bracket aktif. Match berikutnya akan muncul otomatis setelah hasil match sebelumnya disimpan."
                  : "Bracket akan aktif setelah admin klik Bracket Top 4 dan semua match liga selesai."}
              </p>
            </div>
            <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 p-4 text-center">
              <Trophy className="mx-auto h-8 w-8 text-amber-300" />
              <p className="mt-2 text-xs font-bold uppercase text-amber-100">Champion</p>
              <p className="text-lg font-black">{champion ?? "Menunggu Grand Final"}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {topFour.map((standing, index) => (
          <Card key={standing.teamId} className="bracket-seed p-4" style={{ animationDelay: `${index * 120}ms` }}>
            <p className="text-xs font-black uppercase text-muted-foreground">Seed #{index + 1}</p>
            <p className="mt-1 text-lg font-black">{standing.teamName}</p>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">{standing.points} poin · GD {standing.gameDiff}</p>
          </Card>
        ))}
        {!topFour.length && (
          <Card className="p-4 md:col-span-4">
            <p className="text-sm font-semibold text-muted-foreground">Klasemen belum tersedia untuk menentukan Top 4.</p>
          </Card>
        )}
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-border bg-white p-4 shadow-soft md:p-6">
        <div className="absolute left-8 right-8 top-1/2 hidden h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-200 via-slate-200 to-amber-200 lg:block" />
        <div className="relative grid min-w-[900px] gap-6 lg:grid-cols-3 lg:grid-rows-3">
          {bracketSlots.map((slot, index) => (
            <BracketMatch
              key={slot.key}
              slot={slot}
              match={playoffMatches[index]}
              standings={standings}
              delay={index * 130}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function BracketMatch({
  slot,
  match,
  standings,
  delay
}: {
  slot: (typeof bracketSlots)[number];
  match?: Match;
  standings: Standing[];
  delay: number;
}) {
  const finished = match ? isMatchFinished(match) : false;
  const teamA = match?.teamAName ?? slot.teamA;
  const teamB = match?.teamBName ?? slot.teamB;
  const winnerName = match?.winnerId ? getTeamName(match.winnerId, standings, match) : null;

  return (
    <article className={`bracket-card relative ${slot.className}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -top-3 left-4 rounded-md bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-soft">
        {slot.label}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-950 p-1 shadow-soft">
        <div className="rounded-lg bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">{slot.helper}</p>
            <Badge tone={finished ? "success" : match ? "warning" : "neutral"}>{finished ? "Selesai" : match ? "Siap" : "Menunggu"}</Badge>
          </div>
          <TeamRow name={teamA} score={match?.scoreA} active={match?.winnerId === match?.teamAId} />
          <div className="my-2 h-px bg-border" />
          <TeamRow name={teamB} score={match?.scoreB} active={match?.winnerId === match?.teamBId} />
          {winnerName && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Pemenang: {winnerName}</p>}
        </div>
      </div>
    </article>
  );
}

function TeamRow({ name, score, active }: { name: string; score?: number; active: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 ${active ? "bg-teal-50 text-teal-800" : "bg-muted"}`}>
      <span className="truncate text-sm font-black">{name}</span>
      <span className="text-sm font-black">{score ?? "-"}</span>
    </div>
  );
}

function getTeamName(teamId: string, standings: Standing[], match: Match) {
  return standings.find((standing) => standing.teamId === teamId)?.teamName ?? (match.teamAId === teamId ? match.teamAName : match.teamBName);
}
