import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type LiveScoreOverlayState = {
  matchId: string;
  scoreA: number;
  scoreB: number;
  mvp?: string;
  updatedAt: string;
};

const liveScorePath = path.join(process.cwd(), ".data", "live-score-overlay.json");

export async function readLiveScoreOverlayState(): Promise<LiveScoreOverlayState | null> {
  try {
    const raw = await readFile(liveScorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LiveScoreOverlayState>;
    if (!parsed.matchId || typeof parsed.scoreA !== "number" || typeof parsed.scoreB !== "number" || !parsed.updatedAt) {
      return null;
    }

    return {
      matchId: parsed.matchId,
      scoreA: Math.max(0, parsed.scoreA),
      scoreB: Math.max(0, parsed.scoreB),
      mvp: parsed.mvp,
      updatedAt: parsed.updatedAt
    };
  } catch {
    return null;
  }
}

export async function writeLiveScoreOverlayState(state: Omit<LiveScoreOverlayState, "updatedAt">) {
  await mkdir(path.dirname(liveScorePath), { recursive: true });
  await writeFile(
    liveScorePath,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

export async function clearLiveScoreOverlayState() {
  try {
    await unlink(liveScorePath);
  } catch {
    // Nothing to reset when the overlay state file does not exist.
  }
}
