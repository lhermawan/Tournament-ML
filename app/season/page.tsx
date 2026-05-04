import { Lock, Play, Plus, Shuffle, Unlock } from "lucide-react";
import { createSeason, generateScheduleAction, generateTeamsAction, setSeasonStatus } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { getLeagueData } from "@/lib/data";

const steps = [
  { title: "Tambah season", status: "Selesai", icon: Plus },
  { title: "Buka pendaftaran", status: "Selesai", icon: Unlock },
  { title: "Tutup pendaftaran", status: "Aktif", icon: Lock },
  { title: "Generate team", status: "Siap", icon: Shuffle },
  { title: "Mulai liga", status: "Menunggu", icon: Play }
];

export default async function SeasonPage() {
  const { season } = await getLeagueData();

  return (
    <AppShell>
      <SectionTitle title="Season" description="Alur turnamen dibuat sebagai tombol sederhana untuk admin non-teknis." />
      <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Season Internal 2026</CardTitle>
          <form action={createSeason} className="flex gap-2">
            <input name="name" type="hidden" value="Season Internal 2026" />
            <Button type="submit">
              <Plus className="h-4 w-4" />
              Tambah Season
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {steps.map((step) => (
              <div key={step.title} className="rounded-lg border border-border bg-white p-4">
                <step.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-bold">{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.status}</p>
              </div>
            ))}
          </div>
          {season && (
            <div className="mt-5 flex flex-wrap gap-3">
              <SeasonButton seasonId={season.id} status="registration" icon={Unlock} label="Buka pendaftaran" />
              <SeasonButton seasonId={season.id} status="locked" icon={Lock} label="Tutup pendaftaran" />
              <form action={generateTeamsAction}>
                <input name="seasonId" type="hidden" value={season.id} />
                <Button type="submit" variant="secondary">
                  <Shuffle className="h-4 w-4" />
                  Generate Team
                </Button>
              </form>
              <form action={generateScheduleAction}>
                <input name="seasonId" type="hidden" value={season.id} />
                <Button type="submit" variant="secondary">
                  <Play className="h-4 w-4" />
                  Generate Jadwal
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function SeasonButton({
  seasonId,
  status,
  icon: Icon,
  label
}: {
  seasonId: string;
  status: string;
  icon: typeof Unlock;
  label: string;
}) {
  return (
    <form action={setSeasonStatus}>
      <input name="seasonId" type="hidden" value={seasonId} />
      <input name="status" type="hidden" value={status} />
      <Button type="submit" variant="secondary">
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </form>
  );
}
