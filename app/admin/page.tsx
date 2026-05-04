import { CalendarPlus, CheckCircle2, FileUp, Lock, Pencil, Play, RotateCcw, Save, Shuffle, Trophy, UserCheck, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  createManualPlayer,
  createSeason,
  generateScheduleAction,
  generateTeamsAction,
  resetTeamsAction,
  saveMatchGameResult,
  saveMatchResult,
  setSeasonStatus,
  updatePlayer,
  updateLiveScore,
  verifyAllPlayers,
  verifyPlayer
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/section-title";
import { TeamDraftWheel } from "@/components/team-draft-wheel";
import { getCurrentUser } from "@/lib/auth";
import { getLeagueData } from "@/lib/data";
import { RANKS, ROLES } from "@/lib/types";
import { redirect } from "next/navigation";

type AdminPageProps = {
  searchParams?: Promise<{
    draftError?: string;
    draftSaved?: string;
    editError?: string;
    editSaved?: string;
    playerAdded?: string;
    playerError?: string;
    gameError?: string;
    gameSaved?: string;
    teamsReset?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    redirect("/login?error=admin");
  }

  const params = await searchParams;
  const { isDemo, season, players, teams, matches } = await getLeagueData();
  const pendingMatch = matches.find((match) => !match.winnerId);
  const playerError = params?.playerError;

  return (
    <AppShell>
      <SectionTitle
        title="Panel Admin"
        description="Kontrol operasional turnamen: verifikasi, generate tim, jadwal, hasil, dan playoff."
      />

      {isDemo && (
        <Card className="mb-5 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Mode demo aktif karena database belum bisa diakses. Setelah MySQL dan `.env` siap, action admin akan memakai data asli.
          </p>
        </Card>
      )}

      {params?.teamsReset && (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Team dan jadwal berhasil direset.
        </p>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-6">
        <form action={createSeason}>
          <input name="name" type="hidden" value="Season Internal 2026" />
          <AdminAction icon={CalendarPlus} label="Tambah season" />
        </form>
        <form action={setSeasonStatus}>
          <input name="seasonId" type="hidden" value={season?.id ?? ""} />
          <input name="status" type="hidden" value="locked" />
          <AdminAction icon={Lock} label="Tutup pendaftaran" />
        </form>
        <form action={generateTeamsAction}>
          <input name="seasonId" type="hidden" value={season?.id ?? ""} />
          <AdminAction icon={Shuffle} label="Generate team" primary />
        </form>
        <form action={resetTeamsAction}>
          <input name="seasonId" type="hidden" value={season?.id ?? ""} />
          <AdminAction icon={RotateCcw} label="Reset team" />
        </form>
        <form action={generateScheduleAction}>
          <input name="seasonId" type="hidden" value={season?.id ?? ""} />
          <AdminAction icon={Play} label="Generate jadwal" />
        </form>
        <form action={setSeasonStatus}>
          <input name="seasonId" type="hidden" value={season?.id ?? ""} />
          <input name="status" type="hidden" value="playoff" />
          <AdminAction icon={Trophy} label="Playoff Top 4" />
        </form>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Draft Roda Team</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Putar roda per role, isi team pertama sampai full, lalu lanjut team berikutnya.</p>
        </CardHeader>
        <CardContent>
          <TeamDraftWheel
            seasonId={season?.id}
            players={players}
            existingTeams={teams}
            draftSaved={params?.draftSaved === "1"}
            draftError={params?.draftError}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Tambah Peserta Manual</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Input peserta dari admin untuk akun player dan data balancing.</p>
          </div>
          <UserPlus className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {params?.playerAdded && (
            <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Peserta berhasil ditambahkan.
            </p>
          )}
          {playerError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {playerError === "exists"
                ? "Email sudah dipakai peserta lain."
                : "Data peserta belum lengkap atau formatnya belum sesuai."}
            </p>
          )}
          <form action={createManualPlayer} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminField name="name" label="Nama lengkap" placeholder="Nama pegawai" />
            <AdminField name="nickname" label="Nickname MLBB" placeholder="Nickname in-game" />
            <AdminField name="mlId" label="ID Mobile Legends" placeholder="12345678 (1234)" />
            <AdminField name="phone" label="No HP" placeholder="08xxxxxxxxxx" />
            <AdminField name="unit" label="Unit kerja / bidang" placeholder="Aptika, IKP, Statistik..." />
            <label className="block text-sm font-semibold">
              Rank saat ini
              <select name="rank" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                {RANKS.map((rank) => (
                  <option key={rank}>{rank}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Role utama
              <select name="mainRole" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                {ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Role cadangan
              <select name="secondRole" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Opsional</option>
                {ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <AdminField name="email" label="Email login" placeholder="nama@diskominfo.go.id" type="email" />
            <AdminField name="password" label="Password awal" placeholder="Minimal 8 karakter" type="password" defaultValue="player12345" />
            <label className="flex h-10 items-center gap-2 self-end text-sm font-semibold">
              <input name="verified" type="hidden" value="false" />
              <input name="verified" type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30" />
              Langsung verifikasi
            </label>
            <Button type="submit" className="self-end">
              <Save className="h-4 w-4" />
              Simpan Peserta
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Data Peserta</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{players.length} peserta masuk draft season dan bisa diedit admin.</p>
            </div>
            <form action={verifyAllPlayers}>
              <Button type="submit" variant="secondary">
                <UserCheck className="h-4 w-4" />
                Verifikasi Semua
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-3">
            {params?.editSaved && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                Data peserta berhasil diperbarui.
              </p>
            )}
            {params?.editError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {params.editError === "exists"
                  ? "Email sudah dipakai peserta lain."
                  : "Data peserta belum lengkap atau formatnya belum sesuai."}
              </p>
            )}
            {players.map((player) => (
              <details key={player.id} className="rounded-md bg-muted p-3 text-sm">
                <summary className="grid cursor-pointer list-none grid-cols-[1fr_100px_92px_auto] items-center gap-3">
                  <div>
                    <p className="font-bold">{player.nickname}</p>
                    <p className="text-xs text-muted-foreground">{player.name} - {player.unit}</p>
                  </div>
                  <Badge>{player.mainRole}</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">{player.rank}</span>
                  <div className="flex items-center gap-2">
                    {player.verified ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <form action={verifyPlayer}>
                        <input name="playerId" type="hidden" value={player.id} />
                        <Button type="submit" variant="secondary" className="h-8 px-2">OK</Button>
                      </form>
                    )}
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </div>
                </summary>
                <form action={updatePlayer} className="mt-4 grid gap-3 rounded-md border border-border bg-white p-4 md:grid-cols-2">
                  <input name="playerId" type="hidden" value={player.id} />
                  <AdminField name="name" label="Nama lengkap" placeholder="Nama peserta" defaultValue={player.name} />
                  <AdminField name="nickname" label="Nickname MLBB" placeholder="Nickname in-game" defaultValue={player.nickname} />
                  <AdminField name="mlId" label="ID Mobile Legends" placeholder="12345678 (1234)" defaultValue={player.mlId} />
                  <AdminField name="phone" label="No HP" placeholder="08xxxxxxxxxx" defaultValue={player.phone} />
                  <AdminField name="unit" label="Unit kerja / bidang" placeholder="Unit kerja" defaultValue={player.unit} />
                  <AdminField name="email" label="Email login" placeholder="nama@peserta.local" type="email" defaultValue={player.email ?? ""} />
                  <label className="block text-sm font-semibold">
                    Rank saat ini
                    <select name="rank" defaultValue={player.rank} className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      {RANKS.map((rank) => (
                        <option key={rank}>{rank}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Role utama
                    <select name="mainRole" defaultValue={player.mainRole} className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      {ROLES.map((role) => (
                        <option key={role}>{role}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Role cadangan
                    <select name="secondRole" defaultValue={player.secondRole ?? ""} className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Opsional</option>
                      {ROLES.map((role) => (
                        <option key={role}>{role}</option>
                      ))}
                    </select>
                  </label>
                  <AdminField name="password" label="Password baru" placeholder="Kosongkan jika tidak diganti" type="password" />
                  <label className="flex h-10 items-center gap-2 self-end text-sm font-semibold">
                    <input name="verified" type="hidden" value="false" />
                    <input name="verified" type="checkbox" defaultChecked={player.verified} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30" />
                    Terverifikasi
                  </label>
                  <Button type="submit" className="self-end">
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                </form>
              </details>
            ))}
            {!players.length && <p className="text-sm text-muted-foreground">Belum ada peserta terdaftar.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Score & Hasil Match</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Update skor live untuk overlay, lalu simpan hasil final setelah match selesai.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {params?.gameSaved && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                Detail game BO3 berhasil disimpan.
              </p>
            )}
            {params?.gameError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                Detail game belum lengkap. Pilih match, game, winner, dan isi data yang diperlukan.
              </p>
            )}
            <form action={updateLiveScore} className="space-y-4 rounded-md border border-border bg-muted p-4">
              <label className="block text-sm font-semibold">
                Match Live
                <select name="matchId" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
                  {matches.filter((match) => !match.winnerId).map((match) => (
                    <option key={match.id} value={match.id}>
                      Week {match.week}: {match.teamAName} vs {match.teamBName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Skor Team A
                  <input name="scoreA" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue={pendingMatch?.scoreA ?? 0} />
                </label>
                <label className="block text-sm font-semibold">
                  Skor Team B
                  <input name="scoreB" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue={pendingMatch?.scoreB ?? 0} />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                MVP Sementara
                <input name="mvp" list="player-nicknames" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm" placeholder="Nickname MVP sementara" defaultValue={pendingMatch?.mvp ?? ""} />
              </label>
              <Button type="submit" className="w-full" disabled={!pendingMatch}>Update Live Score</Button>
            </form>

            <form action={saveMatchGameResult} className="space-y-4 rounded-md border border-border bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Match BO3
                  <select name="matchId" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
                    {matches.filter((match) => !match.winnerId).map((match) => (
                      <option key={match.id} value={match.id}>
                        Week {match.week}: {match.teamAName} vs {match.teamBName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Game
                  <select name="gameNumber" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
                    {[1, 2, 3].map((game) => (
                      <option key={game} value={game}>Game {game}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Pemenang Game
                <select name="winnerId" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
                  {pendingMatch && (
                    <>
                      <option value={pendingMatch.teamAId}>{pendingMatch.teamAName}</option>
                      <option value={pendingMatch.teamBId}>{pendingMatch.teamBName}</option>
                    </>
                  )}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                MVP Game
                <input name="mvp" list="player-nicknames" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" placeholder="Nickname MVP game" />
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="block text-sm font-semibold">
                  Kill MVP
                  <input name="mvpKills" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue="0" />
                </label>
                <label className="block text-sm font-semibold">
                  Death MVP
                  <input name="mvpDeaths" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue="0" />
                </label>
                <label className="block text-sm font-semibold">
                  Assist MVP
                  <input name="mvpAssists" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue="0" />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Screenshot Hasil Game
                <input name="screenshot" className="mt-2 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm" type="file" accept="image/*" />
              </label>
              <label className="block text-sm font-semibold">
                URL Screenshot Opsional
                <input name="screenshotUrl" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" placeholder="Isi kalau screenshot sudah di-upload di tempat lain" />
              </label>
              <Button type="submit" className="w-full" disabled={!pendingMatch}>Simpan Detail Game BO3</Button>
            </form>

            {pendingMatch?.games?.length ? (
              <div className="space-y-2 rounded-md border border-border bg-muted p-4">
                <p className="text-sm font-black">Game tersimpan untuk match aktif</p>
                {pendingMatch.games.map((game) => (
                  <div key={game.id} className="rounded-md bg-white p-3 text-sm">
                    <p className="font-bold">Game {game.gameNumber}: {game.winnerName ?? "Winner belum ada"}</p>
                    <p className="text-xs text-muted-foreground">
                      MVP {game.mvp ?? "-"} | KDA {game.mvpKills}/{game.mvpDeaths}/{game.mvpAssists}
                    </p>
                    {game.screenshotUrl && (
                      <a href={game.screenshotUrl} target="_blank" className="mt-1 inline-block text-xs font-bold text-primary">
                        Lihat screenshot
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <form action={saveMatchResult} className="space-y-4">
              <label className="block text-sm font-semibold">
                Match Final
                <select name="matchId" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
                  {matches.filter((match) => !match.winnerId).map((match) => (
                    <option key={match.id} value={match.id}>
                      Week {match.week}: {match.teamAName} vs {match.teamBName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Skor Team A
                  <input name="scoreA" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue="1" />
                </label>
                <label className="block text-sm font-semibold">
                  Skor Team B
                  <input name="scoreB" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" type="number" min="0" defaultValue="0" />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                MVP
                <input name="mvp" list="player-nicknames" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" placeholder="Nickname MVP" defaultValue={pendingMatch?.mvp ?? ""} />
              </label>
              <label className="block text-sm font-semibold">
                Screenshot
                <div className="mt-2 flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload opsional
                </div>
                <input name="screenshotUrl" className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm" placeholder="URL screenshot opsional" />
              </label>
              <Button type="submit" className="w-full" disabled={!pendingMatch}>Simpan Hasil</Button>
            </form>
            <datalist id="player-nicknames">
              {players.map((player) => (
                <option key={player.id} value={player.nickname} />
              ))}
            </datalist>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between rounded-md bg-muted p-3">
                <p className="text-sm font-bold">{team.name}</p>
                <Badge tone="primary">Power {team.power}</Badge>
              </div>
            ))}
            {!teams.length && <p className="text-sm text-muted-foreground">Tim belum digenerate.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Master</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-bold">Role</p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => <Badge key={role}>{role}</Badge>)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Rank Power</p>
              <div className="flex flex-wrap gap-2">
                {RANKS.map((rank, index) => <Badge key={rank} tone="warning">{rank}: {index + 1}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function AdminField({
  name,
  label,
  placeholder,
  type = "text",
  defaultValue
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        placeholder={placeholder}
      />
    </label>
  );
}

function AdminAction({
  icon: Icon,
  label,
  primary = false
}: {
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}) {
  return (
    <button className={`flex min-h-24 w-full flex-col items-start justify-between rounded-lg border p-4 text-left shadow-soft transition hover:-translate-y-0.5 ${primary ? "border-primary bg-primary text-white" : "border-border bg-white"}`}>
      <Icon className="h-5 w-5" />
      <span className="text-sm font-black">{label}</span>
    </button>
  );
}
