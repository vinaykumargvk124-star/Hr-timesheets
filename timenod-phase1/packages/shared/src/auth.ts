import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./schema";

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name: string };
  }
}

async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await findUserByEmail(email);
        if (!user || !user.active || !user.passwordHash) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        if (!(await bcrypt.compare(password, user.passwordHash))) {
          const failed = user.failedLogins + 1;
          const lock = failed >= MAX_FAILED_LOGINS;
          await db
            .update(users)
            .set({
              failedLogins: lock ? 0 : failed,
              lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
            })
            .where(eq(users.id, user.id));
          return null;
        }

        if (user.failedLogins || user.lockedUntil) {
          await db.update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, user.id));
        }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    // Any Google account can try, but only emails an admin has already added get in.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified !== true) return false;
      const user = await findUserByEmail(profile.email);
      return Boolean(user?.active);
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        token.uid = (await findUserByEmail(profile.email))?.id;
      } else if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
