"use server";

import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "node:path";
import { z } from "zod";
import { clearSession, isAdmin, setSession } from "@/lib/auth";
import { rankPower } from "@/lib/tournament";
import { generateBalancedTeams, generateRoundRobin } from "@/lib/tournament";
import { roleFromDb, roleToDb } from "@/lib/enum-map";
import { prisma } from "@/lib/prisma";
import { ROLES, type Player } from "@/lib/types";

const roleSchema = z.enum(["Jungler", "Mid Lane", "Gold Lane", "EXP Lane", "Roamer"]);
const rankSchema = z.enum(["Master", "Grandmaster", "Epic", "Legend", "Mythic"]);

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  nickname: z.string().min(2),
  mlId: z.string().min(4),
  phone: z.string().min(8),
  unit: z.string().min(2),
  rank: rankSchema,
  mainRole: roleSchema,
  secondRole: z.preprocess((value) => (value === "" ? undefined : value), roleSchema.optional())
});

const manualPlayerSchema = registerSchema.extend({
  verified: z.preprocess((value) => value === "on" || value === "true", z.boolean())
});

const updatePlayerSchema = z.object({
  playerId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(8).optional()),
  nickname: z.string().min(2),
  mlId: z.string().min(1),
  phone: z.string().min(1),
  unit: z.string().min(1),
  rank: rankSchema,
  mainRole: roleSchema,
  secondRole: z.preprocess((value) => (value === "" ? undefined : value), roleSchema.optional()),
  verified: z.preprocess((value) => value === "on" || value === "true", z.boolean())
});

const wheelDraftSchema = z.object({
  seasonId: z.string().min(1),
  teams: z.array(
    z.object({
      name: z.string().min(2),
      members: z.array(
        z.object({
          playerId: z.string().min(1),
          laneRole: roleSchema
        })
      ).length(5)
    })
  ).min(2),
  injectedTeams: z.array(z.string().min(2)).length(2).optional()
});

export async function registerPlayer(formData: FormData) {
  const payload = registerSchema.safeParse(Object.fromEntries(formData));
  if (!payload.success) {
    redirect("/register?error=invalid");
  }

  const data = payload.data;
  const password = await bcrypt.hash(data.password, 10);

  try {
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: data.name,
        email: data.email.toLowerCase(),
        password,
        role: "player",
        updatedAt: new Date(),
        player: {
          create: {
            id: randomUUID(),
            nickname: data.nickname,
            mlId: data.mlId,
            phone: data.phone,
            unit: data.unit,
            rank: data.rank,
            mainRole: roleToDb[data.mainRole] as never,
            secondRole: data.secondRole ? (roleToDb[data.secondRole] as never) : undefined,
            updatedAt: new Date()
          }
        }
      }
    });
  } catch {
    redirect("/register?error=exists");
  }

  redirect("/login?registered=1");
}

export async function createManualPlayer(formData: FormData) {
  await assertAdmin();

  const payload = manualPlayerSchema.safeParse(Object.fromEntries(formData));
  if (!payload.success) {
    redirect("/admin?playerError=invalid");
  }

  const data = payload.data;
  const password = await bcrypt.hash(data.password, 10);

  try {
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: data.name,
        email: data.email.toLowerCase(),
        password,
        role: "player",
        updatedAt: new Date(),
        player: {
          create: {
            id: randomUUID(),
            nickname: data.nickname,
            mlId: data.mlId,
            phone: data.phone,
            unit: data.unit,
            rank: data.rank,
            mainRole: roleToDb[data.mainRole] as never,
            secondRole: data.secondRole ? (roleToDb[data.secondRole] as never) : undefined,
            verified: data.verified,
            updatedAt: new Date()
          }
        }
      }
    });
  } catch {
    redirect("/admin?playerError=exists");
  }

  revalidateAll();
  redirect("/admin?playerAdded=1");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/login?error=1");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) redirect("/login?error=1");

  await setSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutUser() {
  await clearSession();
  redirect("/login");
}

