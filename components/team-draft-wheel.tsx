"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { RotateCcw, Save, Shuffle, Square, Volume2, VolumeX } from "lucide-react";
import { saveWheelDraftTeams } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rankPower } from "@/lib/tournament";
import { ROLES, type Player, type PlayerRole, type Team } from "@/lib/types";

type DraftMember = {
  player: Player;
  laneRole: PlayerRole;
};

type DraftTeam = {
  name: string;
  members: DraftMember[];
};

type TeamDraftWheelProps = {
  seasonId?: string;
  players: Player[];
  existingTeams: Team[];
  draftSaved?: boolean;
  draftError?: string;
};

const wheelColors = ["#0f766e", "#f59e0b", "#2563eb", "#dc2626", "#7c3aed", "#16a34a", "#ea580c", "#0891b2"];
const fallbackTeamNames = ["Team Aster", "Team Bravo", "Team Cakra", "Team Daya", "Team Elang", "Team Fortuna"];

export function TeamDraftWheel({ seasonId, players, existingTeams, draftSaved, draftError }: TeamDraftWheelProps) {
  const verifiedPlayers = useMemo(() => players.filter((player) => player.verified), [players]);
  const teamCount = Math.floor(verifiedPlayers.length / ROLES.length);
  const initialTeams = useMemo(
    () =>
      Array.from({ length: teamCount }, (_, index) => ({
        name: existingTeams[index]?.name ?? fallbackTeamNames[index] ?? `Team ${index + 1}`,
        members: [] as DraftMember[]
      })),
    [existingTeams, teamCount]
  );

  const [teams, setTeams] = useState<DraftTeam[]>(initialTeams);
  const [teamIndex, setTeamIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [settling, setSettling] = useState(false);
  const [spinMode, setSpinMode] = useState<"manual" | "auto">("manual");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [lastWinner, setLastWinner] = useState<Player | null>(null);
  const [lastWinnerTeam, setLastWinnerTeam] = useState("");
  const [localError, setLocalError] = useState("");
  const [isPending, startTransition] = useTransition();
  const spinIntervalRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const spinningRef = useRef(false);
  const settlingRef = useRef(false);

  const currentTeam = teams[teamIndex];
  const currentRole = ROLES[roleIndex];
  const pickedIds = new Set(teams.flatMap((team) => team.members.map((member) => member.player.id)));
  const unpickedPlayers = verifiedPlayers.filter((player) => !pickedIds.has(player.id));
  const preferredCandidates = unpickedPlayers.filter(
    (player) => player.mainRole === currentRole || player.secondRole === currentRole
  );
  const candidates = preferredCandidates.length ? preferredCandidates : unpickedPlayers;
  const isFallbackPool = !preferredCandidates.length && unpickedPlayers.length > 0;
  const isComplete = teams.length > 0 && teams.every((team) => team.members.length === ROLES.length);

  const wheelBackground = useMemo(() => {
    if (!candidates.length) return "conic-gradient(#e2e8f0 0deg 360deg)";

    const slice = 360 / candidates.length;
    return `conic-gradient(${candidates
      .map((_, index) => {
        const color = wheelColors[index % wheelColors.length];
        return `${color} ${index * slice}deg ${(index + 1) * slice}deg`;
      })
      .join(", ")})`;
  }, [candidates]);

  useEffect(() => {
    return () => {
      clearTimers();
      audioContextRef.current?.close();
    };
  }, []);

  function updateTeamName(index: number, name: string) {
    setTeams((current) => current.map((team, teamPosition) => (teamPosition === index ? { ...team, name } : team)));
  }

  function spin() {
    if (spinning || settling || !currentTeam || !candidates.length) return;

    setLocalError("");
    setSpinning(true);
    setSettling(false);
    spinningRef.current = true;
    settlingRef.current = false;
    setLastWinner(null);
    setLastWinnerTeam("");
    prepareAudio();

    spinIntervalRef.current = window.setInterval(() => {
      setRotation((current) => current + 58);
      playTick();
    }, 55);

    if (spinMode === "auto") {
      autoStopTimeoutRef.current = window.setTimeout(() => {
        stopSpin();
      }, 1900 + Math.floor(Math.random() * 900));
    }
  }

  function stopSpin() {
    if (!spinningRef.current || settlingRef.current || !currentTeam || !candidates.length) return;

    clearSpinTimers();
    setSpinning(false);
    setSettling(true);
    spinningRef.current = false;
    settlingRef.current = true;

    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const winner = candidates[winnerIndex];
    const targetTeamName = currentTeam.name;
    const slice = 360 / candidates.length;
    const winnerCenter = winnerIndex * slice + slice / 2;
    const pointerAngle = 270;

    setRotation((current) => {
      const normalized = ((current % 360) + 360) % 360;
      const target = pointerAngle - winnerCenter;
      const delta = ((target - normalized + 360) % 360) + 720;
      return current + delta;
    });

    settleTimeoutRef.current = window.setTimeout(() => {
      setTeams((current) =>
        current.map((team, index) =>
          index === teamIndex
            ? { ...team, members: [...team.members, { player: winner, laneRole: currentRole }] }
            : team
        )
      );
      setLastWinner(winner);
      setLastWinnerTeam(targetTeamName);
      setSettling(false);
      settlingRef.current = false;
      playWin();

      if (roleIndex < ROLES.length - 1) {
        setRoleIndex((current) => current + 1);
      } else {
        setRoleIndex(0);
        setTeamIndex((current) => Math.min(current + 1, teams.length - 1));
      }
    }, 1500);
  }

  function resetDraft() {
    clearTimers();
    setTeams(initialTeams);
    setTeamIndex(0);
    setRoleIndex(0);
    setRotation(0);
    setSpinning(false);
    setSettling(false);
    spinningRef.current = false;
    settlingRef.current = false;
    setLastWinner(null);
    setLastWinnerTeam("");
    setSelectedPlayerId("");
    setLocalError("");
  }

  function assignManualPick() {
    if (spinning || settling || !currentTeam || !currentRole || !candidates.length) return;
    if (!selectedPlayerId) {
      setLocalError("Pilih pemain dulu untuk input manual.");
      return;
    }

    const manualPlayer = candidates.find((player) => player.id === selectedPlayerId);
    if (!manualPlayer) {
      setLocalError("Pemain tidak tersedia di pool role saat ini.");
      return;
    }

    setLocalError("");
    setTeams((current) =>
      current.map((team, index) =>
        index === teamIndex
          ? { ...team, members: [...team.members, { player: manualPlayer, laneRole: currentRole }] }
          : team
      )
    );
    setLastWinner(manualPlayer);
    setLastWinnerTeam(currentTeam.name);
    setSelectedPlayerId("");

    if (roleIndex < ROLES.length - 1) {
      setRoleIndex((current) => current + 1);
    } else {
      setRoleIndex(0);
      setTeamIndex((current) => Math.min(current + 1, teams.length - 1));
    }
  }

  function clearTimers() {
    clearSpinTimers();
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  }

  function clearSpinTimers() {
    if (spinIntervalRef.current !== null) {
      window.clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current !== null) {
      window.clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
  }

  function prepareAudio() {
    if (!soundEnabled || audioContextRef.current) return;
    audioContextRef.current = new AudioContext();
  }

  function playTone(frequency: number, duration = 0.04, gainValue = 0.035) {
    if (!soundEnabled) return;

    const context = audioContextRef.current;
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(gainValue, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  function playTick() {
    playTone(720, 0.025, 0.02);
  }

  function playWin() {
    playTone(980, 0.08, 0.04);
    window.setTimeout(() => playTone(1240, 0.1, 0.035), 90);
  }

  function saveDraft() {
    if (!seasonId || !isComplete) return;

    const emptyName = teams.some((team) => team.name.trim().length < 2);
    if (emptyName) {
      setLocalError("Nama team minimal 2 karakter.");
      return;
    }

    const formData = new FormData();
    formData.set("seasonId", seasonId);
    formData.set(
      "teams",
      JSON.stringify(
        teams.map((team) => ({
          name: team.name.trim(),
          members: team.members.map((member) => ({
            playerId: member.player.id,
            laneRole: member.laneRole
          }))
        }))
      )
    );

    startTransition(() => {
      saveWheelDraftTeams(formData);
    });
  }

  if (teamCount < 2) {
    return (
      <div className="rounded-lg border border-border bg-white p-5 text-sm font-semibold text-muted-foreground">
        Minimal 10 peserta terverifikasi untuk draft roda.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {draftSaved && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Hasil draft roda berhasil disimpan.
        </p>
      )}
      {draftError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Draft belum bisa disimpan. Cek nama team, role, dan peserta yang dipilih.
        </p>
      )}
      {localError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {localError}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,420px)_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Sekarang</p>
                <p className="text-lg font-black">{currentTeam?.name ?? "Draft selesai"}</p>
              </div>
              <Badge tone="primary">{currentRole}</Badge>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[320px]">
              <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[22px] border-x-transparent border-t-foreground" />
              <div
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[10px] border-white shadow-soft"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 85ms linear" : "transform 1500ms cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              >
                {candidates.map((player, index) => {
                  const angle = (360 / candidates.length) * index + 360 / candidates.length / 2;
                  return (
                    <div
                      key={player.id}
                      className="absolute left-1/2 top-1/2 w-[34%] origin-left text-[10px] font-black text-white drop-shadow"
                      style={{ transform: `rotate(${angle}deg) translateX(82px)` }}
                    >
                      <span className="block max-w-[92px] truncate">{player.nickname}</span>
                    </div>
                  );
                })}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-white px-2 text-center text-xs font-black shadow-soft">
                  {spinning ? "Berputar" : settling ? "Stop" : `${candidates.length} pemain`}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-2 rounded-md bg-white p-1">
                <button
                  type="button"
                  onClick={() => setSpinMode("manual")}
                  className={`h-9 rounded-md text-sm font-black ${spinMode === "manual" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                  disabled={spinning || settling}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setSpinMode("auto")}
                  className={`h-9 rounded-md text-sm font-black ${spinMode === "auto" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                  disabled={spinning || settling}
                >
                  Otomatis
                </button>
              </div>
              <div className="flex gap-3">
              <Button type="button" className="flex-1" onClick={spin} disabled={spinning || settling || isComplete || !candidates.length}>
                <Shuffle className="h-4 w-4" />
                Putar Roda
              </Button>
                <Button type="button" variant="secondary" onClick={stopSpin} disabled={!spinning || settling}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              <Button type="button" variant="secondary" onClick={resetDraft} disabled={spinning || settling}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              </div>
              <div className="grid gap-2 rounded-md border border-border bg-white p-3">
                <p className="text-xs font-black uppercase text-muted-foreground">Input Manual Admin</p>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select
                    value={selectedPlayerId}
                    onChange={(event) => setSelectedPlayerId(event.target.value)}
                    className="h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={spinning || settling || isComplete || !candidates.length}
                  >
                    <option value="">Pilih pemain dari pool {currentRole}</option>
                    {candidates.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.nickname} • {player.rank}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={assignManualPick}
                    disabled={spinning || settling || isComplete || !selectedPlayerId || !candidates.length}
                  >
                    Input Manual
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled((current) => !current)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white text-sm font-semibold text-muted-foreground hover:bg-muted"
                disabled={spinning || settling}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Suara {soundEnabled ? "Aktif" : "Mati"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black">Pool {currentRole}</p>
              {isFallbackPool && <Badge tone="warning">Fallback</Badge>}
            </div>
            <div className="grid max-h-52 gap-2 overflow-y-auto">
              {candidates.map((player) => (
                <div key={player.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="font-bold">{player.nickname}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{player.rank}</span>
                </div>
              ))}
              {!candidates.length && <p className="text-sm text-muted-foreground">Pool kosong.</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {teams.map((team, index) => {
            const power = team.members.reduce((total, member) => total + rankPower[member.player.rank], 0);
            const active = index === teamIndex && !isComplete;

            return (
              <div key={index} className={`rounded-lg border p-4 ${active ? "border-primary bg-teal-50" : "border-border bg-white"}`}>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Nama Team
                  <input
                    value={team.name}
                    onChange={(event) => updateTeamName(index, event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-black outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <div className="mt-3 flex items-center justify-between">
                    <Badge tone={active ? "primary" : "neutral"}>{team.members.length}/5</Badge>
                  <span className="text-xs font-black text-muted-foreground">Power {power}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {ROLES.map((role) => {
                    const member = team.members.find((item) => item.laneRole === role);
                    return (
                      <div key={role} className="grid grid-cols-[82px_1fr] gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                        <span className="text-xs font-black text-muted-foreground">{role}</span>
                        <span className="truncate font-bold">{member?.player.nickname ?? "-"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          {lastWinner ? `${lastWinner.nickname} masuk ${lastWinnerTeam}.` : `${unpickedPlayers.length} peserta belum dipilih.`}
        </p>
        <Button type="button" onClick={saveDraft} disabled={!seasonId || !isComplete || isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Menyimpan" : "Simpan Hasil Draft"}
        </Button>
      </div>
    </div>
  );
}
