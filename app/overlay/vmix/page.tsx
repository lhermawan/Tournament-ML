import { getLiveScoreData } from "@/lib/live-score";

export const dynamic = "force-dynamic";

type OverlayType = "score" | "schedule" | "mvp" | "standings";

type VMixOverlayPageProps = {
  searchParams?: Promise<{
    overlay?: string;
  }>;
};

export default async function VMixOverlayPage({ searchParams }: VMixOverlayPageProps) {
  const data = await getLiveScoreData();
  const params = await searchParams;
  const overlay = normalizeOverlay(params?.overlay);
  const match = data.match;
  const statusLabel = data.status === "live" ? "LIVE NOW" : data.status === "finished" ? "LAST MATCH" : "STANDBY";

  return (
    <main className="min-h-screen overflow-hidden bg-[#00ff00] p-6 text-white">
      <meta httpEquiv="refresh" content="5" />
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center">
        {overlay === "score" && (
          <section className="w-full max-w-6xl rounded-[28px] border border-cyan-300/25 bg-slate-950/85 p-5 shadow-[0_0_45px_rgba(34,211,238,0.25)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-200">{data.tournament}</p>
                <h1 className="mt-1 text-3xl font-black uppercase italic tracking-tight text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.7)]">
                  {data.season}
                </h1>
              </div>
              <div className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/35 px-5 py-2 text-sm font-black uppercase tracking-[0.28em] text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.45)]">
                {statusLabel}
              </div>
            </div>

            {match ? (
              <div className="grid grid-cols-[1fr_170px_1fr] items-center gap-5">
                <TeamScore name={match.teamA.name} score={match.teamA.score} power={match.teamA.power} active={match.winnerId === match.teamA.id} />
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-100/80">Day {match.week} Match {match.matchNumberOfDay}</p>
                  <div className="my-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-5xl font-black italic shadow-inner shadow-cyan-300/10">
                    VS
                  </div>
                  <p className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
                    {match.mvp ? `MVP ${match.mvp}` : "Best of Series"}
                  </p>
                </div>
                <TeamScore name={match.teamB.name} score={match.teamB.score} power={match.teamB.power} active={match.winnerId === match.teamB.id} />
              </div>
            ) : (
              <EmptyOverlayText text="Menunggu match dimulai" />
            )}
          </section>
        )}

        {overlay === "schedule" && (
          <GlassPanel title="Jadwal Berikutnya" accent="cyan">
            <div className="space-y-3">
              {data.upcomingMatches.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/80">
                    <span>Day {item.week}</span>
                    <span>Match {item.matchNumberOfDay}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-sm font-black uppercase">
                    <span>{item.teamAName}</span>
                    <span className="text-fuchsia-200">VS</span>
                    <span>{item.teamBName}</span>
                  </div>
                </div>
              ))}
              {!data.upcomingMatches.length && <EmptyOverlayText text="Tidak ada jadwal berikutnya" />}
            </div>
          </GlassPanel>
        )}

        {overlay === "mvp" && (
          <GlassPanel title="Top MVP" accent="fuchsia">
            <div className="grid grid-cols-5 gap-2">
              {data.bestPlayers.map((player, index) => (
                <div key={player.playerId} className="rounded-2xl border border-fuchsia-200/15 bg-fuchsia-400/10 p-3 text-center">
                  <p className="text-xs font-black text-fuchsia-100">#{index + 1}</p>
                  <p className="truncate text-sm font-black uppercase">{player.nickname}</p>
                  <p className="text-[11px] font-bold text-white/60">{player.teamName ?? player.name}</p>
                  <p className="mt-2 text-2xl font-black text-fuchsia-100">{player.mvpCount}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">MVP</p>
                </div>
              ))}
              {!data.bestPlayers.length && <EmptyOverlayText text="Stat MVP belum tersedia" />}
            </div>
          </GlassPanel>
        )}

        {overlay === "standings" && (
          <GlassPanel title="Klasemen" accent="amber">
            <div className="space-y-2">
              {data.standings.map((row) => (
                <div key={row.teamId} className="grid grid-cols-[36px_1fr_42px_42px_54px] items-center gap-2 rounded-2xl border border-amber-200/15 bg-amber-300/10 px-3 py-2 text-sm font-black">
                  <span className="text-amber-100">#{row.rank}</span>
                  <span className="truncate uppercase">{row.teamName}</span>
                  <span>{row.win}W</span>
                  <span>{row.loss}L</span>
                  <span className="text-right text-amber-100">{row.points}PTS</span>
                </div>
              ))}
              {!data.standings.length && <EmptyOverlayText text="Klasemen belum tersedia" />}
            </div>
          </GlassPanel>
        )}
      </div>
    </main>
  );
}

function normalizeOverlay(value?: string): OverlayType {
  return value === "schedule" || value === "mvp" || value === "standings" ? value : "score";
}

function TeamScore({ name, score, power, active }: { name: string; score: number; power: number; active: boolean }) {
  return (
    <div className={`rounded-[26px] border p-5 text-center uppercase ${active ? "border-amber-200/70 bg-amber-300/20 shadow-[0_0_34px_rgba(251,191,36,0.38)]" : "border-white/15 bg-white/10"}`}>
      <p className="text-2xl font-black italic tracking-tight">{name}</p>
      <p className="my-4 text-8xl font-black leading-none drop-shadow-[0_0_18px_rgba(255,255,255,0.42)]">{score}</p>
      <p className="text-xs font-black tracking-[0.24em] text-cyan-100/75">POWER {power}</p>
    </div>
  );
}

function GlassPanel({ title, accent, children }: { title: string; accent: "cyan" | "fuchsia" | "amber"; children: React.ReactNode }) {
  const accentClass = accent === "cyan" ? "text-cyan-100 shadow-cyan-400/20" : accent === "fuchsia" ? "text-fuchsia-100 shadow-fuchsia-400/20" : "text-amber-100 shadow-amber-400/20";

  return (
    <div className={`w-full max-w-5xl rounded-[26px] border border-white/15 bg-slate-950/85 p-4 shadow-2xl ${accentClass}`}>
      <h2 className="mb-3 text-sm font-black uppercase tracking-[0.32em]">{title}</h2>
      {children}
    </div>
  );
}

function EmptyOverlayText({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white/65">{text}</p>;
}
