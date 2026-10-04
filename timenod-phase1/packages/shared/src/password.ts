import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "./db";
import { passwordTokens, users } from "./schema";

export const MIN_PASSWORD_LENGTH = 10;
const TOKEN_TTL_HOURS = 72;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Creates a single-use set-password token. Only its hash is stored. */
export async function createPasswordToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.insert(passwordTokens).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000),
  });
  return token;
}

export async function findValidToken(token: string) {
  if (!token) return null;
  const [row] = await db
    .select({ id: passwordTokens.id, usedAt: passwordTokens.usedAt, expiresAt: passwordTokens.expiresAt, user: users })
    .from(passwordTokens)
    .innerJoin(users, eq(users.id, passwordTokens.userId))
    .where(eq(passwordTokens.tokenHash, hashToken(token)));
  if (!row || row.usedAt || row.expiresAt < new Date() || !row.user.active) return null;
  return row;
}

/** Returns an error message, or null on success. */
export async function setPasswordWithToken(token: string, password: string): Promise<string | null> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  const row = await findValidToken(token);
  if (!row) return "This link is invalid or has expired. Ask your admin for a new one.";
  const passwordHash = await bcrypt.hash(password, 12);
  // Claim the token atomically so it cannot be used twice.
  const claimed = await db
    .update(passwordTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordTokens.id, row.id), isNull(passwordTokens.usedAt)))
    .returning({ id: passwordTokens.id });
  if (claimed.length !== 1) return "This link has already been used.";
  await db
    .update(users)
    .set({ passwordHash, failedLogins: 0, lockedUntil: null })
    .where(eq(users.id, row.user.id));
  return null;
}
