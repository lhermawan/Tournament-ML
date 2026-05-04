import { CalendarDays, Crown, Gamepad2, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { StatCard } from "@/components/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { getLeagueData } from "@/lib/data";

export default async function PlayerDashboardPage() {
  const user = await getCurrentUser();
  const { teams, matches } = await getLeagueData();
  const team =
    teams.find((item) => item.members.some((member) => member.player.id === user?.player?.id)) ??
    teams[0];
  const playerMatches = team
    ? matches.filter((match) => match.teamAId === team.id || match.teamBId === team.id)
    : [];

  return (
    <AppShell>
      <SectionTitle title="Dashboard Peserta" description="Ringkasan tim, role, dan jadwal peserta." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Tim Saya" value={team?.name ?? "-"} icon={Crown} helper={team ? `Power ${team.power}` : "Belum dibentuk"} />
        <StatCard label="Match" value={playerMatches.length} icon={CalendarDays} helper="Fase liga" />
        <StatCard label="Status" value="Verified" icon={UserRound} helper="Siap bermain" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Roster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {team?.members.map((member) => (
              <div key={member.player.id} className="flex items-center justify-between rounded-md bg-muted p-3">
                <div>
                  <p className="text-sm font-bold">{member.player.nickname}</p>
                  <p className="text-xs text-muted-foreground">{member.player.rank}</p>
                </div>
                <Badge>{member.laneRole}</Badge>
              </div>
            ))}
            {!team && <p className="text-sm text-muted-foreground">Belum masuk tim.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Tim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {playerMatches.map((match) => (
              <div key={match.id} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 rounded-md bg-muted p-3">
                <Badge>W{match.week}</Badge>
                <p className="text-sm font-bold">
                  {match.teamAName} vs {match.teamBName}
                </p>
                <Gamepad2 className="h-4 w-4 text-primary" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