export async function createSeason(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") || "Season Internal 2026");

  await prisma.season.create({
    data: { id: randomUUID(), name, status: "draft", updatedAt: new Date() }
  });

  revalidateAll();
  redirect("/admin?notice=season-created");
}

export async function setSeasonStatus(formData: FormData) {
  await assertAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");
  const status = String(formData.get("status") ?? "draft");

  await prisma.season.update({
    where: { id: seasonId },
    data: { status: status as never }
  });

  revalidateAll();
  redirect("/admin?notice=status-updated");
}

export async function verifyPlayer(formData: FormData) {
  await assertAdmin();
  const playerId = String(formData.get("playerId") ?? "");

  await prisma.player.update({
    where: { id: playerId },
    data: { verified: true }
  });

  revalidateAll();
  redirect("/admin?notice=player-verified");
}

export async function verifyAllPlayers() {
  await assertAdmin();
  await prisma.player.updateMany({ data: { verified: true } });
  revalidateAll();
  redirect("/admin?notice=all-verified");
}

export async function updatePlayer(formData: FormData) {
  await assertAdmin();

  const payload = updatePlayerSchema.safeParse(Object.fromEntries(formData));
  if (!payload.success) {
    redirect("/admin?editError=invalid");
  }

  const data = payload.data;
  const password = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  try {
    await prisma.player.update({
      where: { id: data.playerId },
      data: {
        nickname: data.nickname,
        mlId: data.mlId,
        phone: data.phone,
        unit: data.unit,
        rank: data.rank,
        mainRole: roleToDb[data.mainRole] as never,
        secondRole: data.secondRole ? (roleToDb[data.secondRole] as never) : null,
        verified: data.verified,
        user: {
          update: {
            name: data.name,
            email: data.email.toLowerCase(),
            ...(password ? { password } : {})
          }
        }
      }
    });

    await refreshTeamPowers();
  } catch {
    redirect("/admin?editError=exists");
  }

  revalidateAll();
  redirect("/admin?editSaved=1");
}

export async function generateTeamsAction(formData: FormData) {
  await assertAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");

  const dbPlayers = await prisma.player.findMany({
    where: { verified: true },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const players: Player[] = dbPlayers.map((player) => ({
    id: player.id,
    name: player.user.name,
    nickname: player.nickname,
    mlId: player.mlId,
    phone: player.phone,
    unit: player.unit,
    rank: player.rank,
    mainRole: roleFromDb[player.mainRole],
    secondRole: player.secondRole ? roleFromDb[player.secondRole] : undefined,
    verified: player.verified
  }));

  const teams = generateBalancedTeams(players);
  if (!teams.length) redirect("/admin?error=not-enough-players");

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { seasonId } });
    await tx.teammember.deleteMany({ where: { team: { seasonId } } });
    await tx.team.deleteMany({ where: { seasonId } });

    for (const team of teams) {
      await tx.team.create({
        data: {
          id: randomUUID(),
          seasonId,
          teamName: team.name,
          power: team.power,
          updatedAt: new Date(),
          teammember: {
            create: team.members.map((member) => ({
              id: randomUUID(),
              playerId: member.player.id,
              laneRole: roleToDb[member.laneRole] as never
            }))
          }
        }
      });
    }

    await tx.season.update({
      where: { id: seasonId },
      data: { status: "locked" }
    });
  });

  revalidateAll();
  redirect("/admin?notice=teams-generated");
}

export async function resetTeamsAction(formData: FormData) {
  await assertAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) redirect("/admin?error=season-not-found");

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { seasonId } });
    await tx.teammember.deleteMany({ where: { team: { seasonId } } });
    await tx.team.deleteMany({ where: { seasonId } });
    await tx.season.update({
      where: { id: seasonId },
      data: { status: "registration" }
    });
  });

  revalidateAll();
  redirect("/admin?teamsReset=1");
}

