import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { getLeagueData } from "@/lib/data";

export default async function TeamsPage() {
  const { teams } = await getLeagueData();

  return (
    <AppShell>
      <SectionTitle
        title="Team Result"
        description="Hasil generate otomatis berdasarkan role dan balancing poin rank."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>{team.name}</CardTitle>
              <Badge tone="primary">Power {team.power}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div
                    key={`${team.id}-${member.player.id}`}
                    className="grid grid-cols-[110px_1fr_auto] items-center gap-3 rounded-md bg-muted p-3"
                  >
                    <Badge>{member.laneRole}</Badge>
                    <div>
                      <p className="text-sm font-bold">{member.player.nickname}</p>
                      <p className="text-xs text-muted-foreground">{member.player.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{member.player.rank}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {!teams.length && (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Belum ada tim. Admin perlu verifikasi peserta lalu generate team.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
