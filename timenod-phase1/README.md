# TimeNod (Hr-timesheets)

Timesheet upload and approval for a consulting company.

- **Employee site** (`apps/employee`, port 3000): consultants upload screenshots of their client-approved timesheets.
- **Approver site** (`apps/approver`, port 3001): approvers review the screenshots and approve or reject.
- **Shared code** (`packages/shared`): database schema, sign-in, role checks and common UI.

Stack: Next.js 15, Auth.js (next-auth v5), PostgreSQL, Drizzle ORM.

## Status

Phase 1 is done: project structure, database schema and sign-in on both sites.
Uploading and approving timesheets are not built yet. See [docs/PLAN.md](docs/PLAN.md).

## Sign-in

An admin adds each user first. A user can then sign in either way:

- **Google**: any Google account, but only if its email was already added.
- **Email and password**: the user sets their own password through a single-use link (valid 72 hours). The admin never sees it.

Five wrong passwords lock the account for 15 minutes. The approver site only admits the `APPROVER` and `ADMIN` roles.

## Run locally

```bash
cp .env.example .env        # then fill in AUTH_SECRET and the Google keys
docker compose up -d        # PostgreSQL
npm install
npm run db:migrate
npm run create-user -- you@example.com "Your Name" ADMIN   # prints a set-password link
npm run dev:employee        # http://localhost:3000
npm run dev:approver        # http://localhost:3001
```

Until the admin page exists, `npm run create-user` is how users are added. Running it again for the same email issues a fresh link.

## Database changes

Edit `packages/shared/src/schema.ts`, then run `npm run db:generate` to create a migration and `npm run db:migrate` to apply it.