export async function saveWheelDraftTeams(formData: FormData) {
  await assertAdmin();

  const rawTeams = String(formData.get("teams") ?? "");
  const rawInjectedTeams = String(formData.get("injectedTeams") ?? "[]");
  const seasonId = String(formData.get("seasonId") ?? "");
  const parsedJson = safeJsonParse(rawTeams);
  const parsedInjectedTeams = safeJsonParse(rawInjectedTeams);
  const payload = wheelDraftSchema.safeParse({ seasonId, teams: parsedJson, injectedTeams: parsedInjectedTeams });

  if (!payload.success) {
    redirect("/admin?draftError=invalid");
  }

  const data = payload.data;
  const memberIds = data.teams.flatMap((team) => team.members.map((member) => member.playerId));
  const uniqueMemberIds = new Set(memberIds);

  if (uniqueMemberIds.size !== memberIds.length) {
    redirect("/admin?draftError=duplicate");
  }

  for (const team of data.teams) {
    const laneRoles = new Set(team.members.map((member) => member.laneRole));
    if (laneRoles.size !== ROLES.length) {
      redirect("/admin?draftError=roles");
    }
  }

  const players = await prisma.player.findMany({
    where: {
      id: { in: [...uniqueMemberIds] },
      verified: true
    }
  });

  if (players.length !== uniqueMemberIds.size) {
    redirect("/admin?draftError=players");
  }

  const playerById = new Map(players.map((player) => [player.id, player]));

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { seasonId: data.seasonId } });
    await tx.teammember.deleteMany({ where: { team: { seasonId: data.seasonId } } });
    await tx.team.deleteMany({ where: { seasonId: data.seasonId } });

    for (const team of data.teams) {
      const power = team.members.reduce((total, member) => {
        const player = playerById.get(member.playerId);
        return total + (player ? rankPower[player.rank] : 0);
      }, 0);

      await tx.team.create({
        data: {
          id: randomUUID(),
          seasonId: data.seasonId,
          teamName: team.name,
          power,
          updatedAt: new Date(),
          teammember: {
            create: team.members.map((member) => ({
              id: randomUUID(),
              playerId: member.playerId,
              laneRole: roleToDb[member.laneRole] as never
            }))
          }
        }
      });
    }

    const extraTeams = (data.injectedTeams ?? ["MACTEL", "DISBUDPORA"]).slice(0, 2);
    for (const teamName of extraTeams) {
      await tx.team.create({
        data: {
          id: randomUUID(),
          seasonId: data.seasonId,
          teamName,
          power: 0,
          updatedAt: new Date()
        }
      });
    }

    await tx.season.update({
      where: { id: data.seasonId },
      data: { status: "locked" }
    });
  });

  revalidateAll();
  redirect("/admin?draftSaved=1");
}

export async function generateScheduleAction(formData: FormData) {
  await assertAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");

  const dbTeams = await prisma.team.findMany({
    where: { seasonId },
    include: {
      teammember: {
        include: {
          player: {
            include: { user: true }
          }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const teams = dbTeams.map((team) => ({
    id: team.id,
    name: team.teamName,
    power: team.power,
    members: team.teammember.map((member) => ({
      laneRole: roleFromDb[member.laneRole],
      player: {
        id: member.player.id,
        name: member.player.user.name,
        nickname: member.player.nickname,
        mlId: member.player.mlId,
        phone: member.player.phone,
        unit: member.player.unit,
        rank: member.player.rank,
        mainRole: roleFromDb[member.player.mainRole],
        secondRole: member.player.secondRole ? roleFromDb[member.player.secondRole] : undefined,
        verified: member.player.verified
      }
    }))
  }));

  const schedule = generateRoundRobin(teams);

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { seasonId } });
    await tx.match.createMany({
      data: schedule.map((match) => ({
        id: randomUUID(),
        seasonId,
        week: match.week,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        updatedAt: new Date()
      }))
    });
    await tx.season.update({
      where: { id: seasonId },
      data: { status: "league" }
    });
  });

  revalidateAll();
  redirect("/admin?notice=schedule-generated");
}

export async function updateLiveScore(formData: FormData) {
  await assertAdmin();

  const matchId = String(formData.get("matchId") ?? "");
  const scoreA = Math.max(0, Number(formData.get("scoreA") ?? 0));
  const scoreB = Math.max(0, Number(formData.get("scoreB") ?? 0));
  const mvpNickname = String(formData.get("mvp") ?? "").trim();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) redirect("/admin?error=match-not-found");

  const mvp = mvpNickname
    ? await prisma.player.findFirst({ where: { nickname: { equals: mvpNickname } } })
    : null;

  await prisma.match.update({
    where: { id: matchId },
    data: {
      scoreA,
      scoreB,
      ...(mvpNickname ? { mvpId: mvp?.id } : {})
    }
  });

  revalidateAll();
  redirect("/admin?notice=live-updated");
}

