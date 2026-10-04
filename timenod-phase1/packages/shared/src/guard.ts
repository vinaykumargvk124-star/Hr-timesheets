import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./db";
import { users, type Role } from "./schema";

/**
 * Loads the signed-in user fresh from the database on every request, so a role
 * change or deactivation takes effect immediately. Redirects to /login if there
 * is no valid session. `allowed` is false when the user's role is not in `roles`.
 */
export async function requireUser(roles?: Role[]) {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user || !user.active) redirect("/login");
  return { user, allowed: !roles || roles.includes(user.role) };
}
