import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_GAMES = new Set([1, 2, 3, 4, 5]);

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return redirectAfterPost(request, "/login?error=admin");
  }

  const formData = await request.formData();
  const matchId = String(formData.get("matchId") ?? "");
  const gameNumber = Number(formData.get("gameNumber") ?? 0);
  if (!matchId || !VALID_GAMES.has(gameNumber)) {
    return redirectAfterPost(request, "/admin?gameError=invalid");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      team_match_teamAIdToteam: { include: { teammember: true } },
      team_match_teamBIdToteam: { include: { teammember: true } }
    }
  });
  if (!match) return redirectAfterPost(request, "/admin?gameError=match");

  const allowedPlayerIds = new Set([
    ...match.team_match_teamAIdToteam.teammember.map((member) => member.playerId),
    ...match.team_match_teamBIdToteam.teammember.map((member) => member.playerId)
  ]);
  const stats = extractStats(formData).filter((stat) => allowedPlayerIds.has(stat.playerId));
  if (!stats.length) return redirectAfterPost(request, "/admin?gameError=invalid");

  const screenshotUrl = await saveScreenshotFile(formData.get("screenshot"), matchId, gameNumber);

  await prisma.$transaction(async (tx) => {
    const game = await tx.matchgame.upsert({
      where: { matchId_gameNumber: { matchId, gameNumber } },
      update: { ...(screenshotUrl ? { screenshotUrl } : {}), updatedAt: new Date() },
      create: {
        id: randomUUID(),
        matchId,
        gameNumber,
        updatedAt: new Date(),
        ...(screenshotUrl ? { screenshotUrl } : {})
      }
    });

    for (const stat of stats) {
      await tx.matchgamestat.upsert({
        where: { matchGameId_playerId: { matchGameId: game.id, playerId: stat.playerId } },
        update: { kills: stat.kills, deaths: stat.deaths, assists: stat.assists, updatedAt: new Date() },
        create: { id: randomUUID(), matchGameId: game.id, playerId: stat.playerId, kills: stat.kills, deaths: stat.deaths, assists: stat.assists, updatedAt: new Date() }
      });
    }
  });

  ["/", "/admin", "/dashboard", "/season", "/teams", "/schedule", "/standings", "/bracket"].forEach((url) => revalidatePath(url));
  return redirectAfterPost(request, "/admin?gameSaved=1");
}

function extractStats(formData: FormData) {
  const stats: Array<{ playerId: string; kills: number; deaths: number; assists: number }> = [];
  for (let index = 0; index < 10; index += 1) {
    const playerId = String(formData.get(`stats[${index}][playerId]`) ?? "");
    if (!playerId) continue;
    stats.push({
      playerId,
      kills: Math.max(0, Number(formData.get(`stats[${index}][kills]`) ?? 0)),
      deaths: Math.max(0, Number(formData.get(`stats[${index}][deaths]`) ?? 0)),
      assists: Math.max(0, Number(formData.get(`stats[${index}][assists]`) ?? 0))
    });
  }
  return stats;
}

async function saveScreenshotFile(fileInput: FormDataEntryValue | null, matchId: string, gameNumber: number) {
  if (!(fileInput instanceof File) || fileInput.size === 0) return undefined;
  const bytes = Buffer.from(await fileInput.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads", "match-results");
  await mkdir(uploadDir, { recursive: true });
  const extension = path.extname(fileInput.name).toLowerCase() || ".png";
  const safeName = `${matchId}-${gameNumber}-${Date.now()}${extension}`;
  await writeFile(path.join(uploadDir, safeName), bytes);
  return `/uploads/match-results/${safeName}`;
}

function redirectAfterPost(request: Request, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url), 303);
}
