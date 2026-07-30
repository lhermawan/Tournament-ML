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
  const statusLabel = data.status === "live" ? "LIVE" : data.status === "finished" ? "LAST MATCH" : "STANDBY";

  return (
    <main className="min-h-screen overflow-hidden bg-[#00ff00] p-6 text-white">
      <meta httpEquiv="refresh" content="5" />
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center">
        {overlay === "score" && (
          <section className="relative w-full max-w-7xl px-2 py-6">
            <div className="absolute inset-x-8 top-0 h-2 bg-gradient-to-r from-transparent via-[#f9c74f] to-transparent" />
            <div className="relative overflow-hidden border-y-4 border-[#f9c74f] bg-[#070a12] shadow-[0_18px_60px_rgba(0,0,0,0.55)] [clip-path:polygon(3%_0,97%_0,100%_18%,100%_82%,97%_100%,3%_100%,0_82%,0_18%)]">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(28,63,170,0.34)_0%,rgba(8,10,18,0.96)_34%,rgba(8,10,18,0.96)_66%,rgba(190,18,60,0.36)_100%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              <div className="relative grid grid-cols-[1fr_240px_1fr] items-stretch">
                {match ? (
                  <>
                    <TeamScore side="blue" name={match.teamA.name} score={match.teamA.score} power={match.teamA.power} active={match.winnerId === match.teamA.id} />
                    <div className="flex flex-col items-center justify-center border-x border-[#f9c74f]/45 bg-black/55 px-4 py-6 text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#f9c74f]">{data.tournament}</p>
                      <p className="mt-2 text-sm font-black uppercase tracking-[0.24em] text-white/75">{data.season}</p>
                      <div className="my-5 grid h-24 w-24 place-items-center rounded-full border-4 border-[#f9c74f] bg-gradient-to-b from-[#221400] to-black shadow-[0_0_30px_rgba(249,199,79,0.45)]">
                        <span className="text-4xl font-black italic text-[#f9c74f]">VS</span>
                      </div>
                      <p className="rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white">
                        Day {match.week} • Match {match.matchNumberOfDay}
                      </p>
                      <p className="mt-3 rounded-full bg-red-600 px-4 py-1 text-xs font-black uppercase tracking-[0.24em] shadow-[0_0_18px_rgba(220,38,38,0.55)]">{statusLabel}</p>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#f9c74f]">
                        {match.mvp ? `MVP ${match.mvp}` : "Best of Series"}
                      </p>
                    </div>
                    <TeamScore side="red" name={match.teamB.name} score={match.teamB.score} power={match.teamB.power} active={match.winnerId === match.teamB.id} />
                  </>
                ) : (
                  <div className="col-span-3 p-10">
                    <EmptyOverlayText text="Menunggu match dimulai" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {overlay === "schedule" && (
          <BroadcastPanel title="Jadwal Berikutnya" eyebrow="Next Fixtures">
            <div className="space-y-3">
              {data.upcomingMatches.map((item) => (
                <div key={item.id} className="grid grid-cols-[150px_1fr_auto_1fr] items-center gap-4 border-l-4 border-[#f9c74f] bg-white/[0.08] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#f9c74f]">
                    Day {item.week}
                    <span className="block text-white/70">Match {item.matchNumberOfDay}</span>
                  </div>
                  <span className="truncate text-right text-xl font-black uppercase italic">{item.teamAName}</span>
                  <span className="rounded bg-[#f9c74f] px-3 py-1 text-sm font-black text-black">VS</span>
                  <span className="truncate text-xl font-black uppercase italic">{item.teamBName}</span>
                </div>
              ))}
              {!data.upcomingMatches.length && <EmptyOverlayText text="Tidak ada jadwal berikutnya" />}
            </div>
          </BroadcastPanel>
        )}

        {overlay === "mvp" && (
          <BroadcastPanel title="Top MVP" eyebrow="Player Leaderboard">
            <div className="grid grid-cols-5 gap-3">
              {data.bestPlayers.map((player, index) => (
                <div key={player.playerId} className="relative overflow-hidden border border-[#f9c74f]/35 bg-gradient-to-b from-white/10 to-white/[0.03] p-4 text-center [clip-path:polygon(10%_0,100%_0,100%_90%,90%_100%,0_100%,0_10%)]">
                  <p className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#f9c74f] text-sm font-black text-black">#{index + 1}</p>
                  <p className="mt-3 truncate text-lg font-black uppercase italic">{player.nickname}</p>
                  <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">{player.teamName ?? player.name}</p>
                  <p className="mt-4 text-5xl font-black leading-none text-[#f9c74f]">{player.mvpCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/65">MVP</p>
                </div>
              ))}
              {!data.bestPlayers.length && <EmptyOverlayText text="Stat MVP belum tersedia" />}
            </div>
          </BroadcastPanel>
        )}

        {overlay === "standings" && (
          <BroadcastPanel title="Klasemen" eyebrow="League Table">
            <div className="space-y-2">
              {data.standings.map((row) => (
                <div key={row.teamId} className="grid grid-cols-[56px_1fr_58px_58px_58px_90px] items-center gap-3 bg-gradient-to-r from-white/[0.13] to-white/[0.04] px-4 py-3 text-lg font-black uppercase shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <span className="text-[#f9c74f]">#{row.rank}</span>
                  <span className="truncate italic">{row.teamName}</span>
                  <span>{row.win}W</span>
                  <span>{row.draw}D</span>
                  <span>{row.loss}L</span>
                  <span className="text-right text-[#f9c74f]">{row.points}PTS</span>
                </div>
              ))}
              {!data.standings.length && <EmptyOverlayText text="Klasemen belum tersedia" />}
            </div>
          </BroadcastPanel>
        )}
      </div>
    </main>
  );
}

function normalizeOverlay(value?: string): OverlayType {
  return value === "schedule" || value === "mvp" || value === "standings" ? value : "score";
}

function TeamScore({ name, score, power, active, side }: { name: string; score: number; power: number; active: boolean; side: "blue" | "red" }) {
  const sideClass = side === "blue" ? "from-[#0f3b91] via-[#10224d] to-[#070a12] text-left" : "from-[#070a12] via-[#4d1020] to-[#a20f2c] text-right";
  const activeClass = active ? "ring-4 ring-[#f9c74f] shadow-[0_0_35px_rgba(249,199,79,0.5)]" : "ring-1 ring-white/10";

  return (
    <div className={`relative flex min-h-64 flex-col justify-center bg-gradient-to-r p-8 uppercase ${sideClass} ${activeClass}`}>
      <p className="text-sm font-black tracking-[0.3em] text-[#f9c74f]">TEAM</p>
      <p className="mt-2 text-5xl font-black italic leading-none tracking-tight drop-shadow-[0_3px_0_rgba(0,0,0,0.5)]">{name}</p>
      <div className={`mt-6 flex items-end gap-4 ${side === "red" ? "justify-end" : "justify-start"}`}>
        <p className="text-[9rem] font-black leading-[0.78] text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.45)]">{score}</p>
        <p className="mb-2 rounded bg-black/45 px-3 py-2 text-xs font-black tracking-[0.22em] text-white/75">POWER {power}</p>
      </div>
    </div>
  );
}

function BroadcastPanel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="relative w-full max-w-6xl overflow-hidden border-y-4 border-[#f9c74f] bg-[#070a12]/95 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)] [clip-path:polygon(2%_0,98%_0,100%_12%,100%_88%,98%_100%,2%_100%,0_88%,0_12%)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,145,0.30),transparent_38%,rgba(162,15,44,0.30))]" />
      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.36em] text-[#f9c74f]">{eyebrow}</p>
        <h2 className="mb-5 text-4xl font-black uppercase italic tracking-tight text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.45)]">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function EmptyOverlayText({ text }: { text: string }) {
  return <p className="border border-[#f9c74f]/40 bg-black/55 p-6 text-center text-2xl font-black uppercase tracking-[0.18em] text-white">{text}</p>;
}
