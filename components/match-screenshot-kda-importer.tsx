"use client";

import { useMemo, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { ActionSubmitButton } from "@/components/ui/action-submit-button";
import { Button } from "@/components/ui/button";
import type { Match, Team } from "@/lib/types";

type Props = { matches: Match[]; teams: Team[] };

type Row = { playerId: string; nickname: string; kills: number; deaths: number; assists: number };

export function MatchScreenshotKdaImporter({ matches, teams }: Props) {
  const pendingMatches = matches.filter((match) => match.scoreA === undefined || match.scoreB === undefined || !match.winnerId);
  const [matchId, setMatchId] = useState(pendingMatches[0]?.id ?? matches[0]?.id ?? "");
  const [preview, setPreview] = useState<string>();
  const [ocrText, setOcrText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [ocrStatus, setOcrStatus] = useState<string>();
  const [isReadingOcr, setIsReadingOcr] = useState(false);
  const selectedMatch = matches.find((match) => match.id === matchId);

  const matchPlayers = useMemo(() => {
    if (!selectedMatch) return [];
    return teams
      .filter((team) => team.id === selectedMatch.teamAId || team.id === selectedMatch.teamBId)
      .flatMap((team) => team.members.map((member) => member.player));
  }, [selectedMatch, teams]);

  function updateRow(playerId: string, field: "kills" | "deaths" | "assists", value: number) {
    const baseRows = rows.length ? rows : matchPlayers.map((player) => ({ playerId: player.id, nickname: player.nickname, kills: 0, deaths: 0, assists: 0 }));
    setRows(baseRows.map((row) => row.playerId === playerId ? { ...row, [field]: Math.max(0, value) } : row));
  }

  async function readKdaFromScreenshot(file?: File) {
    if (!file) {
      setOcrStatus("Pilih screenshot dulu sebelum OCR otomatis.");
      return;
    }

    setIsReadingOcr(true);
    setOcrStatus("Membaca screenshot dengan OCR...");
    try {
      const tesseract = await import("tesseract.js");
      const result = await tesseract.recognize(file, "eng", {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setOcrStatus(`OCR berjalan ${Math.round((message.progress ?? 0) * 100)}%`);
          }
        }
      });
      const text = result.data.text.trim();
      setOcrText(text);
      autofillFromText(text);
      setOcrStatus(text ? "OCR selesai. KDA otomatis diisi, silakan cek ulang angka sebelum simpan." : "OCR selesai tapi teks tidak terbaca. Coba crop scoreboard lebih jelas.");
    } catch (error) {
      console.error(error);
      setOcrStatus("OCR gagal dijalankan. Pastikan tesseract.js sudah ter-install dan coba lagi.");
    } finally {
      setIsReadingOcr(false);
    }
  }

  function autofillFromText(sourceText = ocrText) {
    const nextRows = matchPlayers.map((player) => {
      const escaped = player.nickname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const line = sourceText.split(/\n+/).find((item) => new RegExp(escaped, "i").test(item));
      const numbers = line?.match(/\b\d{1,2}\b/g)?.map(Number) ?? [];
      const kda = numbers.length >= 3 ? numbers.slice(-4, -1).length === 3 ? numbers.slice(-4, -1) : numbers.slice(-3) : [0, 0, 0];
      return { playerId: player.id, nickname: player.nickname, kills: kda[0] ?? 0, deaths: kda[1] ?? 0, assists: kda[2] ?? 0 };
    });
    setRows(nextRows);
  }

  return (
    <form action="/api/admin/match-kda-import" method="post" encType="multipart/form-data" className="space-y-4 rounded-md border border-border bg-white p-4">
      <div>
        <p className="text-sm font-black">Upload SS Hasil & Auto Isi KDA Player</p>
        <p className="text-xs text-muted-foreground">Upload screenshot hasil pertandingan; sistem akan mencoba OCR otomatis dengan tesseract.js lalu mengisi K/D/A semua member match.</p>
      </div>
      <label className="block text-sm font-semibold">
        Match Series
        <select name="matchId" value={matchId} onChange={(event) => setMatchId(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
          {matches.map((match) => (
            <option key={match.id} value={match.id}>Day {match.week}: {match.teamAName} vs {match.teamBName}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Game
          <select name="gameNumber" className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
            {[1, 2, 3, 4, 5].map((game) => <option key={game} value={game}>Game {game}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Screenshot hasil
          <input name="screenshot" type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : undefined);
            void readKdaFromScreenshot(file);
          }} className="mt-2 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm" />
        </label>
      </div>
      {preview && <img src={preview} alt="Preview screenshot hasil" className="max-h-56 w-full rounded-md border border-border object-contain" />}
      <label className="block text-sm font-semibold">
        Teks OCR / salinan scoreboard
        <textarea value={ocrText} onChange={(event) => setOcrText(event.target.value)} className="mt-2 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Tempel hasil OCR di sini. Sistem akan mencari nickname dan angka K/D/A pada baris yang sama." />
      </label>
      {ocrStatus && <p className="rounded-md bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">{ocrStatus}</p>}
      <Button type="button" variant="secondary" onClick={() => autofillFromText()} disabled={isReadingOcr} className="w-full">
        {isReadingOcr ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Auto-fill KDA dari teks
      </Button>
      <div className="space-y-2">
        {(rows.length ? rows : matchPlayers.map((player) => ({ playerId: player.id, nickname: player.nickname, kills: 0, deaths: 0, assists: 0 }))).map((row, index) => (
          <div key={row.playerId} className="grid grid-cols-[1fr_70px_70px_70px] gap-2 rounded-md bg-muted p-2 text-sm">
            <input type="hidden" name={`stats[${index}][playerId]`} value={row.playerId} />
            <span className="self-center font-semibold">{row.nickname}</span>
            {(["kills", "deaths", "assists"] as const).map((field) => (
              <input key={field} name={`stats[${index}][${field}]`} type="number" min="0" value={row[field]} onChange={(event) => updateRow(row.playerId, field, Number(event.target.value))} className="h-9 rounded-md border border-border px-2" aria-label={`${field} ${row.nickname}`} />
            ))}
          </div>
        ))}
      </div>
      <ActionSubmitButton className="w-full" label="Simpan KDA dari Screenshot" pendingLabel="Menyimpan KDA..." />
    </form>
  );
}
