import {
  boolean, date, index, integer, numeric, pgEnum, pgTable, text, timestamp, unique, uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["EMPLOYEE", "APPROVER", "ADMIN"]);
export const periodTypeEnum = pgEnum("period_type", ["WEEKLY", "BIWEEKLY", "MONTHLY"]);
export const timesheetStatusEnum = pgEnum("timesheet_status", ["SUBMITTED", "APPROVED", "REJECTED"]);

export type Role = (typeof roleEnum.enumValues)[number];

const id = () => uuid("id").primaryKey().defaultRandom();
const ts = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(), // always stored lowercase
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("EMPLOYEE"),
  active: boolean("active").notNull().default(true),
  passwordHash: text("password_hash"),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: ts("locked_until"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

/** Single-use link that lets a user set their own password. Only the hash is stored. */
export const passwordTokens = pgTable("password_tokens", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: ts("expires_at").notNull(),
  usedAt: ts("used_at"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: id(),
  name: text("name").notNull().unique(),
});

export const projects = pgTable("projects", {
  id: id(),
  name: text("name").notNull(),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  periodType: periodTypeEnum("period_type").notNull().default("WEEKLY"),
});

/** Which consultant works on which project. */
export const assignments = pgTable(
  "assignments",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id),
    projectId: uuid("project_id").notNull().references(() => projects.id),
  },
  (t) => [unique().on(t.userId, t.projectId)],
);

export const timesheets = pgTable(
  "timesheets",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id),
    projectId: uuid("project_id").notNull().references(() => projects.id),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    hours: numeric("hours", { precision: 6, scale: 2 }).notNull(),
    note: text("note"),
    status: timesheetStatusEnum("status").notNull().default("SUBMITTED"),
    submittedAt: ts("submitted_at").notNull().defaultNow(),
  },
  (t) => [index().on(t.status), index().on(t.userId, t.periodStart)],
);

/** Screenshot or PDF proving the hours. The file itself lives in private storage. */
export const attachments = pgTable("attachments", {
  id: id(),
  timesheetId: uuid("timesheet_id").notNull().references(() => timesheets.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  uploadedAt: ts("uploaded_at").notNull().defaultNow(),
});

/** Audit trail: one row per approve/reject decision. */
export const approvals = pgTable("approvals", {
  id: id(),
  timesheetId: uuid("timesheet_id").notNull().references(() => timesheets.id, { onDelete: "cascade" }),
  approverId: uuid("approver_id").notNull().references(() => users.id),
  decision: timesheetStatusEnum("decision").notNull(),
  comment: text("comment"),
  decidedAt: ts("decided_at").notNull().defaultNow(),
});