export async function saveMatchGameResult(formData: FormData) {
  await assertAdmin();

  const matchId = String(formData.get("matchId") ?? "");
  const gameNumber = Number(formData.get("gameNumber") ?? 0);
  const winnerId = String(formData.get("winnerId") ?? "");
  const mvpNickname = String(formData.get("mvp") ?? "").trim();
  const mvpKills = Math.max(0, Number(formData.get("mvpKills") ?? 0));
  const mvpDeaths = Math.max(0, Number(formData.get("mvpDeaths") ?? 0));
  const mvpAssists = Math.max(0, Number(formData.get("mvpAssists") ?? 0));
  const screenshotFile = formData.get("screenshot");
  const screenshotUrlInput = String(formData.get("screenshotUrl") ?? "").trim();

  if (!matchId || ![1, 2, 3, 4, 5].includes(gameNumber) || !winnerId) {
    redirect("/admin?gameError=invalid");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { season: true }
  });
  if (!match) redirect("/admin?gameError=match");

  const mvp = mvpNickname
    ? await prisma.player.findFirst({ where: { nickname: { equals: mvpNickname } } })
    : null;
  const screenshotUrl = (await saveScreenshotFile(screenshotFile, matchId, gameNumber)) || screenshotUrlInput || undefined;

  await prisma.$transaction(async (tx) => {
    await tx.matchgame.upsert({
      where: {
        matchId_gameNumber: {
          matchId,
          gameNumber
        }
      },
      update: {
        winnerId,
        mvpId: mvp?.id,
        mvpKills,
        mvpDeaths,
        mvpAssists,
        ...(screenshotUrl ? { screenshotUrl } : {})
      },
      create: {
        id: randomUUID(),
        matchId,
        gameNumber,
        winnerId,
        mvpId: mvp?.id,
        mvpKills,
        mvpDeaths,
        mvpAssists,
        screenshotUrl,
        updatedAt: new Date()
      }
    });

    const games = await tx.matchgame.findMany({ where: { matchId } });
    const teamAWins = games.filter((game) => game.winnerId === match.teamAId).length;
    const teamBWins = games.filter((game) => game.winnerId === match.teamBId).length;
    const isLeagueStage = match.season.status === "league";
    const maxWeekInSeason = await tx.match.aggregate({
      where: { seasonId: match.seasonId },
      _max: { week: true }
    });
    const isGrandFinal = match.season.status === "playoff" && match.week === (maxWeekInSeason._max.week ?? match.week);
    const targetWins = isLeagueStage ? 2 : isGrandFinal ? 3 : 2;
    const finalWinnerId = teamAWins >= targetWins ? match.teamAId : teamBWins >= targetWins ? match.teamBId : null;
    const topMvp = getMostFrequent(games.map((game) => game.mvpId).filter(Boolean) as string[]);

    await tx.match.update({
      where: { id: matchId },
      data: {
        scoreA: teamAWins,
        scoreB: teamBWins,
        winnerId: finalWinnerId,
        mvpId: topMvp ?? mvp?.id
      }
    });
  });

  revalidateAll();
  redirect("/admin?gameSaved=1");
}

