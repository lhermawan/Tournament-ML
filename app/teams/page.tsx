import { AppShell } from "@/components/app-shell";
import { moveTeamMemberAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { getCurrentUser } from "@/lib/auth";
import { getLeagueData } from "@/lib/data";
import { ROLES } from "@/lib/types";

type TeamsPageProps = {
  searchParams?: Promise<{ moveSaved?: string; moveError?: string }>;
};

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const { teams } = await getLeagueData();
  const isAdmin = user?.role === "admin";

  return (
    <AppShell>
      <SectionTitle
        title="Team Result"
        description="Hasil generate otomatis berdasarkan role dan balancing poin rank."
      />
      {params?.moveSaved && (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Perpindahan pemain berhasil disimpan.
        </p>
      )}
      {params?.moveError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Gagal memindahkan pemain. Cek data source/target.
        </p>
      )}
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
                    {isAdmin && (
                      <form action={moveTeamMemberAction} className="col-span-3 mt-2 grid gap-2 rounded-md border border-border bg-white p-2 md:grid-cols-[1fr_1fr_auto]">
                        <input type="hidden" name="sourceTeamId" value={team.id} />
                        <input type="hidden" name="playerId" value={member.player.id} />
                        <select name="targetTeamId" defaultValue={team.id} className="h-9 rounded-md border border-border bg-white px-2 text-sm">
                          {teams.map((targetTeam) => (
                            <option key={targetTeam.id} value={targetTeam.id}>
                              {targetTeam.name}
                            </option>
                          ))}
                        </select>
                        <select name="targetRole" defaultValue={member.laneRole} className="h-9 rounded-md border border-border bg-white px-2 text-sm">
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" variant="secondary" className="h-9">
                          Pindah
                        </Button>
                      </form>
                    )}
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
