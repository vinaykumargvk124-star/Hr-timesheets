/**
 * Adds a user and prints a set-password link. Stand-in for the admin page.
 *   npm run create-user -- <email> "<name>" [EMPLOYEE|APPROVER|ADMIN]
 * Running it again for an existing email issues a fresh link (and updates name/role).
 */
import { db, pool } from "../src/db";
import { createPasswordToken } from "../src/password";
import { roleEnum, users, type Role } from "../src/schema";

async function main() {
  const [emailArg, name, roleArg = "EMPLOYEE"] = process.argv.slice(2);
  const role = roleArg.toUpperCase() as Role;
  if (!emailArg || !name || !roleEnum.enumValues.includes(role)) {
    console.error('Usage: npm run create-user -- <email> "<name>" [EMPLOYEE|APPROVER|ADMIN]');
    process.exitCode = 1;
    return;
  }
  const email = emailArg.trim().toLowerCase();
  const [user] = await db
    .insert(users)
    .values({ email, name, role })
    .onConflictDoUpdate({ target: users.email, set: { name, role, active: true } })
    .returning();
  const token = await createPasswordToken(user.id);
  const base =
    role === "EMPLOYEE"
      ? process.env.EMPLOYEE_SITE_URL ?? "http://localhost:3000"
      : process.env.APPROVER_SITE_URL ?? "http://localhost:3001";
  console.log(`User ${user.email} (${user.role}) is ready.`);
  console.log("They can sign in with Google using this email, or set a password here (valid 72h):");
  console.log(`${base}/set-password?token=${token}`);
}

main().finally(() => pool.end());
