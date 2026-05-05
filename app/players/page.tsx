import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { ROLES } from "@/lib/types";
import { getLeagueData } from "@/lib/data";

export default async function PlayersPage() {
  const { players, teams } = await getLeagueData();

  const roleCounts = ROLES.map((role) => ({
    role,
    total: players.filter((player) => player.mainRole === role || player.secondRole === role).length
  }));

  const sortedRoleCounts = [...roleCounts].sort((a, b) => a.total - b.total);
  const minimumRoleCount = sortedRoleCounts[0]?.total ?? 0;
  const priorityRoles = sortedRoleCounts.filter((item) => item.total === minimumRoleCount).map((item) => item.role);

  const teamRoleAudit = teams.map((team) => {
    const rolesInTeam = new Set(team.members.map((member) => member.laneRole));
    const missingRoles = ROLES.filter((role) => !rolesInTeam.has(role));
    const memberIds = new Set(team.members.map((member) => member.player.id));

    const recommendedPlayers = players
      .filter((player) => !memberIds.has(player.id))
      .filter((player) => missingRoles.some((role) => player.mainRole === role || player.secondRole === role))
      .slice(0, 3)
      .map((player) => ({
        id: player.id,
        nickname: player.nickname,
        fittingRoles: missingRoles.filter((role) => player.mainRole === role || player.secondRole === role)
      }));

    return {
      ...team,
      isComplete: missingRoles.length === 0,
      missingRoles,
      recommendedPlayers
    };
  });

  return (
    <AppShell>
      <SectionTitle
        title="Daftar Player"
        description="Informasi jumlah pemain terdaftar, sebaran role, dan kelengkapan role tiap tim."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Player</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{players.length}</p>
            <p className="text-xs text-muted-foreground">Pemain yang sudah terdaftar</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Perhitungan Role dari Total Pemain</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {roleCounts.map((item) => (
              <div key={item.role} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm font-medium">{item.role}</span>
                <Badge tone="primary">{item.total} player</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rekomendasi Role Prioritas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Role dengan jumlah pemain paling sedikit saat ini: <span className="font-semibold text-foreground">{priorityRoles.join(", ") || "-"}</span>
            {" "}(masing-masing {minimumRoleCount} player).
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {teamRoleAudit.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>{team.name}</CardTitle>
              {team.isComplete ? <Badge tone="success">Semua role lengkap</Badge> : <Badge tone="warning">Belum lengkap</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => {
                  const hasRole = !team.missingRoles.includes(role);
                  return (
                    <Badge key={`${team.id}-${role}`} tone={hasRole ? "success" : "warning"}>
                      {role}
                    </Badge>
                  );
                })}
              </div>
              {!team.isComplete && (
                <>
                  <p className="text-sm text-muted-foreground">Kurang role: {team.missingRoles.join(", ")}</p>
                  <div className="rounded-md bg-muted p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rekomendasi player pengisi role</p>
                    {team.recommendedPlayers.length ? (
                      <div className="space-y-2">
                        {team.recommendedPlayers.map((player) => (
                          <p key={player.id} className="text-sm">
                            <span className="font-semibold">{player.nickname}</span> cocok untuk: {player.fittingRoles.join(", ")}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada kandidat dari daftar pemain saat ini.</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {!teams.length && (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Belum ada tim yang terbentuk.</p>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Siapa Saja yang Sudah Terdaftar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <div key={player.id} className="rounded-md bg-muted p-3">
              <p className="text-sm font-bold">{player.nickname}</p>
              <p className="text-xs text-muted-foreground">{player.name}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Main role: <span className="font-semibold text-foreground">{player.mainRole}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Role cadangan: <span className="font-semibold text-foreground">{player.secondRole ?? "-"}</span>
              </p>
            </div>
          ))}
          {!players.length && <p className="text-sm text-muted-foreground">Belum ada player terdaftar.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}
