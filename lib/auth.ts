import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const cookieName = "ml_league_session";

function getSecret() {
  return process.env.NEXTAUTH_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function setSession(userId: string) {
  const jar = await cookies();
  const value = `${userId}.${sign(userId)}`;
  jar.set(cookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(cookieName);
}

export async function getCurrentUser() {
  if (!process.env.DATABASE_URL) return null;

  const jar = await cookies();
  const raw = jar.get(cookieName)?.value;
  if (!raw) return null;

  const [userId, signature] = raw.split(".");
  if (!userId || !signature) return null;

  const expected = sign(userId);
  const valid =
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { player: true }
    });
  } catch {
    return null;
  }
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