export async function saveMatchResult(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId") ?? "");
  const scoreA = Number(formData.get("scoreA") ?? 0);
  const scoreB = Number(formData.get("scoreB") ?? 0);
  const mvpNickname = String(formData.get("mvp") ?? "").trim();
  const screenshotUrl = String(formData.get("screenshotUrl") ?? "").trim();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) redirect("/admin?error=match-not-found");

  const winnerId = scoreA >= scoreB ? match.teamAId : match.teamBId;
  const mvp = mvpNickname
    ? await prisma.player.findFirst({ where: { nickname: { equals: mvpNickname } } })
    : null;

  await prisma.match.update({
    where: { id: matchId },
    data: {
      scoreA,
      scoreB,
      winnerId,
      mvpId: mvp?.id,
      screenshotUrl: screenshotUrl || undefined
    }
  });

  revalidateAll();
  redirect("/admin?notice=match-saved");
}

export async function moveTeamMemberAction(formData: FormData) {
  await assertAdmin();

  const sourceTeamId = String(formData.get("sourceTeamId") ?? "");
  const sourcePlayerId = String(formData.get("sourcePlayerId") ?? "");
  const targetPlayerId = String(formData.get("targetPlayerId") ?? "");

  if (!sourceTeamId || !sourcePlayerId || !targetPlayerId || sourcePlayerId === targetPlayerId) {
    redirect("/teams?moveError=invalid");
  }

  await prisma.$transaction(async (tx) => {
    const sourceMember = await tx.teammember.findUnique({
      where: { teamId_playerId: { teamId: sourceTeamId, playerId: sourcePlayerId } }
    });
    if (!sourceMember) redirect("/teams?moveError=source-not-found");

    const targetMember = await tx.teammember.findFirst({
      where: { playerId: targetPlayerId }
    });
    if (!targetMember) redirect("/teams?moveError=target-not-found");
    if (targetMember.teamId === sourceTeamId) redirect("/teams?moveError=same-team");

    await tx.$executeRawUnsafe(
      `
        UPDATE teammember
        SET teamId = CASE
          WHEN id = ? THEN ?
          WHEN id = ? THEN ?
        END
        WHERE id IN (?, ?)
      `,
      sourceMember.id,
      targetMember.teamId,
      targetMember.id,
      sourceTeamId,
      sourceMember.id,
      targetMember.id
    );
  });

  await refreshTeamPowers();
  revalidateAll();
  revalidatePath("/teams");
  redirect("/teams?moveSaved=1");
}

async function assertAdmin() {
  if (!(await isAdmin())) {
    redirect("/login?error=admin");
  }
}

function revalidateAll() {
  ["/", "/admin", "/dashboard", "/season", "/teams", "/schedule", "/standings"].forEach((path) =>
    revalidatePath(path)
  );
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getMostFrequent(items: string[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

async function saveScreenshotFile(file: FormDataEntryValue | null, matchId: string, gameNumber: number) {
  if (!(file instanceof File) || !file.size) return null;
  if (!file.type.startsWith("image/")) return null;

  const extension = path.extname(file.name).toLowerCase() || ".png";
  const safeExtension = [".png", ".jpg", ".jpeg", ".webp"].includes(extension) ? extension : ".png";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "screenshots");
  const fileName = `${matchId}-game-${gameNumber}-${Date.now()}${safeExtension}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

  return `/uploads/screenshots/${fileName}`;
}

async function refreshTeamPowers() {
  const teams = await prisma.team.findMany({
    include: {
      teammember: {
        include: {
          player: true
        }
      }
    }
  });

  await prisma.$transaction(
    teams.map((team) =>
      prisma.team.update({
        where: { id: team.id },
        data: {
          power: team.teammember.reduce((total, member) => total + rankPower[member.player.rank], 0)
        }
      })
    )
  );
}
