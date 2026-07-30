import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { getLeagueData } from "@/lib/data";
import { isMatchFinished } from "@/lib/tournament";

export default async function SchedulePage() {
  const { matches } = await getLeagueData();
  const days = [...new Set(matches.map((match) => match.week))].sort((a, b) => a - b);

  return (
    <AppShell>
      <SectionTitle title="Jadwal Match" description="Round robin satu kali pertemuan untuk semua tim." />
      <div className="space-y-5">
        {days.map((day) => (
          <section key={day}>
            <h2 className="mb-3 text-lg font-black">Day {day}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {matches
                .filter((match) => match.week === day)
                .map((match) => (
                  <Card key={match.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Badge tone={isMatchFinished(match) ? "success" : "neutral"}>
                        {isMatchFinished(match) ? "Selesai" : "Terjadwal"}
                      </Badge>
                      {isMatchFinished(match) && (
                        <span className="text-sm font-black">
                          {match.scoreA} - {match.scoreB}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                      <p className="font-bold">{match.teamAName}</p>
                      <span className="text-xs font-black text-muted-foreground">VS</span>
                      <p className="font-bold">{match.teamBName}</p>
                    </div>
                    {match.mvp && <p className="mt-3 text-center text-xs text-muted-foreground">MVP: {match.mvp}</p>}
                  </Card>
                ))}
            </div>
          </section>
        ))}
        {!days.length && (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Jadwal belum dibuat. Admin perlu generate jadwal setelah tim tersedia.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
